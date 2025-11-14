import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentUser } from "../users";

// List all categories
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").order("asc").collect();
  },
});

// Get active categories only (for frontend)
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories
      .filter(c => c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// Create category (admin only)
export const create = mutation({
  args: {
    name: v.string(),
    emoji: v.string(),
    slug: v.string(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.insert("categories", {
      ...args,
      isActive: true,
    });
  },
});

// Update category (admin only)
export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    slug: v.optional(v.string()),
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

// Delete category (admin only)
export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.id);
  },
});
