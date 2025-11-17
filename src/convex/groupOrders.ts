import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    productIds: v.array(v.id("products")),
    storeId: v.id("stores"),
    maxParticipants: v.number(),
    expiresAt: v.number(),
    description: v.optional(v.string()),
    discountPercent: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const groupOrderId = await ctx.db.insert("groupOrders", {
      creatorId: user._id,
      creatorName: user.name || "Anonymous",
      productIds: args.productIds,
      storeId: args.storeId,
      participants: [{ 
        userId: user._id, 
        userName: user.name || "Anonymous",
        hasPaid: false,
        joinedAt: Date.now(),
      }],
      maxParticipants: args.maxParticipants,
      status: "open",
      expiresAt: args.expiresAt,
      description: args.description,
      discountPercent: args.discountPercent,
      totalPrice: 0,
    });

    return groupOrderId;
  },
});

export const join = mutation({
  args: { groupOrderId: v.id("groupOrders") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const groupOrder = await ctx.db.get(args.groupOrderId);
    if (!groupOrder) throw new Error("Group order not found");

    if (groupOrder.status !== "open") {
      throw new Error("Group order is no longer accepting participants");
    }

    if (groupOrder.participants.length >= groupOrder.maxParticipants) {
      throw new Error("Group order is full");
    }

    const alreadyJoined = groupOrder.participants.some(
      (p) => p.userId === user._id
    );
    if (alreadyJoined) {
      throw new Error("Already joined this group order");
    }

    await ctx.db.patch(args.groupOrderId, {
      participants: [
        ...groupOrder.participants,
        { 
          userId: user._id, 
          userName: user.name || "Anonymous",
          hasPaid: false,
          joinedAt: Date.now(),
        },
      ],
    });
  },
});

export const list = query({
  args: { storeId: v.optional(v.id("stores")) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const user = await getCurrentUser(ctx);
    
    let groupOrders = await ctx.db
      .query("groupOrders")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "open"),
          q.gt(q.field("expiresAt"), now)
        )
      )
      .collect();

    if (args.storeId) {
      groupOrders = groupOrders.filter((go) => go.storeId === args.storeId);
    }

    return await Promise.all(
      groupOrders.map(async (go) => {
        const products = await Promise.all(
          go.productIds.map(id => ctx.db.get(id))
        );
        const store = await ctx.db.get(go.storeId);
        
        const totalPrice = products.reduce((sum, p) => sum + (p?.price || 0), 0);
        const discountedPrice = totalPrice * (1 - go.discountPercent / 100);
        
        return {
          ...go,
          products: products.filter(p => p !== null),
          storeName: store?.name || "Unknown Store",
          totalPrice,
          discountedPrice,
          hasJoined: user ? go.participants.some(p => p.userId === user._id) : false,
          currentParticipants: go.participants.length,
        };
      })
    );
  },
});

export const getById = query({
  args: { groupOrderId: v.id("groupOrders") },
  handler: async (ctx, args) => {
    const groupOrder = await ctx.db.get(args.groupOrderId);
    if (!groupOrder) return null;
    
    const products = await Promise.all(
      groupOrder.productIds.map(id => ctx.db.get(id))
    );
    const store = await ctx.db.get(groupOrder.storeId);
    
    const totalPrice = products.reduce((sum, p) => sum + (p?.price || 0), 0);
    const discountedPrice = totalPrice * (1 - groupOrder.discountPercent / 100);
    
    return {
      ...groupOrder,
      products: products.filter(p => p !== null),
      storeName: store?.name || "Unknown Store",
      totalPrice,
      discountedPrice,
      currentParticipants: groupOrder.participants.length,
    };
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const allGroupOrders = await ctx.db.query("groupOrders").collect();
    const userGroupOrders = allGroupOrders.filter(go => 
      go.participants.some(p => p.userId === user._id)
    );
    
    return await Promise.all(
      userGroupOrders.map(async (go) => {
        const products = await Promise.all(
          go.productIds.map(id => ctx.db.get(id))
        );
        const store = await ctx.db.get(go.storeId);
        
        const totalPrice = products.reduce((sum, p) => sum + (p?.price || 0), 0);
        const discountedPrice = totalPrice * (1 - go.discountPercent / 100);
        
        return {
          ...go,
          products: products.filter(p => p !== null),
          storeName: store?.name || "Unknown Store",
          totalPrice,
          discountedPrice,
          currentParticipants: go.participants.length,
        };
      })
    );
  },
});

export const markPaid = mutation({
  args: { groupOrderId: v.id("groupOrders") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const groupOrder = await ctx.db.get(args.groupOrderId);
    if (!groupOrder) throw new Error("Group order not found");
    
    const updatedParticipants = groupOrder.participants.map(p => 
      p.userId === user._id ? { ...p, hasPaid: true } : p
    );
    
    await ctx.db.patch(args.groupOrderId, {
      participants: updatedParticipants,
    });
  },
});

export const leave = mutation({
  args: { groupOrderId: v.id("groupOrders") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const groupOrder = await ctx.db.get(args.groupOrderId);
    if (!groupOrder) throw new Error("Group order not found");
    
    if (groupOrder.creatorId === user._id) {
      throw new Error("Creator cannot leave the group order");
    }
    
    const updatedParticipants = groupOrder.participants.filter(
      p => p.userId !== user._id
    );
    
    await ctx.db.patch(args.groupOrderId, {
      participants: updatedParticipants,
    });
  },
});