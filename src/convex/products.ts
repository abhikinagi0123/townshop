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
        if (!product || !((("storeId" in product) && product.storeId))) return null;
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
  args: { 
    query: v.string(),
    filters: v.optional(v.object({
      minPrice: v.optional(v.number()),
      maxPrice: v.optional(v.number()),
      category: v.optional(v.string()),
      inStock: v.optional(v.boolean()),
      minRating: v.optional(v.number()),
    })),
    sortBy: v.optional(v.union(
      v.literal("relevance"),
      v.literal("price_asc"),
      v.literal("price_desc"),
      v.literal("rating"),
      v.literal("popularity")
    )),
  },
  handler: async (ctx, args) => {
    const searchLower = args.query.toLowerCase();
    const products = await ctx.db.query("products").collect();
    
    let matchingProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    );

    // Apply filters
    if (args.filters) {
      if (args.filters.minPrice !== undefined) {
        matchingProducts = matchingProducts.filter(p => p.price >= args.filters!.minPrice!);
      }
      if (args.filters.maxPrice !== undefined) {
        matchingProducts = matchingProducts.filter(p => p.price <= args.filters!.maxPrice!);
      }
      if (args.filters.category) {
        matchingProducts = matchingProducts.filter(p => p.category === args.filters!.category);
      }
      if (args.filters.inStock !== undefined) {
        matchingProducts = matchingProducts.filter(p => p.inStock === args.filters!.inStock);
      }
    }
    
    const productsWithStore = await Promise.all(
      matchingProducts.map(async (product) => {
        const store = await ctx.db.get(product.storeId);
        return {
          ...product,
          storeName: store?.name || "Unknown Store",
          storeRating: store?.rating || 0,
        };
      })
    );

    // Apply rating filter after getting store data
    let filteredProducts = productsWithStore;
    if (args.filters?.minRating !== undefined) {
      filteredProducts = productsWithStore.filter(p => p.storeRating >= args.filters!.minRating!);
    }

    // Apply sorting
    const sortBy = args.sortBy || "relevance";
    if (sortBy === "price_asc") {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filteredProducts.sort((a, b) => b.storeRating - a.storeRating);
    }
    
    return filteredProducts;
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

export const getTrendingInArea = query({
  args: {
    userLat: v.number(),
    userLng: v.number(),
    radiusKm: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radiusKm || 10;
    const limit = args.limit || 10;
    
    // Get nearby stores
    const stores = await ctx.db.query("stores").collect();
    const nearbyStores = stores.filter(store => {
      const distance = calculateDistance(
        args.userLat,
        args.userLng,
        store.lat,
        store.lng
      );
      return distance <= radius;
    });
    
    const nearbyStoreIds = nearbyStores.map(s => s._id);
    
    // Get products from nearby stores
    const allProducts = await ctx.db.query("products").collect();
    const nearbyProducts = allProducts.filter(p => 
      nearbyStoreIds.includes(p.storeId)
    );
    
    // Get recent orders to determine trending
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentOrders = await ctx.db
      .query("orders")
      .filter((q) => q.gte(q.field("_creationTime"), thirtyDaysAgo))
      .collect();
    
    // Count product orders
    const productOrderCounts = new Map<string, number>();
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        const count = productOrderCounts.get(item.productId) || 0;
        productOrderCounts.set(item.productId, count + item.quantity);
      });
    });
    
    // Sort by popularity
    const trending = nearbyProducts
      .map(product => ({
        ...product,
        orderCount: productOrderCounts.get(product._id) || 0,
      }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, limit);
    
    // Add store names
    return await Promise.all(
      trending.map(async (product) => {
        const store = await ctx.db.get(product.storeId);
        return {
          ...product,
          storeName: store?.name || "Unknown Store",
        };
      })
    );
  },
});

// Helper function for distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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