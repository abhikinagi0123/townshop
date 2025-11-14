import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export const getNearbyShops = query({
  args: {
    lat: v.number(),
    lng: v.number(),
    radius: v.optional(v.number()), // radius in km, default 10km
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const radius = args.radius || 10;
    let stores = await ctx.db.query("stores").collect();
    
    // Calculate distance and filter by radius
    const storesWithDistance = stores.map(store => ({
      ...store,
      distance: calculateDistance(args.lat, args.lng, store.lat, store.lng),
    })).filter(store => store.distance <= radius);
    
    // Apply category filter
    let filteredStores = storesWithDistance;
    if (args.category && args.category !== "all") {
      filteredStores = filteredStores.filter(store => store.category === args.category);
    }
    
    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredStores = filteredStores.filter(store => 
        store.name.toLowerCase().includes(searchLower) ||
        store.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by distance
    return filteredStores.sort((a, b) => a.distance - b.distance);
  },
});

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
    lat: v.number(),
    lng: v.number(),
    isOpen: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    return await ctx.db.insert("stores", args);
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

export const getRecommendedStores = query({
  args: {
    lat: v.number(),
    lng: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 6;
    
    // Get user's order history to find preferred stores
    const user = await ctx.auth.getUserIdentity();
    let preferredStoreIds = new Set<string>();
    
    if (user) {
      const userId = user.subject as any;
      const recentOrders = await ctx.db
        .query("orders")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .take(10);
      
      for (const order of recentOrders) {
        preferredStoreIds.add(order.storeId);
      }
    }
    
    // Get all stores and calculate distance
    const stores = await ctx.db.query("stores").collect();
    const storesWithDistance = stores.map(store => ({
      ...store,
      distance: calculateDistance(args.lat, args.lng, store.lat, store.lng),
    }));
    
    // Prioritize previously ordered stores that are nearby and open
    const recommended = storesWithDistance
      .filter(s => s.isOpen && s.distance <= 10)
      .sort((a, b) => {
        // Prioritize stores user has ordered from
        const aOrdered = preferredStoreIds.has(a._id) ? -1 : 0;
        const bOrdered = preferredStoreIds.has(b._id) ? -1 : 0;
        if (aOrdered !== bOrdered) return aOrdered - bOrdered;
        
        // Then by rating
        if (Math.abs(a.rating - b.rating) > 0.3) return b.rating - a.rating;
        
        // Then by distance
        return a.distance - b.distance;
      })
      .slice(0, limit);
    
    return recommended;
  },
});