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
      loyaltyPoints: v.optional(v.number()), // loyalty points
      loyaltyTier: v.optional(v.union(
        v.literal("bronze"),
        v.literal("silver"),
        v.literal("gold"),
        v.literal("platinum")
      )),
      walletBalance: v.optional(v.number()), // wallet balance in rupees
    }).index("email", ["email"]), // index for the email. do not remove or modify

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
      hours: v.optional(v.object({
        monday: v.optional(v.string()),
        tuesday: v.optional(v.string()),
        wednesday: v.optional(v.string()),
        thursday: v.optional(v.string()),
        friday: v.optional(v.string()),
        saturday: v.optional(v.string()),
        sunday: v.optional(v.string()),
      })),
      policies: v.optional(v.object({
        returnPolicy: v.optional(v.string()),
        refundPolicy: v.optional(v.string()),
        deliveryAreas: v.optional(v.array(v.string())),
        deliveryRadius: v.optional(v.number()),
      })),
    }),

    products: defineTable({
      storeId: v.id("stores"),
      name: v.string(),
      description: v.string(),
      image: v.string(),
      price: v.number(),
      category: v.string(),
      inStock: v.boolean(),
      variants: v.optional(v.array(v.object({
        name: v.string(),
        options: v.array(v.string()),
      }))),
      compareSpecs: v.optional(v.object({
        brand: v.optional(v.string()),
        weight: v.optional(v.string()),
        dimensions: v.optional(v.string()),
        features: v.optional(v.array(v.string())),
      })),
    }).index("by_store", ["storeId"]),

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
      deliveryPartner: v.optional(v.object({
        name: v.string(),
        phone: v.string(),
        vehicleNumber: v.optional(v.string()),
        currentLat: v.optional(v.number()),
        currentLng: v.optional(v.number()),
        lastLocationUpdate: v.optional(v.number()),
      })),
      scheduledFor: v.optional(v.number()),
      isRecurring: v.optional(v.boolean()),
      recurringFrequency: v.optional(v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly")
      )),
      paymentMethod: v.optional(v.string()),
      paymentStatus: v.optional(v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("refunded")
      )),
      loyaltyPointsEarned: v.optional(v.number()),
      deliveryTip: v.optional(v.number()),
      orderNotes: v.optional(v.string()),
      appliedCoupon: v.optional(v.object({
        code: v.string(),
        discountAmount: v.number(),
      })),
    }).index("by_user", ["userId"]),

    addresses: defineTable({
      userId: v.id("users"),
      label: v.string(),
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      lat: v.optional(v.number()),
      lng: v.optional(v.number()),
      isDefault: v.boolean(),
    }).index("by_user", ["userId"]),

    offers: defineTable({
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
    }).index("by_store", ["storeId"]),

    reviews: defineTable({
      userId: v.id("users"),
      userName: v.string(),
      productId: v.optional(v.id("products")),
      storeId: v.optional(v.id("stores")),
      rating: v.number(),
      comment: v.string(),
      orderId: v.id("orders"),
      isVerified: v.boolean(),
    })
      .index("by_product", ["productId"])
      .index("by_store", ["storeId"])
      .index("by_user", ["userId"]),

    favorites: defineTable({
      userId: v.id("users"),
      productId: v.optional(v.id("products")),
      storeId: v.optional(v.id("stores")),
    }).index("by_user", ["userId"]),

    notifications: defineTable({
      userId: v.id("users"),
      title: v.string(),
      message: v.string(),
      type: v.union(
        v.literal("order_update"),
        v.literal("promotion"),
        v.literal("system")
      ),
      orderId: v.optional(v.id("orders")),
      isRead: v.boolean(),
    }).index("by_user", ["userId"]),

    payments: defineTable({
      userId: v.id("users"),
      orderId: v.id("orders"),
      amount: v.number(),
      method: v.union(
        v.literal("card"),
        v.literal("upi"),
        v.literal("wallet"),
        v.literal("cod")
      ),
      status: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("refunded")
      ),
      transactionId: v.optional(v.string()),
      cardLast4: v.optional(v.string()),
      upiId: v.optional(v.string()),
    }).index("by_user", ["userId"])
      .index("by_order", ["orderId"]),

    savedPaymentMethods: defineTable({
      userId: v.id("users"),
      type: v.union(
        v.literal("card"),
        v.literal("upi"),
        v.literal("wallet")
      ),
      cardLast4: v.optional(v.string()),
      cardBrand: v.optional(v.string()),
      upiId: v.optional(v.string()),
      walletProvider: v.optional(v.string()),
      isDefault: v.boolean(),
    }).index("by_user", ["userId"]),

    loyaltyTransactions: defineTable({
      userId: v.id("users"),
      points: v.number(),
      type: v.union(
        v.literal("earned"),
        v.literal("redeemed"),
        v.literal("expired"),
        v.literal("bonus")
      ),
      orderId: v.optional(v.id("orders")),
      description: v.string(),
    }).index("by_user", ["userId"]),

    referrals: defineTable({
      referrerId: v.id("users"),
      referredUserId: v.optional(v.id("users")),
      referralCode: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("expired")
      ),
      bonusPoints: v.optional(v.number()),
    }).index("by_referrer", ["referrerId"])
      .index("by_code", ["referralCode"]),

    chatMessages: defineTable({
      userId: v.id("users"),
      orderId: v.optional(v.id("orders")),
      storeId: v.optional(v.id("stores")),
      message: v.string(),
      sender: v.union(
        v.literal("user"),
        v.literal("support"),
        v.literal("store")
      ),
      isRead: v.boolean(),
    }).index("by_user", ["userId"])
      .index("by_order", ["orderId"]),

    chatSessions: defineTable({
      userId: v.id("users"),
      orderId: v.optional(v.id("orders")),
      storeId: v.optional(v.id("stores")),
      status: v.union(
        v.literal("active"),
        v.literal("resolved"),
        v.literal("closed")
      ),
      lastMessageAt: v.number(),
    }).index("by_user", ["userId"]),

    pushSubscriptions: defineTable({
      userId: v.id("users"),
      endpoint: v.string(),
      p256dh: v.string(),
      auth: v.string(),
      userAgent: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    stockAlerts: defineTable({
      userId: v.id("users"),
      productId: v.id("products"),
      isNotified: v.boolean(),
    }).index("by_user", ["userId"])
      .index("by_product", ["productId"])
      .index("by_user_and_product", ["userId", "productId"]),

    walletTransactions: defineTable({
      userId: v.id("users"),
      amount: v.number(),
      type: v.union(
        v.literal("credit"),
        v.literal("debit")
      ),
      description: v.string(),
      orderId: v.optional(v.id("orders")),
      transactionId: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    groupOrders: defineTable({
      creatorId: v.id("users"),
      creatorName: v.string(),
      productIds: v.array(v.id("products")),
      storeId: v.id("stores"),
      participants: v.array(
        v.object({
          userId: v.id("users"),
          userName: v.string(),
        })
      ),
      maxParticipants: v.number(),
      status: v.union(
        v.literal("open"),
        v.literal("closed"),
        v.literal("completed")
      ),
      expiresAt: v.number(),
      description: v.optional(v.string()),
    }).index("by_store", ["storeId"]).index("by_creator", ["creatorId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;