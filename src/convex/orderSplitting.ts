import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createSplit = mutation({
  args: {
    orderId: v.id("orders"),
    participants: v.array(v.object({
      userId: v.id("users"),
      userName: v.string(),
      amount: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const participantsWithStatus = args.participants.map(p => ({
      ...p,
      isPaid: false,
    }));
    
    return await ctx.db.insert("orderSplits", {
      orderId: args.orderId,
      participants: participantsWithStatus,
      createdBy: user._id,
      status: "pending",
    });
  },
});

export const markPaid = mutation({
  args: {
    splitId: v.id("orderSplits"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const split = await ctx.db.get(args.splitId);
    if (!split) throw new Error("Split not found");
    
    const updatedParticipants = split.participants.map(p =>
      p.userId === args.userId ? { ...p, isPaid: true } : p
    );
    
    const allPaid = updatedParticipants.every(p => p.isPaid);
    
    await ctx.db.patch(args.splitId, {
      participants: updatedParticipants,
      status: allPaid ? "completed" : "partial",
    });
  },
});

export const getByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orderSplits")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();
  },
});
