import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("serviceCategories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const listByCategory = query({
  args: { 
    category: v.string(),
    userLat: v.optional(v.number()),
    userLng: v.optional(v.number()),
    radius: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const services = await ctx.db
      .query("services")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const servicesWithProviders = await Promise.all(
      services.map(async (service) => {
        const provider = await ctx.db.get(service.providerId);
        if (!provider) return null;

        // Filter by location if provided
        if (args.userLat && args.userLng && args.radius) {
          const distance = calculateDistance(
            args.userLat,
            args.userLng,
            provider.serviceArea.lat,
            provider.serviceArea.lng
          );
          if (distance > args.radius) return null;
        }

        return {
          ...service,
          provider: {
            _id: provider._id,
            businessName: provider.businessName,
            rating: provider.rating,
            totalReviews: provider.totalReviews,
            isVerified: provider.isVerified,
          },
        };
      })
    );

    return servicesWithProviders.filter((s) => s !== null);
  },
});

export const getById = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) return null;

    const provider = await ctx.db.get(service.providerId);
    if (!provider) return null;

    const reviews = await ctx.db
      .query("serviceReviews")
      .withIndex("by_service", (q) => q.eq("serviceId", args.serviceId))
      .collect();

    return {
      ...service,
      provider,
      reviews,
    };
  },
});

export const getProviderById = query({
  args: { providerId: v.id("serviceProviders") },
  handler: async (ctx, args) => {
    const provider = await ctx.db.get(args.providerId);
    if (!provider) return null;

    const services = await ctx.db
      .query("services")
      .withIndex("by_provider", (q) => q.eq("providerId", args.providerId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const reviews = await ctx.db
      .query("serviceReviews")
      .withIndex("by_provider", (q) => q.eq("providerId", args.providerId))
      .collect();

    return {
      ...provider,
      services,
      reviews,
    };
  },
});

export const createBooking = mutation({
  args: {
    serviceId: v.id("services"),
    scheduledDate: v.string(),
    scheduledTime: v.string(),
    address: v.string(),
    lat: v.number(),
    lng: v.number(),
    notes: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
    recurringFrequency: v.optional(v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly")
    )),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    const bookingId = await ctx.db.insert("serviceBookings", {
      userId: user._id,
      serviceId: args.serviceId,
      providerId: service.providerId,
      scheduledDate: args.scheduledDate,
      scheduledTime: args.scheduledTime,
      duration: service.duration,
      status: "pending",
      address: args.address,
      lat: args.lat,
      lng: args.lng,
      totalAmount: service.basePrice,
      notes: args.notes,
      isRecurring: args.isRecurring,
      recurringFrequency: args.recurringFrequency,
      paymentStatus: "pending",
    });

    return bookingId;
  },
});

export const listUserBookings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const bookings = await ctx.db
      .query("serviceBookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      bookings.map(async (booking) => {
        const service = await ctx.db.get(booking.serviceId);
        const provider = await ctx.db.get(booking.providerId);
        return {
          ...booking,
          service,
          provider,
        };
      })
    );
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("serviceBookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    await ctx.db.patch(args.bookingId, {
      status: args.status,
    });
  },
});

export const addReview = mutation({
  args: {
    bookingId: v.id("serviceBookings"),
    rating: v.number(),
    comment: v.string(),
    beforePhotos: v.optional(v.array(v.string())),
    afterPhotos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.insert("serviceReviews", {
      bookingId: args.bookingId,
      userId: user._id,
      userName: user.name || "Anonymous",
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      rating: args.rating,
      comment: args.comment,
      beforePhotos: args.beforePhotos,
      afterPhotos: args.afterPhotos,
      isVerified: true,
    });

    // Update provider rating
    const reviews = await ctx.db
      .query("serviceReviews")
      .withIndex("by_provider", (q) => q.eq("providerId", booking.providerId))
      .collect();

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await ctx.db.patch(booking.providerId, {
      rating: avgRating,
      totalReviews: reviews.length,
    });
  },
});

export const requestQuotation = mutation({
  args: {
    providerId: v.id("serviceProviders"),
    serviceId: v.optional(v.id("services")),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const quotationId = await ctx.db.insert("serviceQuotations", {
      userId: user._id,
      providerId: args.providerId,
      serviceId: args.serviceId,
      description: args.description,
      status: "pending",
    });

    return quotationId;
  },
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
