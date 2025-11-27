import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();
    const products = await ctx.db.query("products").collect();
    const orders = await ctx.db.query("orders").collect();
    const users = await ctx.db.query("users").collect();
    
    const totalRevenue = orders
      .filter(o => o.status === "delivered")
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    const activeStores = stores.filter(s => s.isOpen).length;
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    
    return {
      totalStores: stores.length,
      activeStores,
      totalProducts: products.length,
      totalOrders: orders.length,
      pendingOrders,
      totalUsers: users.length,
      totalRevenue,
      recentOrders: orders.slice(-10).reverse(),
    };
  },
});

export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const orders = await ctx.db.query("orders")
      .order("desc")
      .take(limit);
    
    return orders;
  },
});
