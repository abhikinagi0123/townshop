import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateStock = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    changeType: v.union(
      v.literal("restock"),
      v.literal("sale"),
      v.literal("adjustment"),
      v.literal("return")
    ),
    orderId: v.optional(v.id("orders")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const currentQuantity = product.stockQuantity || 0;
    const newQuantity = Math.max(0, currentQuantity + args.quantity);

    // Update product stock
    await ctx.db.patch(args.productId, {
      stockQuantity: newQuantity,
      inStock: newQuantity > 0,
    });

    // Record inventory history
    await ctx.db.insert("inventoryHistory", {
      productId: args.productId,
      storeId: product.storeId,
      previousQuantity: currentQuantity,
      newQuantity,
      changeType: args.changeType,
      orderId: args.orderId,
      notes: args.notes,
    });

    // Check for low stock and notify
    const lowStockThreshold = product.lowStockThreshold || 10;
    if (newQuantity <= lowStockThreshold && newQuantity > 0) {
      // Notify users who have stock alerts for this product
      const alerts = await ctx.db
        .query("stockAlerts")
        .withIndex("by_product", (q) => q.eq("productId", args.productId))
        .filter((q) => q.eq(q.field("isNotified"), false))
        .collect();

      for (const alert of alerts) {
        await ctx.db.insert("notifications", {
          userId: alert.userId,
          title: "Low Stock Alert",
          message: `${product.name} is running low on stock. Order now!`,
          type: "system",
          isRead: false,
        });
        
        await ctx.db.patch(alert._id, { isNotified: true });
      }
    }

    // Notify users when out-of-stock items are back in stock
    if (currentQuantity === 0 && newQuantity > 0) {
      const alerts = await ctx.db
        .query("stockAlerts")
        .withIndex("by_product", (q) => q.eq("productId", args.productId))
        .collect();

      for (const alert of alerts) {
        await ctx.db.insert("notifications", {
          userId: alert.userId,
          title: "Back in Stock! 🎉",
          message: `${product.name} is now available. Order before it runs out!`,
          type: "system",
          isRead: false,
        });
        
        await ctx.db.patch(alert._id, { isNotified: false });
      }
    }

    return { newQuantity, inStock: newQuantity > 0 };
  },
});

export const getLowStockProducts = query({
  args: {
    storeId: v.optional(v.id("stores")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    let products = await ctx.db.query("products").collect();

    if (args.storeId) {
      products = products.filter(p => p.storeId === args.storeId);
    }

    const lowStockProducts = products
      .filter(p => {
        const quantity = p.stockQuantity || 0;
        const threshold = p.lowStockThreshold || 10;
        return quantity > 0 && quantity <= threshold;
      })
      .slice(0, limit);

    return await Promise.all(
      lowStockProducts.map(async (product) => {
        const store = await ctx.db.get(product.storeId);
        return {
          ...product,
          storeName: store?.name || "Unknown Store",
        };
      })
    );
  },
});

export const getInventoryHistory = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("inventoryHistory")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .take(limit);
  },
});
