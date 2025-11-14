import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentUser } from "../users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("quickActions").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const actions = await ctx.db.query("quickActions").collect();
    return actions
      .filter(a => a.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    icon: v.string(),
    description: v.string(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.insert("quickActions", {
      ...args,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("quickActions"),
    title: v.optional(v.string()),
    icon: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("quickActions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.id);
  },
});
