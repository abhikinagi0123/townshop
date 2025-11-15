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
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const groupOrderId = await ctx.db.insert("groupOrders", {
      creatorId: user._id,
      creatorName: user.name || "Anonymous",
      productIds: args.productIds,
      storeId: args.storeId,
      participants: [{ userId: user._id, userName: user.name || "Anonymous" }],
      maxParticipants: args.maxParticipants,
      status: "open",
      expiresAt: args.expiresAt,
      description: args.description,
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
        { userId: user._id, userName: user.name || "Anonymous" },
      ],
    });
  },
});

export const list = query({
  args: { storeId: v.optional(v.id("stores")) },
  handler: async (ctx, args) => {
    const now = Date.now();
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

    return groupOrders;
  },
});

export const getById = query({
  args: { groupOrderId: v.id("groupOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.groupOrderId);
  },
});
