import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByStore = query({
  args: { 
    storeId: v.id("stores"),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .collect();
    
    if (args.category && args.category !== "all") {
      return products.filter(p => p.category === args.category);
    }
    
    return products;
  },
});

export const getById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    description: v.string(),
    image: v.string(),
    price: v.number(),
    category: v.string(),
    inStock: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", args);
  },
});
