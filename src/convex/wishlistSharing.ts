import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createSharedWishlist = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    productIds: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const shareCode = `WL${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    return await ctx.db.insert("sharedWishlists", {
      userId: user._id,
      userName: user.name || "Anonymous",
      name: args.name,
      description: args.description,
      productIds: args.productIds,
      shareCode,
      isPublic: true,
    });
  },
});

export const getByShareCode = query({
  args: { shareCode: v.string() },
  handler: async (ctx, args) => {
    const wishlist = await ctx.db
      .query("sharedWishlists")
      .withIndex("by_share_code", (q) => q.eq("shareCode", args.shareCode))
      .first();
    
    if (!wishlist) return null;
    
    const products = await Promise.all(
      wishlist.productIds.map(async (id) => {
        const product = await ctx.db.get(id);
        if (!product) return null;
        const store = await ctx.db.get(product.storeId);
        return { ...product, storeName: store?.name || "Unknown" };
      })
    );
    
    return {
      ...wishlist,
      products: products.filter(p => p !== null),
    };
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    return await ctx.db
      .query("sharedWishlists")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});
