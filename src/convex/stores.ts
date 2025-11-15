import { v } from "convex/values";
import { query } from "./_generated/server";

export const getById = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.storeId);
  },
});

export const getNearbyShops = query({
  args: {
    userLat: v.number(),
    userLng: v.number(),
    radius: v.optional(v.number()),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const radius = args.radius || 10;
    const stores = await ctx.db.query("stores").collect();
    
    const nearbyStores = stores.filter(store => {
      const distance = Math.sqrt(
        Math.pow(store.lat - args.userLat, 2) + 
        Math.pow(store.lng - args.userLng, 2)
      ) * 111;
      
      if (distance > radius) return false;
      
      if (args.category && args.category !== "all" && store.category !== args.category) {
        return false;
      }
      
      if (args.search) {
        const searchLower = args.search.toLowerCase();
        return store.name.toLowerCase().includes(searchLower) ||
               store.description.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
    
    return nearbyStores;
  },
});

export const getRecommendedStores = query({
  args: {
    lat: v.number(),
    lng: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 6;
    
    const stores = await ctx.db.query("stores")
      .filter((q) => q.eq(q.field("isOpen"), true))
      .collect();
    
    return stores
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  },
});

export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;
    
    let query = ctx.db.query("stores");
    
    const stores = await query.collect();
    
    const filtered = stores.filter(store => {
      if (args.category && args.category !== "all" && store.category !== args.category) {
        return false;
      }
      
      if (args.search) {
        const searchLower = args.search.toLowerCase();
        return store.name.toLowerCase().includes(searchLower) ||
               store.description.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
    
    return {
      stores: filtered.slice(offset, offset + limit),
      total: filtered.length,
      hasMore: offset + limit < filtered.length,
    };
  },
});

export const search = query({
  args: { term: v.string() },
  handler: async (ctx, args) => {
    const searchLower = args.term.toLowerCase();
    const stores = await ctx.db.query("stores").collect();
    
    return stores.filter(store => 
      store.name.toLowerCase().includes(searchLower) ||
      store.description.toLowerCase().includes(searchLower) ||
      store.category.toLowerCase().includes(searchLower)
    );
  },
});