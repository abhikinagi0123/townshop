import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let stores = await ctx.db.query("stores").collect();
    
    if (args.category && args.category !== "all") {
      stores = stores.filter(store => store.category === args.category);
    }
    
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      stores = stores.filter(store => 
        store.name.toLowerCase().includes(searchLower) ||
        store.description.toLowerCase().includes(searchLower)
      );
    }
    
    return stores;
  },
});

export const getById = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.storeId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    image: v.string(),
    category: v.string(),
    rating: v.number(),
    deliveryTime: v.string(),
    minOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    return await ctx.db.insert("stores", args);
  },
});
