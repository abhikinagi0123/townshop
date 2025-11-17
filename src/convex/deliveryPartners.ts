import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    vehicleType: v.union(
      v.literal("bike"),
      v.literal("scooter"),
      v.literal("car"),
      v.literal("bicycle")
    ),
    vehicleNumber: v.string(),
    licenseNumber: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    verificationDocuments: v.optional(v.array(v.string())),
    bankDetails: v.optional(v.object({
      accountNumber: v.string(),
      ifscCode: v.string(),
      accountHolderName: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("deliveryPartners", {
      userId: user._id,
      name: args.name,
      phone: args.phone,
      email: args.email,
      vehicleType: args.vehicleType,
      vehicleNumber: args.vehicleNumber,
      licenseNumber: args.licenseNumber,
      profileImage: args.profileImage,
      isActive: true,
      isAvailable: false,
      rating: 5.0,
      totalDeliveries: 0,
      verificationStatus: "pending",
      verificationDocuments: args.verificationDocuments,
      earnings: 0,
      bankDetails: args.bankDetails,
    });
  },
});

export const getById = query({
  args: { partnerId: v.id("deliveryPartners") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.partnerId);
  },
});

export const updateLocation = mutation({
  args: {
    partnerId: v.id("deliveryPartners"),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.partnerId, {
      currentLat: args.lat,
      currentLng: args.lng,
      lastLocationUpdate: Date.now(),
    });
  },
});

export const updateAvailability = mutation({
  args: {
    partnerId: v.id("deliveryPartners"),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.partnerId, {
      isAvailable: args.isAvailable,
    });
  },
});

export const listAvailable = query({
  args: {
    lat: v.number(),
    lng: v.number(),
    radiusKm: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radiusKm || 10;
    
    const partners = await ctx.db
      .query("deliveryPartners")
      .withIndex("by_availability", (q) => q.eq("isAvailable", true))
      .filter((q) => q.eq(q.field("verificationStatus"), "verified"))
      .collect();

    return partners.filter(partner => {
      if (!partner.currentLat || !partner.currentLng) return false;
      
      const distance = calculateDistance(
        args.lat,
        args.lng,
        partner.currentLat,
        partner.currentLng
      );
      
      return distance <= radius;
    });
  },
});

export const updateRating = mutation({
  args: {
    partnerId: v.id("deliveryPartners"),
    newRating: v.number(),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.db.get(args.partnerId);
    if (!partner) throw new Error("Partner not found");

    const totalDeliveries = partner.totalDeliveries || 0;
    const currentRating = partner.rating || 5.0;
    
    const newAvgRating = ((currentRating * totalDeliveries) + args.newRating) / (totalDeliveries + 1);

    await ctx.db.patch(args.partnerId, {
      rating: newAvgRating,
      totalDeliveries: totalDeliveries + 1,
    });
  },
});

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
