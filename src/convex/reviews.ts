import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    productId: v.optional(v.id("products")),
    storeId: v.optional(v.id("stores")),
    rating: v.number(),
    comment: v.string(),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Verify user has ordered from this store/product
    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== user._id) {
      throw new Error("You can only review items you've ordered");
    }

    // Check if user already reviewed this product/store for this order
    const existingReview = await ctx.db
      .query("reviews")
      .filter((q) => 
        q.and(
          q.eq(q.field("orderId"), args.orderId),
          q.eq(q.field("userId"), user._id),
          args.productId 
            ? q.eq(q.field("productId"), args.productId)
            : q.eq(q.field("storeId"), args.storeId)
        )
      )
      .first();

    if (existingReview) {
      throw new Error("You have already reviewed this item");
    }

    return await ctx.db.insert("reviews", {
      userId: user._id,
      userName: user.name || "Anonymous",
      productId: args.productId,
      storeId: args.storeId,
      rating: args.rating,
      comment: args.comment,
      orderId: args.orderId,
      isVerified: true,
    });
  },
});

export const listByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();
  },
});

export const listByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .collect();
  },
});

export const getAverageRating = query({
  args: {
    productId: v.optional(v.id("products")),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, args) => {
    let reviews;
    if (args.productId) {
      reviews = await ctx.db
        .query("reviews")
        .withIndex("by_product", (q) => q.eq("productId", args.productId))
        .collect();
    } else if (args.storeId) {
      reviews = await ctx.db
        .query("reviews")
        .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
        .collect();
    } else {
      return null;
    }

    if (reviews.length === 0) return null;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    
    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      const rating = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5;
      distribution[rating]++;
    });

    return {
      average: sum / reviews.length,
      count: reviews.length,
      distribution,
    };
  },
});
