import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        const store = product ? await ctx.db.get(product.storeId) : null;
        return { ...item, product, store };
      })
    );
    
    return itemsWithDetails;
  },
});

export const addItem = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const existing = await ctx.db
      .query("cart")
      .withIndex("by_user_and_product", (q) => 
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .unique();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
      });
      return existing._id;
    }
    
    return await ctx.db.insert("cart", {
      userId: user._id,
      productId: args.productId,
      quantity: args.quantity,
    });
  },
});

export const updateQuantity = mutation({
  args: {
    cartItemId: v.id("cart"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
    } else {
      await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
    }
  },
});

export const removeItem = mutation({
  args: { cartItemId: v.id("cart") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    await ctx.db.delete(args.cartItemId);
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const items = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    await Promise.all(items.map(item => ctx.db.delete(item._id)));
  },
});

export const moveToFavorites = mutation({
  args: { cartItemId: v.id("cart") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem || cartItem.userId !== user._id) {
      throw new Error("Cart item not found");
    }
    
    // Check if already in favorites
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const alreadyFavorited = existing.some(f => f.productId === cartItem.productId);
    
    if (!alreadyFavorited) {
      await ctx.db.insert("favorites", {
        userId: user._id,
        productId: cartItem.productId,
      });
    }
    
    // Remove from cart
    await ctx.db.delete(args.cartItemId);
  },
});