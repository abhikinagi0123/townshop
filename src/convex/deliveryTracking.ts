import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    orderId: v.id("orders"),
    deliveryPartnerId: v.id("deliveryPartners"),
    currentLat: v.number(),
    currentLng: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("deliveryTracking", {
      orderId: args.orderId,
      deliveryPartnerId: args.deliveryPartnerId,
      status: "assigned",
      currentLat: args.currentLat,
      currentLng: args.currentLng,
      lastUpdated: Date.now(),
    });
  },
});

export const updateLocation = mutation({
  args: {
    orderId: v.id("orders"),
    lat: v.number(),
    lng: v.number(),
    estimatedArrival: v.optional(v.number()),
    distanceRemaining: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const tracking = await ctx.db
      .query("deliveryTracking")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!tracking) throw new Error("Tracking not found");

    await ctx.db.patch(tracking._id, {
      currentLat: args.lat,
      currentLng: args.lng,
      estimatedArrival: args.estimatedArrival,
      distanceRemaining: args.distanceRemaining,
      lastUpdated: Date.now(),
    });

    await ctx.db.patch(args.orderId, {
      deliveryPartner: {
        ...(await ctx.db.get(args.orderId))?.deliveryPartner,
        currentLat: args.lat,
        currentLng: args.lng,
        lastLocationUpdate: Date.now(),
      } as any,
    });
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("assigned"),
      v.literal("picked_up"),
      v.literal("in_transit"),
      v.literal("nearby"),
      v.literal("delivered")
    ),
  },
  handler: async (ctx, args) => {
    const tracking = await ctx.db
      .query("deliveryTracking")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!tracking) throw new Error("Tracking not found");

    await ctx.db.patch(tracking._id, {
      status: args.status,
      lastUpdated: Date.now(),
    });

    const orderStatusMap: Record<string, string> = {
      assigned: "confirmed",
      picked_up: "preparing",
      in_transit: "out_for_delivery",
      nearby: "out_for_delivery",
      delivered: "delivered",
    };

    await ctx.db.patch(args.orderId, {
      status: orderStatusMap[args.status] as any,
    });
  },
});

export const getByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const tracking = await ctx.db
      .query("deliveryTracking")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!tracking) return null;

    const partner = await ctx.db.get(tracking.deliveryPartnerId);

    return {
      ...tracking,
      partner,
    };
  },
});

export const listByPartner = query({
  args: { 
    partnerId: v.id("deliveryPartners"),
    status: v.optional(v.union(
      v.literal("assigned"),
      v.literal("picked_up"),
      v.literal("in_transit"),
      v.literal("nearby"),
      v.literal("delivered")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("deliveryTracking")
      .withIndex("by_partner", (q) => q.eq("deliveryPartnerId", args.partnerId));

    const trackings = await query.collect();

    if (args.status) {
      return trackings.filter(t => t.status === args.status);
    }

    return trackings;
  },
});