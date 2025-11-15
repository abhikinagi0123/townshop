import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    storeId: v.optional(v.id("stores")),
    type: v.optional(v.union(
      v.literal("shop_discount"),
      v.literal("delivery_deal"),
      v.literal("site_wide")
    )),
  },
  handler: async (ctx, args) => {
    let offers = await ctx.db.query("offers").collect();
    
    // Filter by active status
    const now = Date.now();
    offers = offers.filter(offer => 
      offer.isActive && 
      offer.validFrom <= now && 
      offer.validUntil >= now
    );
    
    // Filter by store if provided
    if (args.storeId) {
      offers = offers.filter(offer => 
        !offer.storeId || offer.storeId === args.storeId
      );
    }
    
    // Filter by type if provided
    if (args.type) {
      offers = offers.filter(offer => offer.type === args.type);
    }
    
    return offers;
  },
});

export const getActiveOffers = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query("offers")
      .filter((q) => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.lte(q.field("validFrom"), now),
          q.gte(q.field("validUntil"), now)
        )
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    code: v.optional(v.string()),
    discountPercent: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    minOrderAmount: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    type: v.union(
      v.literal("shop_discount"),
      v.literal("delivery_deal"),
      v.literal("site_wide")
    ),
    storeId: v.optional(v.id("stores")),
    validFrom: v.number(),
    validUntil: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("offers", args);
  },
});

export const validateCoupon = query({
  args: {
    code: v.string(),
    storeId: v.optional(v.id("stores")),
    orderAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Find the offer by code
    const offers = await ctx.db.query("offers").collect();
    const offer = offers.find(o => 
      o.code === args.code &&
      o.isActive &&
      o.validFrom <= now &&
      o.validUntil >= now
    );
    
    if (!offer) {
      return { valid: false, message: "Invalid or expired coupon code" };
    }
    
    // Check if store-specific
    if (offer.storeId && args.storeId && offer.storeId !== args.storeId) {
      return { valid: false, message: "This coupon is not valid for this store" };
    }
    
    // Check minimum order amount
    if (offer.minOrderAmount && args.orderAmount < offer.minOrderAmount) {
      return { 
        valid: false, 
        message: `Minimum order amount of ₹${offer.minOrderAmount} required` 
      };
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (offer.discountPercent) {
      discountAmount = (args.orderAmount * offer.discountPercent) / 100;
      if (offer.maxDiscount) {
        discountAmount = Math.min(discountAmount, offer.maxDiscount);
      }
    } else if (offer.discountAmount) {
      discountAmount = offer.discountAmount;
    }
    
    return {
      valid: true,
      offer,
      discountAmount,
      message: `Coupon applied! You saved ₹${discountAmount}`,
    };
  },
});