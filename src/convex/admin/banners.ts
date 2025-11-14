import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentUser } from "../users";

export const list = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let banners = await ctx.db.query("banners").collect();
    
    if (args.type) {
      banners = banners.filter(b => b.type === args.type);
    }
    
    return banners.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listActive = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let banners = await ctx.db.query("banners").collect();
    
    banners = banners.filter(b => b.isActive);
    
    if (args.type) {
      banners = banners.filter(b => b.type === args.type);
    }
    
    return banners.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    buttonText: v.optional(v.string()),
    buttonLink: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    type: v.union(
      v.literal("hero"),
      v.literal("promotional"),
      v.literal("special_offer")
    ),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.insert("banners", {
      ...args,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("banners"),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    buttonText: v.optional(v.string()),
    buttonLink: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("hero"),
      v.literal("promotional"),
      v.literal("special_offer")
    )),
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
  args: { id: v.id("banners") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.id);
  },
});
