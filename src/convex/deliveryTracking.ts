import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const updateDeliveryPartnerLocation = mutation({
  args: {
    orderId: v.id("orders"),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    if (!order.deliveryPartner) {
      throw new Error("No delivery partner assigned");
    }

    await ctx.db.patch(args.orderId, {
      deliveryPartner: {
        ...order.deliveryPartner,
        currentLat: args.lat,
        currentLng: args.lng,
        lastLocationUpdate: Date.now(),
      },
    });

    // Create notification for location update
    await ctx.db.insert("notifications", {
      userId: order.userId,
      title: "Delivery Partner Nearby",
      message: `Your delivery partner is on the way!`,
      type: "order_update",
      orderId: order._id,
      isRead: false,
    });
  },
});

export const getDeliveryPartnerLocation = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    if (!order.deliveryPartner) {
      return null;
    }

    return {
      name: order.deliveryPartner.name,
      phone: order.deliveryPartner.phone,
      vehicleNumber: order.deliveryPartner.vehicleNumber,
      currentLat: order.deliveryPartner.currentLat,
      currentLng: order.deliveryPartner.currentLng,
      lastLocationUpdate: order.deliveryPartner.lastLocationUpdate,
    };
  },
});
