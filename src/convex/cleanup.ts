import { mutation } from "./_generated/server";

export const removeTestData = mutation({
  args: {},
  handler: async (ctx) => {
    // Test store names to remove
    const testStoreNames = ["Fresh Mart", "Pizza Palace", "Burger Hub", "Pharma Plus"];
    
    // Get all stores
    const allStores = await ctx.db.query("stores").collect();
    
    let deletedStores = 0;
    let deletedProducts = 0;
    
    // Delete test stores and their products
    for (const store of allStores) {
      if (testStoreNames.includes(store.name)) {
        // Delete all products from this store
        const products = await ctx.db
          .query("products")
          .withIndex("by_store", (q) => q.eq("storeId", store._id))
          .collect();
        
        for (const product of products) {
          await ctx.db.delete(product._id);
          deletedProducts++;
        }
        
        // Delete the store
        await ctx.db.delete(store._id);
        deletedStores++;
      }
    }
    
    // Delete test offers
    const offers = await ctx.db.query("offers").collect();
    let deletedOffers = 0;
    for (const offer of offers) {
      await ctx.db.delete(offer._id);
      deletedOffers++;
    }
    
    return {
      success: true,
      deletedStores,
      deletedProducts,
      deletedOffers,
      message: `Removed ${deletedStores} test stores, ${deletedProducts} test products, and ${deletedOffers} test offers`,
    };
  },
});
