import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const trackPriceChange = mutation({
  args: {
    productId: v.id("products"),
    oldPrice: v.number(),
    newPrice: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all users who have this product in favorites
    const favorites = await ctx.db
      .query("favorites")
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .collect();

    // If price dropped, notify users
    if (args.newPrice < args.oldPrice) {
      const product = await ctx.db.get(args.productId);
      if (!product) return;

      const store = await ctx.db.get(product.storeId);
      const priceDrop = args.oldPrice - args.newPrice;
      const percentDrop = Math.round((priceDrop / args.oldPrice) * 100);

      // Create notifications for all users who favorited this product
      await Promise.all(
        favorites.map(async (fav) => {
          await ctx.db.insert("notifications", {
            userId: fav.userId,
            title: "Price Drop Alert! 🎉",
            message: `${product.name} at ${store?.name} is now ₹${args.newPrice} (${percentDrop}% off)`,
            type: "promotion",
            isRead: false,
          });
        })
      );
    }
  },
});

export const getPriceDrops = query({
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

    const priceDrops = await Promise.all(
      favorites.map(async (fav) => {
        if (!fav.productId) return null;
        const product = await ctx.db.get(fav.productId);
        if (!product) return null;
        const store = await ctx.db.get(product.storeId);
        return {
          product,
          storeName: store?.name || "Unknown",
          currentPrice: product.price,
        };
      })
    );

    return priceDrops.filter(p => p !== null);
  },
});
