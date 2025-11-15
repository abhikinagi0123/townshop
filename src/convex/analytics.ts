import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;
    const cancelledOrders = orders.filter(o => o.status === "cancelled").length;

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Get most ordered stores
    const storeOrderCounts = orders.reduce((acc, order) => {
      acc[order.storeId] = (acc[order.storeId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topStores = await Promise.all(
      Object.entries(storeOrderCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(async ([storeId, count]) => {
          const store = await ctx.db.get(storeId as any);
          const storeName = store && 'name' in store ? store.name : "Unknown";
          return {
            storeId,
            storeName,
            orderCount: count,
          };
        })
    );

    // Monthly spending trend (last 6 months)
    const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
    const recentOrders = orders.filter(o => o._creationTime > sixMonthsAgo);
    
    const monthlySpending = recentOrders.reduce((acc, order) => {
      const month = new Date(order._creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + order.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalSpent,
      deliveredOrders,
      cancelledOrders,
      avgOrderValue,
      topStores,
      monthlySpending: Object.entries(monthlySpending).map(([month, amount]) => ({
        month,
        amount,
      })),
    };
  },
});

export const getTrendingInArea = query({
  args: {
    lat: v.number(),
    lng: v.number(),
    radius: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radius || 10;
    
    // Get nearby stores
    const stores = await ctx.db.query("stores").collect();
    const nearbyStoreIds = stores
      .filter(store => {
        const distance = Math.sqrt(
          Math.pow(store.lat - args.lat, 2) + 
          Math.pow(store.lng - args.lng, 2)
        ) * 111;
        return distance <= radius;
      })
      .map(s => s._id);

    // Get all orders from nearby stores in the last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentOrders = await ctx.db
      .query("orders")
      .filter((q) => q.gt(q.field("_creationTime"), thirtyDaysAgo))
      .collect();

    const nearbyOrders = recentOrders.filter(order => 
      nearbyStoreIds.includes(order.storeId)
    );

    // Count product occurrences
    const productCounts = nearbyOrders.reduce((acc, order) => {
      order.items.forEach(item => {
        acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);

    // Get top 10 trending products
    const trendingProducts = await Promise.all(
      Object.entries(productCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(async ([productId, count]) => {
          const product = await ctx.db.get(productId as any);
          if (!product || !('storeId' in product) || !product.storeId) return null;
          const store = await ctx.db.get(product.storeId);
          return {
            ...product,
            storeName: store?.name || "Unknown",
            orderCount: count,
          };
        })
    );

    return trendingProducts.filter(p => p !== null);
  },
});

export const getPriceDropAlerts = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    // Get user's favorite products
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.neq(q.field("productId"), undefined))
      .collect();

    // For now, return empty array as we don't have price history tracking
    // This would require a new table to track price changes over time
    return [];
  },
});