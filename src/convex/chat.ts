import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createSession = mutation({
  args: {
    orderId: v.optional(v.id("orders")),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existingSession = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (existingSession) {
      return existingSession._id;
    }

    return await ctx.db.insert("chatSessions", {
      userId: user._id,
      orderId: args.orderId,
      storeId: args.storeId,
      status: "active",
      lastMessageAt: Date.now(),
    });
  },
});

export const sendMessage = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    message: v.string(),
    orderId: v.optional(v.id("orders")),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.sessionId, {
      lastMessageAt: Date.now(),
    });

    return await ctx.db.insert("chatMessages", {
      userId: user._id,
      orderId: args.orderId,
      storeId: args.storeId,
      message: args.message,
      sender: "user",
      isRead: false,
    });
  },
});

export const getMessages = query({
  args: {
    orderId: v.optional(v.id("orders")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const limit = args.limit || 50;

    if (args.orderId) {
      return await ctx.db
        .query("chatMessages")
        .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
  },
});

export const getSessionById = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id) {
      return null;
    }

    return session;
  },
});

export const getSessions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const closeSession = mutation({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.sessionId, {
      status: "closed",
    });
  },
});

export const markMessagesAsRead = mutation({
  args: { orderId: v.optional(v.id("orders")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    let messages;
    if (args.orderId) {
      messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
        .filter((q) => q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("isRead"), false)
        ))
        .collect();
    } else {
      messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("isRead"), false))
        .collect();
    }

    await Promise.all(
      messages.map((msg) => ctx.db.patch(msg._id, { isRead: true }))
    );
  },
});
