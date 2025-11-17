import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const askQuestion = mutation({
  args: {
    productId: v.id("products"),
    question: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    return await ctx.db.insert("productQuestions", {
      productId: args.productId,
      userId: user._id,
      userName: user.name || "Anonymous",
      question: args.question,
      isAnswered: false,
    });
  },
});

export const answerQuestion = mutation({
  args: {
    questionId: v.id("productQuestions"),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    await ctx.db.patch(args.questionId, {
      answer: args.answer,
      answeredBy: user._id,
      answeredAt: Date.now(),
      isAnswered: true,
    });
  },
});

export const listByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productQuestions")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();
  },
});
