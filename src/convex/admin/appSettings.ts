import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentUser } from "../users";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("appSettings").first();
    return settings || null;
  },
});

export const update = mutation({
  args: {
    appName: v.optional(v.string()),
    logo: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    deliveryRadius: v.optional(v.number()),
    minOrderAmount: v.optional(v.number()),
    deliveryFee: v.optional(v.number()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    aboutText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const existing = await ctx.db.query("appSettings").first();
    
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("appSettings", {
        appName: args.appName || "TownShop",
        logo: args.logo,
        primaryColor: args.primaryColor,
        secondaryColor: args.secondaryColor,
        deliveryRadius: args.deliveryRadius,
        minOrderAmount: args.minOrderAmount,
        deliveryFee: args.deliveryFee,
        contactEmail: args.contactEmail,
        contactPhone: args.contactPhone,
        aboutText: args.aboutText,
      });
    }
  },
});
