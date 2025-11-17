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

export const share = mutation({
  args: {
    recipientEmail: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.neq(q.field("productId"), undefined))
      .collect();
    
    if (favorites.length === 0) {
      throw new Error("No products in favorites to share");
    }
    
    const productIds = favorites
      .map(f => f.productId)
      .filter((id): id is NonNullable<typeof id> => id !== undefined);
    
    const shareCode = `WL${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    await ctx.db.insert("sharedWishlists", {
      userId: user._id,
      userName: user.name || "Anonymous",
      name: `${user.name || "Anonymous"}'s Wishlist`,
      description: args.message,
      productIds,
      shareCode,
      isPublic: true,
    });
    
    return { shareCode, shareUrl: `${process.env.CONVEX_SITE_URL || ''}/wishlist/${shareCode}` };
  },
});

export const listShared = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const allWishlists = await ctx.db.query("sharedWishlists").collect();
    
    return allWishlists
      .filter(w => w.userId !== user._id)
      .map(w => ({
        ...w,
        senderName: w.userName,
        message: w.description,
        isAccepted: false,
      }));
  },
});

export const accept = mutation({
  args: { wishlistId: v.id("sharedWishlists") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const wishlist = await ctx.db.get(args.wishlistId);
    if (!wishlist) throw new Error("Wishlist not found");
    
    for (const productId of wishlist.productIds) {
      const existing = await ctx.db
        .query("favorites")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("productId"), productId))
        .first();
      
      if (!existing) {
        await ctx.db.insert("favorites", {
          userId: user._id,
          productId,
          storeId: undefined,
        });
      }
    }
    
    return { success: true, addedCount: wishlist.productIds.length };
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

export const deleteSharedWishlist = mutation({
  args: { wishlistId: v.id("sharedWishlists") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const wishlist = await ctx.db.get(args.wishlistId);
    if (!wishlist || wishlist.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.delete(args.wishlistId);
  },
});