import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const subscribe = mutation({
  args: {
    storeId: v.id("stores"),
    frequency: v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly")
    ),
    dayOfWeek: v.optional(v.number()),
    dayOfMonth: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("storeSubscriptions")
      .withIndex("by_user_and_store", (q) =>
        q.eq("userId", user._id).eq("storeId", args.storeId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        frequency: args.frequency,
        dayOfWeek: args.dayOfWeek,
        dayOfMonth: args.dayOfMonth,
        isActive: true,
      });
      return existing._id;
    }

    return await ctx.db.insert("storeSubscriptions", {
      userId: user._id,
      storeId: args.storeId,
      frequency: args.frequency,
      dayOfWeek: args.dayOfWeek,
      dayOfMonth: args.dayOfMonth,
      isActive: true,
      nextDelivery: calculateNextDelivery(args.frequency, args.dayOfWeek, args.dayOfMonth),
    });
  },
});

export const unsubscribe = mutation({
  args: {
    subscriptionId: v.id("storeSubscriptions"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription || subscription.userId !== user._id) {
      throw new Error("Subscription not found");
    }

    await ctx.db.patch(args.subscriptionId, { isActive: false });
  },
});

export const listSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const subscriptions = await ctx.db
      .query("storeSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return await Promise.all(
      subscriptions.map(async (sub) => {
        const store = await ctx.db.get(sub.storeId);
        return {
          ...sub,
          storeName: store?.name || "Unknown",
          storeImage: store?.image,
        };
      })
    );
  },
});

function calculateNextDelivery(
  frequency: "weekly" | "biweekly" | "monthly",
  dayOfWeek?: number,
  dayOfMonth?: number
): number {
  const now = new Date();
  const next = new Date(now);

  if (frequency === "weekly" && dayOfWeek !== undefined) {
    const daysUntil = (dayOfWeek - now.getDay() + 7) % 7;
    next.setDate(now.getDate() + (daysUntil || 7));
  } else if (frequency === "biweekly" && dayOfWeek !== undefined) {
    const daysUntil = (dayOfWeek - now.getDay() + 7) % 7;
    next.setDate(now.getDate() + (daysUntil || 14) + 7);
  } else if (frequency === "monthly" && dayOfMonth !== undefined) {
    next.setDate(dayOfMonth);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }

  return next.getTime();
}
