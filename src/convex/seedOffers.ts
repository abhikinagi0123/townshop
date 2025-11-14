import { mutation } from "./_generated/server";

export const seedOffers = mutation({
  args: {},
  handler: async (ctx) => {
    // Get some stores for shop-specific offers
    const stores = await ctx.db.query("stores").take(3);
    
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const twoWeeks = 14 * 24 * 60 * 60 * 1000;
    
    const offers = [
      // Site-wide offers
      {
        title: "Welcome Offer",
        description: "Get 20% off on your first order",
        code: "WELCOME20",
        discountPercent: 20,
        minOrderAmount: 299,
        maxDiscount: 100,
        type: "site_wide" as const,
        validFrom: now,
        validUntil: now + twoWeeks,
        isActive: true,
      },
      {
        title: "Free Delivery",
        description: "Free delivery on orders above ₹499",
        code: "FREEDEL",
        discountAmount: 40,
        minOrderAmount: 499,
        type: "delivery_deal" as const,
        validFrom: now,
        validUntil: now + oneWeek,
        isActive: true,
      },
      {
        title: "Weekend Special",
        description: "Flat ₹150 off on orders above ₹999",
        code: "WEEKEND150",
        discountAmount: 150,
        minOrderAmount: 999,
        type: "site_wide" as const,
        validFrom: now,
        validUntil: now + twoWeeks,
        isActive: true,
      },
      // Delivery deals
      {
        title: "Express Delivery",
        description: "Get 50% off on delivery charges",
        code: "EXPRESS50",
        discountPercent: 50,
        minOrderAmount: 199,
        maxDiscount: 20,
        type: "delivery_deal" as const,
        validFrom: now,
        validUntil: now + oneWeek,
        isActive: true,
      },
    ];
    
    // Add site-wide and delivery offers
    for (const offer of offers) {
      await ctx.db.insert("offers", offer);
    }
    
    // Add shop-specific offers
    if (stores.length > 0) {
      await ctx.db.insert("offers", {
        title: "Shop Exclusive",
        description: "Get 15% off on all items from this store",
        code: "SHOP15",
        discountPercent: 15,
        minOrderAmount: 199,
        maxDiscount: 75,
        type: "shop_discount" as const,
        storeId: stores[0]._id,
        validFrom: now,
        validUntil: now + oneWeek,
        isActive: true,
      });
    }
    
    return { success: true, count: offers.length + (stores.length > 0 ? 1 : 0) };
  },
});
