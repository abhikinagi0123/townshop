import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const add = mutation({
  args: {
    productId: v.optional(v.id("products")),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => {
        if (args.productId) {
          return q.eq(q.field("productId"), args.productId);
        }
        return q.eq(q.field("storeId"), args.storeId);
      })
      .first();

    if (existing) {
      throw new Error("Already in favorites");
    }

    return await ctx.db.insert("favorites", {
      userId: user._id,
      productId: args.productId,
      storeId: args.storeId,
    });
  },
});

export const remove = mutation({
  args: { favoriteId: v.id("favorites") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const favorite = await ctx.db.get(args.favoriteId);
    if (!favorite || favorite.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.favoriteId);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const favoritesWithDetails = await Promise.all(
      favorites.map(async (fav) => {
        if (fav.productId) {
          const product = await ctx.db.get(fav.productId);
          const store = product ? await ctx.db.get(product.storeId) : null;
          return {
            ...fav,
            product,
            storeName: store?.name,
          };
        } else if (fav.storeId) {
          const store = await ctx.db.get(fav.storeId);
          return {
            ...fav,
            store,
          };
        }
        return fav;
      })
    );

    return favoritesWithDetails;
  },
});

export const isFavorite = query({
  args: {
    productId: v.optional(v.id("products")),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => {
        if (args.productId) {
          return q.eq(q.field("productId"), args.productId);
        }
        return q.eq(q.field("storeId"), args.storeId);
      })
      .first();

    return !!favorite;
  },
});
