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
    filters: v.optional(v.object({
      minRating: v.optional(v.number()),
      maxDeliveryTime: v.optional(v.number()),
      isOpen: v.optional(v.boolean()),
    })),
    sortBy: v.optional(v.union(
      v.literal("rating"),
      v.literal("delivery_time"),
      v.literal("min_order"),
      v.literal("name")
    )),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;
    
    let query = ctx.db.query("stores");
    
    let stores = await query.collect();
    
    // Apply basic filters
    let filtered = stores.filter(store => {
      if (args.category && args.category !== "all" && store.category !== args.category) {
        return false;
      }
      
      if (args.search) {
        const searchLower = args.search.toLowerCase();
        if (!(store.name.toLowerCase().includes(searchLower) ||
              store.description.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      // Apply advanced filters
      if (args.filters) {
      if (args.filters.minRating !== undefined && store.rating < args.filters.minRating) {
        return false;
      }
      if (args.filters.isOpen !== undefined && store.isOpen !== args.filters.isOpen) {
        return false;
      }
      if (args.filters.maxDeliveryTime !== undefined) {
        const deliveryMinutes = parseInt(store.deliveryTime.split("-")[0] || "0");
        if (deliveryMinutes > args.filters.maxDeliveryTime) {
          return false;
        }
      }
      }
      
      return true;
    });

    // Apply sorting
    if (args.sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
      } else if (args.sortBy === "delivery_time") {
      filtered.sort((a, b) => {
        const aTime = parseInt(a.deliveryTime.split("-")[0] || "0");
        const bTime = parseInt(b.deliveryTime.split("-")[0] || "0");
        return aTime - bTime;
      });
    } else if (args.sortBy === "min_order") {
      filtered.sort((a, b) => a.minOrder - b.minOrder);
    } else if (args.sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return {
      stores: filtered.slice(offset, offset + limit),
      total: filtered.length,
      hasMore: offset + limit < filtered.length,
    };
  },
});

export const search = query({
  args: { 
    term: v.string(),
    filters: v.optional(v.object({
      minRating: v.optional(v.number()),
      category: v.optional(v.string()),
      isOpen: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    const searchLower = args.term.toLowerCase();
    let stores = await ctx.db.query("stores").collect();
    
    stores = stores.filter(store => 
      store.name.toLowerCase().includes(searchLower) ||
      store.description.toLowerCase().includes(searchLower) ||
      store.category.toLowerCase().includes(searchLower)
    );

    // Apply filters
    if (args.filters) {
      if (args.filters.minRating !== undefined) {
        stores = stores.filter(s => s.rating >= (args.filters?.minRating ?? 0));
      }
      if (args.filters.category && args.filters.category !== "all") {
        stores = stores.filter(s => s.category === args.filters?.category);
      }
      if (args.filters.isOpen !== undefined) {
        stores = stores.filter(s => s.isOpen === args.filters?.isOpen);
      }
    }

    return stores;
  },
});