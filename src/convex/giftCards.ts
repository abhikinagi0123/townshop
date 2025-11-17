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
    amount: v.number(),
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
    if (giftCard.balance < args.amount) throw new Error("Insufficient balance");
    if (giftCard.expiresAt < Date.now()) throw new Error("Gift card expired");
    
    const newBalance = giftCard.balance - args.amount;
    
    await ctx.db.patch(giftCard._id, {
      balance: newBalance,
      status: newBalance === 0 ? "redeemed" : "active",
      redeemedBy: user._id,
      redeemedAt: Date.now(),
    });
    
    return { success: true, remainingBalance: newBalance };
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
