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
    
    const recentOrders = await ctx.db
      .query("orders")
      .order("desc")
      .take(100);
    
    const productCounts = new Map<string, number>();
    
    for (const order of recentOrders) {
      for (const item of order.items) {
        const count = productCounts.get(item.productId) || 0;
        productCounts.set(item.productId, count + item.quantity);
      }
    }
    
    const sortedProducts = Array.from(productCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    
    const trendingProducts = await Promise.all(
      sortedProducts.map(async ([productId, orderCount]) => {
        const product = await ctx.db.get(productId as any);
        if (!product || !(("storeId" in product) && product.storeId)) return null;
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
    
    const allProducts = await ctx.db.query("products").collect();
    
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

export const getRecommendedProducts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 8;
    
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      const products = await ctx.db.query("products")
        .filter((q) => q.eq(q.field("inStock"), true))
        .take(limit);
      
      return await Promise.all(
        products.map(async (product) => {
          const store = await ctx.db.get(product.storeId);
          return {
            ...product,
            storeName: store?.name || "Unknown Store",
          };
        })
      );
    }
    
    const userId = user.subject as any;
    const recentOrders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);
    
    const orderedProductIds = new Set<string>();
    for (const order of recentOrders) {
      for (const item of order.items) {
        orderedProductIds.add(item.productId);
      }
    }
    
    const orderedProducts = await Promise.all(
      Array.from(orderedProductIds).map(id => ctx.db.get(id as any))
    );
    
    const preferredCategories = new Set(
      orderedProducts.filter((p): p is NonNullable<typeof p> & { category: string } => 
        p !== null && 'category' in p
      ).map(p => p.category)
    );
    
    const allProducts = await ctx.db.query("products")
      .filter((q) => q.eq(q.field("inStock"), true))
      .collect();
    
    const recommended = allProducts
      .filter(p => preferredCategories.has(p.category) && !orderedProductIds.has(p._id))
      .slice(0, limit);
    
    return await Promise.all(
      recommended.map(async (product) => {
        const store = await ctx.db.get(product.storeId);
        return {
          ...product,
          storeName: store?.name || "Unknown Store",
        };
      })
    );
  },
});

export const getRecentlyViewedProducts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 6;
    
    const user = await ctx.auth.getUserIdentity();
    if (!user) return [];
    
    const userId = user.subject as any;
    const recentOrders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(3);
    
    const productIds = new Set<string>();
    for (const order of recentOrders) {
      for (const item of order.items) {
        productIds.add(item.productId);
        if (productIds.size >= limit) break;
      }
      if (productIds.size >= limit) break;
    }
    
    const products = await Promise.all(
      Array.from(productIds).map(async (id) => {
        const product = await ctx.db.get(id as any);
        if (!product || !('storeId' in product) || !product.storeId) return null;
        const store = await ctx.db.get(product.storeId);
        return {
          ...product,
          storeName: store?.name || "Unknown Store",
        };
      })
    );
    
    return products.filter(p => p !== null);
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