import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    
    return orders;
  },
});

export const getById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    return await ctx.db.get(args.orderId);
  },
});

export const create = mutation({
  args: {
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      quantity: v.number(),
      price: v.number(),
    })),
    storeId: v.id("stores"),
    storeName: v.string(),
    totalAmount: v.number(),
    deliveryAddress: v.string(),
    scheduledFor: v.optional(v.number()),
    isRecurring: v.optional(v.boolean()),
    recurringFrequency: v.optional(v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    )),
    deliveryTip: v.optional(v.number()),
    orderNotes: v.optional(v.string()),
    appliedCoupon: v.optional(v.object({
      code: v.string(),
      discountAmount: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      items: args.items,
      storeId: args.storeId,
      storeName: args.storeName,
      totalAmount: args.totalAmount,
      deliveryAddress: args.deliveryAddress,
      status: "pending",
      scheduledFor: args.scheduledFor,
      isRecurring: args.isRecurring,
      recurringFrequency: args.recurringFrequency,
      paymentStatus: "pending",
      deliveryTip: args.deliveryTip,
      orderNotes: args.orderNotes,
      appliedCoupon: args.appliedCoupon,
    });
    
    // ... keep existing notification and loyalty points code
    
    return orderId;
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    deliveryPartner: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      vehicleNumber: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const updates: any = { status: args.status };
    if (args.deliveryPartner) {
      updates.deliveryPartner = args.deliveryPartner;
    }
    await ctx.db.patch(args.orderId, updates);
  },
});

export const getRecentOrders = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const limit = args.limit || 3;
    
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
    
    return orders;
  },
});

export const getScheduledOrders = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const now = Date.now();
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.and(
        q.neq(q.field("scheduledFor"), undefined),
        q.gt(q.field("scheduledFor"), now)
      ))
      .order("desc")
      .collect();
    
    return orders;
  },
});

export const cancelScheduledOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    
    if (!order.scheduledFor || order.scheduledFor < Date.now()) {
      throw new Error("Cannot cancel order that has already started");
    }
    
    await ctx.db.patch(args.orderId, { status: "cancelled" });
  },
});