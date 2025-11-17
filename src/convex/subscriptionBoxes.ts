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

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    return await ctx.db
      .query("subscriptionBoxes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const cancel = mutation({
  args: { subscriptionId: v.id("subscriptionBoxes") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, { isActive: false });
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
