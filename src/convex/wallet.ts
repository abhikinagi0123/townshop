import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { balance: 0 };

    return {
      balance: user.walletBalance || 0,
    };
  },
});

export const addMoney = mutation({
  args: {
    amount: v.number(),
    transactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    if (args.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const currentBalance = user.walletBalance || 0;
    const newBalance = currentBalance + args.amount;

    await ctx.db.patch(user._id, {
      walletBalance: newBalance,
    });

    await ctx.db.insert("walletTransactions", {
      userId: user._id,
      amount: args.amount,
      type: "credit",
      description: `Added ₹${args.amount} to wallet`,
      transactionId: args.transactionId,
    });

    return { newBalance };
  },
});

export const addMoneyInternal = internalMutation({
  args: {
    amount: v.number(),
    transactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    if (args.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const currentBalance = user.walletBalance || 0;
    const newBalance = currentBalance + args.amount;

    await ctx.db.patch(user._id, {
      walletBalance: newBalance,
    });

    await ctx.db.insert("walletTransactions", {
      userId: user._id,
      amount: args.amount,
      type: "credit",
      description: `Added ₹${args.amount} to wallet`,
      transactionId: args.transactionId,
    });

    return { newBalance };
  },
});

export const deductMoney = mutation({
  args: {
    amount: v.number(),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const currentBalance = user.walletBalance || 0;
    if (currentBalance < args.amount) {
      throw new Error("Insufficient wallet balance");
    }

    const newBalance = currentBalance - args.amount;

    await ctx.db.patch(user._id, {
      walletBalance: newBalance,
    });

    await ctx.db.insert("walletTransactions", {
      userId: user._id,
      amount: -args.amount,
      type: "debit",
      description: `Used ₹${args.amount} for order`,
      orderId: args.orderId,
    });

    return { newBalance };
  },
});

export const getTransactions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const limit = args.limit || 50;
    return await ctx.db
      .query("walletTransactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
  },
});