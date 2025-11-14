import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove
      phone: v.optional(v.string()), // phone number of the user
      lat: v.optional(v.number()), // latitude of the user's location
      lng: v.optional(v.number()), // longitude of the user's location
      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Admin-managed categories
    categories: defineTable({
      name: v.string(),
      emoji: v.string(),
      slug: v.string(),
      isActive: v.boolean(),
      sortOrder: v.number(),
    }).index("by_slug", ["slug"]),

    // Admin-managed featured categories for homepage
    featuredCategories: defineTable({
      name: v.string(),
      emoji: v.string(),
      color: v.string(), // gradient color classes
      isActive: v.boolean(),
      sortOrder: v.number(),
    }),

    // Admin-managed quick actions
    quickActions: defineTable({
      title: v.string(),
      icon: v.string(), // emoji
      description: v.string(),
      isActive: v.boolean(),
      sortOrder: v.number(),
    }),

    // Admin-managed banners/promotions
    banners: defineTable({
      title: v.string(),
      subtitle: v.optional(v.string()),
      description: v.optional(v.string()),
      image: v.optional(v.string()),
      buttonText: v.optional(v.string()),
      buttonLink: v.optional(v.string()),
      backgroundColor: v.optional(v.string()),
      textColor: v.optional(v.string()),
      type: v.union(
        v.literal("hero"),
        v.literal("promotional"),
        v.literal("special_offer")
      ),
      isActive: v.boolean(),
      sortOrder: v.number(),
    }),

    // Theme configuration
    themeConfig: defineTable({
      key: v.string(), // unique key for the setting
      value: v.string(), // JSON stringified value
      category: v.string(), // colors, layout, branding, etc.
      description: v.optional(v.string()),
    }).index("by_key", ["key"]),

    // App settings
    appSettings: defineTable({
      appName: v.string(),
      logo: v.optional(v.string()),
      primaryColor: v.optional(v.string()),
      secondaryColor: v.optional(v.string()),
      deliveryRadius: v.optional(v.number()), // default delivery radius in km
      minOrderAmount: v.optional(v.number()),
      deliveryFee: v.optional(v.number()),
      contactEmail: v.optional(v.string()),
      contactPhone: v.optional(v.string()),
      aboutText: v.optional(v.string()),
    }),

    stores: defineTable({
      name: v.string(),
      description: v.string(),
      image: v.string(),
      category: v.string(),
      rating: v.number(),
      deliveryTime: v.string(),
      minOrder: v.number(),
      lat: v.number(),
      lng: v.number(),
      isOpen: v.optional(v.boolean()),
      isActive: v.boolean(), // admin can activate/deactivate
      isFeatured: v.optional(v.boolean()), // featured stores
    }).index("by_category", ["category"]),

    products: defineTable({
      storeId: v.id("stores"),
      name: v.string(),
      description: v.string(),
      image: v.string(),
      price: v.number(),
      category: v.string(),
      inStock: v.boolean(),
      isFeatured: v.optional(v.boolean()), // admin can feature products
      discount: v.optional(v.number()), // discount percentage
    }).index("by_store", ["storeId"])
      .index("by_category", ["category"]),

    cart: defineTable({
      userId: v.id("users"),
      productId: v.id("products"),
      quantity: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_product", ["userId", "productId"]),

    orders: defineTable({
      userId: v.id("users"),
      items: v.array(v.object({
        productId: v.id("products"),
        productName: v.string(),
        quantity: v.number(),
        price: v.number(),
      })),
      storeId: v.id("stores"),
      storeName: v.string(),
      totalAmount: v.number(),
      deliveryAddress: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("preparing"),
        v.literal("out_for_delivery"),
        v.literal("delivered"),
        v.literal("cancelled")
      ),
    }).index("by_user", ["userId"]),

    addresses: defineTable({
      userId: v.id("users"),
      label: v.string(),
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      isDefault: v.boolean(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;