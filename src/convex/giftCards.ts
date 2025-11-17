import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    amount: v.number(),
    recipientEmail: v.optional(v.string()),
    recipientName: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const code = `GIFT${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    return await ctx.db.insert("giftCards", {
      code,
      amount: args.amount,
      balance: args.amount,
      purchasedBy: user._id,
      recipientEmail: args.recipientEmail,
      recipientName: args.recipientName,
      message: args.message,
      status: "active",
      expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
    });
  },
});

export const redeem = mutation({
  args: {
    code: v.string(),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const giftCard = await ctx.db
      .query("giftCards")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
    
    if (!giftCard) throw new Error("Gift card not found");
    if (giftCard.status !== "active") throw new Error("Gift card is not active");
    if (giftCard.expiresAt < Date.now()) throw new Error("Gift card expired");
    
    // If no amount specified, redeem full balance to wallet
    const redeemAmount = args.amount || giftCard.balance;
    
    if (giftCard.balance < redeemAmount) throw new Error("Insufficient balance");
    
    const newBalance = giftCard.balance - redeemAmount;
    
    await ctx.db.patch(giftCard._id, {
      balance: newBalance,
      status: newBalance === 0 ? "redeemed" : "active",
      redeemedBy: user._id,
      redeemedAt: Date.now(),
    });
    
    // Add to wallet
    const currentWalletBalance = user.walletBalance || 0;
    await ctx.db.patch(user._id, {
      walletBalance: currentWalletBalance + redeemAmount,
    });
    
    // Record wallet transaction
    await ctx.db.insert("walletTransactions", {
      userId: user._id,
      amount: redeemAmount,
      type: "credit",
      description: `Redeemed gift card ${giftCard.code}`,
    });
    
    return { success: true, remainingBalance: newBalance, redeemedAmount: redeemAmount };
  },
});

export const checkBalance = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const giftCard = await ctx.db
      .query("giftCards")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
    
    if (!giftCard) return null;
    
    return {
      code: giftCard.code,
      balance: giftCard.balance,
      originalAmount: giftCard.amount,
      status: giftCard.status,
      expiresAt: giftCard.expiresAt,
      isExpired: giftCard.expiresAt < Date.now(),
    };
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    return await ctx.db
      .query("giftCards")
      .withIndex("by_purchaser", (q) => q.eq("purchasedBy", user._id))
      .collect();
  },
});

export const getUsageHistory = query({
  args: { giftCardId: v.id("giftCards") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const giftCard = await ctx.db.get(args.giftCardId);
    if (!giftCard || giftCard.purchasedBy !== user._id) return [];
    
    // Get wallet transactions related to this gift card
    const transactions = await ctx.db
      .query("walletTransactions")
      .filter((q) => q.eq(q.field("description"), `Redeemed gift card ${giftCard.code}`))
      .collect();
    
    return transactions;
  },
});