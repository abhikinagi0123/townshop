import { mutation } from "./_generated/server";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Seed app settings
    await ctx.db.insert("appSettings", {
      appName: "TownShop",
      deliveryRadius: 10,
      minOrderAmount: 0,
      deliveryFee: 40,
      contactEmail: "support@townshop.com",
      contactPhone: "+91 1234567890",
      aboutText: "Your local delivery partner",
    });

    // Seed categories
    const categories = [
      { name: "All", emoji: "🏪", slug: "all", sortOrder: 0 },
      { name: "Grocery", emoji: "🛒", slug: "grocery", sortOrder: 1 },
      { name: "Food", emoji: "🍕", slug: "food", sortOrder: 2 },
      { name: "Pharmacy", emoji: "💊", slug: "pharmacy", sortOrder: 3 },
      { name: "Electronics", emoji: "📱", slug: "electronics", sortOrder: 4 },
    ];

    for (const cat of categories) {
      await ctx.db.insert("categories", { ...cat, isActive: true });
    }

    // Seed featured categories
    const featuredCategories = [
      { name: "Vegetables & Fruits", emoji: "🥬", color: "from-green-500 to-emerald-600", sortOrder: 0 },
      { name: "Dairy & Breakfast", emoji: "🥛", color: "from-blue-500 to-cyan-600", sortOrder: 1 },
      { name: "Munchies", emoji: "🍿", color: "from-orange-500 to-amber-600", sortOrder: 2 },
      { name: "Cold Drinks", emoji: "🥤", color: "from-red-500 to-pink-600", sortOrder: 3 },
      { name: "Instant Food", emoji: "🍜", color: "from-purple-500 to-violet-600", sortOrder: 4 },
      { name: "Tea & Coffee", emoji: "☕", color: "from-yellow-500 to-orange-600", sortOrder: 5 },
      { name: "Bakery & Biscuits", emoji: "🍪", color: "from-pink-500 to-rose-600", sortOrder: 6 },
      { name: "Sauces & Spreads", emoji: "🍯", color: "from-amber-500 to-yellow-600", sortOrder: 7 },
    ];

    for (const cat of featuredCategories) {
      await ctx.db.insert("featuredCategories", { ...cat, isActive: true });
    }

    // Seed quick actions
    const quickActions = [
      { title: "10-Min Delivery", icon: "⚡", description: "Lightning fast", sortOrder: 0 },
      { title: "Fresh Produce", icon: "🌿", description: "Farm to home", sortOrder: 1 },
      { title: "Best Prices", icon: "💰", description: "Save more", sortOrder: 2 },
      { title: "24/7 Available", icon: "🌙", description: "Always open", sortOrder: 3 },
    ];

    for (const action of quickActions) {
      await ctx.db.insert("quickActions", { ...action, isActive: true });
    }

    // Seed banners
    await ctx.db.insert("banners", {
      title: "Up to 50% OFF",
      subtitle: "🔥 Hot Deals",
      description: "On selected items",
      buttonText: "Shop Now",
      backgroundColor: "from-orange-500 to-pink-500",
      textColor: "text-white",
      type: "special_offer",
      isActive: true,
      sortOrder: 0,
    });

    // Seed stores
    const store1 = await ctx.db.insert("stores", {
      name: "Fresh Mart",
      description: "Your daily grocery needs delivered fresh",
      image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400",
      category: "Grocery",
      rating: 4.5,
      deliveryTime: "15-20 min",
      minOrder: 99,
      lat: 28.6139,
      lng: 77.2090,
      isOpen: true,
      isActive: true,
      isFeatured: true,
    });

    const store2 = await ctx.db.insert("stores", {
      name: "Pizza Palace",
      description: "Authentic Italian pizzas and pasta",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
      category: "Food",
      rating: 4.7,
      deliveryTime: "25-30 min",
      minOrder: 199,
      lat: 28.6189,
      lng: 77.2150,
      isOpen: true,
      isActive: true,
      isFeatured: true,
    });

    const store3 = await ctx.db.insert("stores", {
      name: "Burger Hub",
      description: "Juicy burgers and crispy fries",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
      category: "Food",
      rating: 4.3,
      deliveryTime: "20-25 min",
      minOrder: 149,
      lat: 28.6100,
      lng: 77.2050,
      isOpen: true,
      isActive: true,
    });

    const store4 = await ctx.db.insert("stores", {
      name: "Pharma Plus",
      description: "Medicines and healthcare products",
      image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400",
      category: "Pharmacy",
      rating: 4.8,
      deliveryTime: "10-15 min",
      minOrder: 0,
      lat: 28.6200,
      lng: 77.2100,
      isOpen: true,
      isActive: true,
    });

    // Seed products for Fresh Mart
    await ctx.db.insert("products", {
      storeId: store1,
      name: "Fresh Milk",
      description: "Full cream fresh milk 1L",
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300",
      price: 65,
      category: "Dairy",
      inStock: true,
      isFeatured: true,
    });

    await ctx.db.insert("products", {
      storeId: store1,
      name: "Brown Bread",
      description: "Whole wheat bread loaf",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300",
      price: 45,
      category: "Bakery",
      inStock: true,
    });

    await ctx.db.insert("products", {
      storeId: store1,
      name: "Fresh Eggs",
      description: "Farm fresh eggs - 12 pack",
      image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300",
      price: 85,
      category: "Dairy",
      inStock: true,
    });

    // Seed products for Pizza Palace
    await ctx.db.insert("products", {
      storeId: store2,
      name: "Margherita Pizza",
      description: "Classic tomato and mozzarella",
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300",
      price: 299,
      category: "Pizza",
      inStock: true,
      isFeatured: true,
    });

    await ctx.db.insert("products", {
      storeId: store2,
      name: "Pepperoni Pizza",
      description: "Loaded with pepperoni and cheese",
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300",
      price: 399,
      category: "Pizza",
      inStock: true,
    });

    await ctx.db.insert("products", {
      storeId: store2,
      name: "Pasta Alfredo",
      description: "Creamy alfredo pasta",
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300",
      price: 249,
      category: "Pasta",
      inStock: true,
    });

    // Seed products for Burger Hub
    await ctx.db.insert("products", {
      storeId: store3,
      name: "Classic Burger",
      description: "Beef patty with lettuce and tomato",
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=300",
      price: 179,
      category: "Burgers",
      inStock: true,
    });

    await ctx.db.insert("products", {
      storeId: store3,
      name: "Cheese Fries",
      description: "Crispy fries with cheese sauce",
      image: "https://images.unsplash.com/photo-1630431341973-02e1d0f45e79?w=300",
      price: 129,
      category: "Sides",
      inStock: true,
    });

    return { success: true, message: "Database seeded successfully with admin-managed content!" };
  },
});