import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    productId: v.id("products"),
    targetPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const existing = await ctx.db
      .query("priceDropAlerts")
      .withIndex("by_user_and_product", (q) => 
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { targetPrice: args.targetPrice });
      return existing._id;
    }
    
    return await ctx.db.insert("priceDropAlerts", {
      userId: user._id,
      productId: args.productId,
      targetPrice: args.targetPrice,
      isNotified: false,
    });
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const alerts = await ctx.db
      .query("priceDropAlerts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    return await Promise.all(
      alerts.map(async (alert) => {
        const product = await ctx.db.get(alert.productId);
        return { ...alert, product };
      })
    );
  },
});

export const remove = mutation({
  args: { alertId: v.id("priceDropAlerts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.alertId);
  },
});
