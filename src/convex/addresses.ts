import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    return await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    label: v.string(),
    street: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    if (args.isDefault) {
      const existing = await ctx.db
        .query("addresses")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      
      await Promise.all(
        existing.map(addr => ctx.db.patch(addr._id, { isDefault: false }))
      );
    }
    
    return await ctx.db.insert("addresses", {
      userId: user._id,
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    addressId: v.id("addresses"),
    label: v.string(),
    street: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const { addressId, ...updates } = args;
    
    if (updates.isDefault) {
      const existing = await ctx.db
        .query("addresses")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      
      await Promise.all(
        existing.map(addr => ctx.db.patch(addr._id, { isDefault: false }))
      );
    }
    
    await ctx.db.patch(addressId, updates);
  },
});

export const remove = mutation({
  args: { addressId: v.id("addresses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    await ctx.db.delete(args.addressId);
  },
});