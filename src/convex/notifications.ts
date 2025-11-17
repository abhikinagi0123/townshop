import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("order_update"),
      v.literal("promotion"),
      v.literal("system"),
      v.literal("delivery_update"),
      v.literal("service_update")
    ),
    orderId: v.optional(v.id("orders")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      orderId: args.orderId,
      isRead: false,
    });

    const subscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (subscriptions.length > 0) {
      await ctx.scheduler.runAfter(0, "pushNotifications:sendToUser" as any, {
        userId: args.userId,
        title: args.title,
        message: args.message,
        data: args.metadata,
      });
    }

    return notificationId;
  },
});

export const createForDeliveryPartner = mutation({
  args: {
    partnerId: v.id("deliveryPartners"),
    title: v.string(),
    message: v.string(),
    orderId: v.optional(v.id("orders")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.db.get(args.partnerId);
    if (!partner) throw new Error("Partner not found");

    return await ctx.db.insert("notifications", {
      userId: partner.userId,
      title: args.title,
      message: args.message,
      type: "delivery_update",
      orderId: args.orderId,
      isRead: false,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    await Promise.all(
      notifications.map((n) => ctx.db.patch(n._id, { isRead: true }))
    );
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unread.length;
  },
});
