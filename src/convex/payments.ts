import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    orderId: v.id("orders"),
    amount: v.number(),
    method: v.union(
      v.literal("card"),
      v.literal("upi"),
      v.literal("wallet"),
      v.literal("cod")
    ),
    cardLast4: v.optional(v.string()),
    upiId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const paymentId = await ctx.db.insert("payments", {
      userId: user._id,
      orderId: args.orderId,
      amount: args.amount,
      method: args.method,
      status: args.method === "cod" ? "pending" : "completed",
      cardLast4: args.cardLast4,
      upiId: args.upiId,
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
    });

    await ctx.db.patch(args.orderId, {
      paymentMethod: args.method,
      paymentStatus: args.method === "cod" ? "pending" : "completed",
    });

    return paymentId;
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    return await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();
  },
});

export const addSavedPaymentMethod = mutation({
  args: {
    type: v.union(
      v.literal("card"),
      v.literal("upi"),
      v.literal("wallet")
    ),
    cardLast4: v.optional(v.string()),
    cardBrand: v.optional(v.string()),
    upiId: v.optional(v.string()),
    walletProvider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existingMethods = await ctx.db
      .query("savedPaymentMethods")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return await ctx.db.insert("savedPaymentMethods", {
      userId: user._id,
      type: args.type,
      cardLast4: args.cardLast4,
      cardBrand: args.cardBrand,
      upiId: args.upiId,
      walletProvider: args.walletProvider,
      isDefault: existingMethods.length === 0,
    });
  },
});

export const listSavedPaymentMethods = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("savedPaymentMethods")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const removeSavedPaymentMethod = mutation({
  args: { paymentMethodId: v.id("savedPaymentMethods") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const method = await ctx.db.get(args.paymentMethodId);
    if (!method || method.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.paymentMethodId);
  },
});
