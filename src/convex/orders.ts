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
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    return await ctx.db.insert("orders", {
      userId: user._id,
      items: args.items,
      storeId: args.storeId,
      storeName: args.storeName,
      totalAmount: args.totalAmount,
      deliveryAddress: args.deliveryAddress,
      status: "pending",
    });
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