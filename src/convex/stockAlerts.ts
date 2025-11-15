import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Check if alert already exists
    const existing = await ctx.db
      .query("stockAlerts")
      .withIndex("by_user_and_product", (q) => 
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      throw new Error("Stock alert already exists for this product");
    }

    return await ctx.db.insert("stockAlerts", {
      userId: user._id,
      productId: args.productId,
      isNotified: false,
    });
  },
});

export const remove = mutation({
  args: {
    alertId: v.id("stockAlerts"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const alert = await ctx.db.get(args.alertId);
    if (!alert || alert.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.alertId);
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("stockAlerts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const checkAlert = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const alert = await ctx.db
      .query("stockAlerts")
      .withIndex("by_user_and_product", (q) => 
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    return alert ? { ...alert, hasAlert: true } : null;
  },
});

export const toggle = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("stockAlerts")
      .withIndex("by_user_and_product", (q) => 
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { action: "removed" };
    } else {
      await ctx.db.insert("stockAlerts", {
        userId: user._id,
        productId: args.productId,
        isNotified: false,
      });
      return { action: "added" };
    }
  },
});
