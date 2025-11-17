import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const subscribeToPush = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Check if subscription already exists
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("endpoint"), args.endpoint))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("pushSubscriptions", {
      userId: user._id,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      userAgent: args.userAgent,
    });
  },
});

export const unsubscribeFromPush = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const subscription = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("endpoint"), args.endpoint))
      .first();

    if (subscription) {
      await ctx.db.delete(subscription._id);
    }
  },
});

export const getUserSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const sendToUser = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    console.log(`Sending push notification to ${subscriptions.length} devices for user ${args.userId}`);
    
    return {
      sent: subscriptions.length,
      title: args.title,
      message: args.message,
    };
  },
});
