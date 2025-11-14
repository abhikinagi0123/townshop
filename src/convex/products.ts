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

export const getTrendingProducts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Get all recent orders (last 30 days simulation - using recent orders)
    const recentOrders = await ctx.db
      .query("orders")
      .order("desc")
      .take(100);
    
    // Count product occurrences in orders
    const productCounts = new Map<string, number>();
    
    for (const order of recentOrders) {
      for (const item of order.items) {
        const count = productCounts.get(item.productId) || 0;
        productCounts.set(item.productId, count + item.quantity);
      }
    }
    
    // Sort by count and get top products
    const sortedProducts = Array.from(productCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    
    // Fetch full product details
    const trendingProducts = await Promise.all(
      sortedProducts.map(async ([productId, orderCount]) => {
        const product = await ctx.db.get(productId as any);
        if (!product || !("storeId" in product)) return null;
        const store = await ctx.db.get(product.storeId);
        return {
          ...product,
          orderCount,
          storeName: store?.name || "Unknown Store",
        };
      })
    );
    
    return trendingProducts.filter(p => p !== null);
  },
});

export const getTopRatedProducts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Get all products
    const allProducts = await ctx.db.query("products").collect();
    
    // Get stores with ratings
    const productsWithStoreRating = await Promise.all(
      allProducts.map(async (product) => {
        const store = await ctx.db.get(product.storeId);
        return {
          ...product,
          storeRating: store?.rating || 0,
          storeName: store?.name || "Unknown Store",
        };
      })
    );
    
    // Sort by store rating and return top products
    return productsWithStoreRating
      .sort((a, b) => b.storeRating - a.storeRating)
      .slice(0, limit);
  },
});

export const getFeaturedProducts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 8;
    
    // Get products from highly rated stores that are open
    const stores = await ctx.db.query("stores").collect();
    const topStores = stores
      .filter(s => s.isOpen && s.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
    
    const featuredProducts = [];
    
    for (const store of topStores) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_store", (q) => q.eq("storeId", store._id))
        .filter((q) => q.eq(q.field("inStock"), true))
        .take(2);
      
      for (const product of products) {
        featuredProducts.push({
          ...product,
          storeName: store.name,
          storeRating: store.rating,
        });
      }
      
      if (featuredProducts.length >= limit) break;
    }
    
    return featuredProducts.slice(0, limit);
  },
});

export const search = query({
  args: { term: v.string() },
  handler: async (ctx, args) => {
    const searchLower = args.term.toLowerCase();
    const products = await ctx.db.query("products").collect();
    
    const matchingProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    );
    
    const productsWithStore = await Promise.all(
      matchingProducts.map(async (product) => {
        const store = await ctx.db.get(product.storeId);
        return {
          ...product,
          storeName: store?.name || "Unknown Store",
        };
      })
    );
    
    return productsWithStore;
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