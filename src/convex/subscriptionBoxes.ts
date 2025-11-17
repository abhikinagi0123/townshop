import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    frequency: v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly")
    ),
    productIds: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    return await ctx.db.insert("subscriptionBoxes", {
      userId: user._id,
      name: args.name,
      description: args.description,
      price: args.price,
      frequency: args.frequency,
      productIds: args.productIds,
      isActive: true,
      nextDelivery: calculateNextDelivery(args.frequency),
    });
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const subscriptions = await ctx.db
      .query("subscriptionBoxes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    return await Promise.all(
      subscriptions.map(async (sub) => {
        const products = await Promise.all(
          sub.productIds.map(id => ctx.db.get(id))
        );
        return {
          ...sub,
          products: products.filter(p => p !== null),
          status: sub.isActive ? "active" : "cancelled",
        };
      })
    );
  },
});

export const pause = mutation({
  args: { subscriptionId: v.id("subscriptionBoxes") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, { isActive: false });
  },
});

export const resume = mutation({
  args: { subscriptionId: v.id("subscriptionBoxes") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, { isActive: true });
  },
});

export const cancel = mutation({
  args: { subscriptionId: v.id("subscriptionBoxes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.subscriptionId);
  },
});

export const updateFrequency = mutation({
  args: {
    subscriptionId: v.id("subscriptionBoxes"),
    frequency: v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, {
      frequency: args.frequency,
      nextDelivery: calculateNextDelivery(args.frequency),
    });
  },
});

export const updateProducts = mutation({
  args: {
    subscriptionId: v.id("subscriptionBoxes"),
    productIds: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, {
      productIds: args.productIds,
    });
  },
});

function calculateNextDelivery(frequency: "weekly" | "biweekly" | "monthly"): number {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  switch (frequency) {
    case "weekly":
      return now + (7 * day);
    case "biweekly":
      return now + (14 * day);
    case "monthly":
      return now + (30 * day);
  }
}