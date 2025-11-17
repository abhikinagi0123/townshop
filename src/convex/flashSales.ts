import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const flashSales = await ctx.db
      .query("flashSales")
      .filter((q) => q.and(
        q.lte(q.field("startTime"), now),
        q.gte(q.field("endTime"), now),
        q.eq(q.field("isActive"), true)
      ))
      .collect();
    
    return await Promise.all(
      flashSales.map(async (sale) => {
        const product = await ctx.db.get(sale.productId);
        const store = product ? await ctx.db.get(product.storeId) : null;
        return {
          ...sale,
          product,
          storeName: store?.name || "Unknown Store",
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    discountPercent: v.number(),
    startTime: v.number(),
    endTime: v.number(),
    maxQuantity: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("flashSales", {
      ...args,
      soldQuantity: 0,
      isActive: true,
    });
  },
});

export const purchase = mutation({
  args: {
    flashSaleId: v.id("flashSales"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const sale = await ctx.db.get(args.flashSaleId);
    if (!sale) throw new Error("Flash sale not found");
    
    const remainingStock = sale.maxQuantity - sale.soldQuantity;
    
    if (remainingStock <= 0) {
      throw new Error("Flash sale is sold out!");
    }
    
    if (args.quantity > remainingStock) {
      throw new Error(`Only ${remainingStock} items available!`);
    }
    
    await ctx.db.patch(args.flashSaleId, {
      soldQuantity: sale.soldQuantity + args.quantity,
    });
    
    return { success: true, remainingStock: remainingStock - args.quantity };
  },
});

export const checkAvailability = query({
  args: {
    flashSaleId: v.id("flashSales"),
  },
  handler: async (ctx, args) => {
    const sale = await ctx.db.get(args.flashSaleId);
    if (!sale) return null;
    
    const remainingStock = sale.maxQuantity - sale.soldQuantity;
    const isSoldOut = remainingStock <= 0;
    const isLowStock = remainingStock > 0 && remainingStock <= 5;
    
    return {
      remainingStock,
      isSoldOut,
      isLowStock,
      percentSold: (sale.soldQuantity / sale.maxQuantity) * 100,
    };
  },
});