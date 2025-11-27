import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getMyShop = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    
    // Find store owned by this user
    const stores = await ctx.db.query("stores").collect();
    const myStore = stores.find(s => (s as any).ownerId === user._id);
    
    if (!myStore) return null;
    
    // Get products for this store
    const products = await ctx.db
      .query("products")
      .withIndex("by_store", (q) => q.eq("storeId", myStore._id))
      .collect();
    
    // Get orders for this store
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    return {
      ...myStore,
      productsCount: products.length,
      ordersCount: orders.length,
    };
  },
});

export const updateShop = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    isOpen: v.optional(v.boolean()),
    deliveryTime: v.optional(v.string()),
    minOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const { storeId, ...updates } = args;
    await ctx.db.patch(storeId, updates);
    
    return { success: true };
  },
});

export const getShopOrders = query({
  args: {
    storeId: v.id("stores"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    let orders = await ctx.db.query("orders").collect();
    orders = orders.filter(o => o.storeId === args.storeId);
    
    if (args.status) {
      orders = orders.filter(o => o.status === args.status);
    }
    
    return orders.sort((a, b) => b._creationTime - a._creationTime);
  },
});
