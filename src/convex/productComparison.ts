import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const compareProducts = query({
  args: {
    productIds: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    if (args.productIds.length < 2 || args.productIds.length > 4) {
      throw new Error("Can compare 2-4 products at a time");
    }

    const products = await Promise.all(
      args.productIds.map(async (id) => {
        const product = await ctx.db.get(id);
        if (!product) return null;

        const store = await ctx.db.get(product.storeId);
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_product", (q) => q.eq("productId", id))
          .collect();

        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        return {
          ...product,
          storeName: store?.name || "Unknown",
          avgRating,
          reviewCount: reviews.length,
        };
      })
    );

    return products.filter((p) => p !== null);
  },
});

export const getSimilarProducts = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return [];

    const limit = args.limit || 6;

    // Find products in same category with similar price range
    const priceRange = product.price * 0.3; // 30% price variance
    const similarProducts = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", product.category))
      .filter((q) =>
        q.and(
          q.neq(q.field("_id"), args.productId),
          q.gte(q.field("price"), product.price - priceRange),
          q.lte(q.field("price"), product.price + priceRange)
        )
      )
      .take(limit);

    return await Promise.all(
      similarProducts.map(async (p) => {
        const store = await ctx.db.get(p.storeId);
        return {
          ...p,
          storeName: store?.name || "Unknown",
        };
      })
    );
  },
});
