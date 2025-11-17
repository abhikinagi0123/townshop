import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 10000,
};

const POINTS_PER_RUPEE = 1;
const REFERRAL_BONUS = 500;

export const getPoints = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { points: 0, tier: "bronze" as const };

    return {
      points: user.loyaltyPoints || 0,
      tier: user.loyaltyTier || "bronze",
    };
  },
});

export const earnPoints = mutation({
  args: {
    orderId: v.id("orders"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const points = Math.floor(args.amount * POINTS_PER_RUPEE);
    const newTotal = (user.loyaltyPoints || 0) + points;

    let newTier = user.loyaltyTier || "bronze";
    if (newTotal >= TIER_THRESHOLDS.platinum) newTier = "platinum";
    else if (newTotal >= TIER_THRESHOLDS.gold) newTier = "gold";
    else if (newTotal >= TIER_THRESHOLDS.silver) newTier = "silver";

    await ctx.db.patch(user._id, {
      loyaltyPoints: newTotal,
      loyaltyTier: newTier,
    });

    await ctx.db.insert("loyaltyTransactions", {
      userId: user._id,
      points,
      type: "earned",
      orderId: args.orderId,
      description: `Earned ${points} points from order`,
    });

    await ctx.db.patch(args.orderId, {
      loyaltyPointsEarned: points,
    });

    return { points, newTotal, newTier };
  },
});

export const redeemPoints = mutation({
  args: {
    points: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const currentPoints = user.loyaltyPoints || 0;
    if (currentPoints < args.points) {
      throw new Error("Insufficient points");
    }

    if (args.points < 100) {
      throw new Error("Minimum 100 points required for redemption");
    }

    const newTotal = currentPoints - args.points;
    await ctx.db.patch(user._id, {
      loyaltyPoints: newTotal,
    });

    const discountAmount = Math.floor(args.points / 100);

    return { newTotal, discountAmount };
  },
});

export const recordRedemption = mutation({
  args: {
    points: v.number(),
    orderId: v.id("orders"),
    discountAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    await ctx.db.insert("loyaltyTransactions", {
      userId: user._id,
      points: -args.points,
      type: "redeemed",
      orderId: args.orderId,
      description: `Redeemed ${args.points} points for ₹${args.discountAmount} discount`,
    });
  },
});

export const getTransactions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const limit = args.limit || 50;
    return await ctx.db
      .query("loyaltyTransactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
  },
});

export const createReferralCode = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const code = `REF${user._id.slice(-6).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const existingCode = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", user._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingCode) {
      return existingCode.referralCode;
    }

    await ctx.db.insert("referrals", {
      referrerId: user._id,
      referralCode: code,
      status: "pending",
    });

    return code;
  },
});

export const applyReferralCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const referral = await ctx.db
      .query("referrals")
      .withIndex("by_code", (q) => q.eq("referralCode", args.code))
      .first();

    if (!referral || referral.status !== "pending") {
      throw new Error("Invalid or expired referral code");
    }

    if (referral.referrerId === user._id) {
      throw new Error("Cannot use your own referral code");
    }

    await ctx.db.patch(referral._id, {
      referredUserId: user._id,
      status: "completed",
      bonusPoints: REFERRAL_BONUS,
    });

    const referrer = await ctx.db.get(referral.referrerId);
    if (referrer) {
      await ctx.db.patch(referral.referrerId, {
        loyaltyPoints: (referrer.loyaltyPoints || 0) + REFERRAL_BONUS,
      });

      await ctx.db.insert("loyaltyTransactions", {
        userId: referral.referrerId,
        points: REFERRAL_BONUS,
        type: "bonus",
        description: `Referral bonus for inviting a friend`,
      });
    }

    await ctx.db.patch(user._id, {
      loyaltyPoints: (user.loyaltyPoints || 0) + REFERRAL_BONUS,
    });

    await ctx.db.insert("loyaltyTransactions", {
      userId: user._id,
      points: REFERRAL_BONUS,
      type: "bonus",
      description: `Welcome bonus for using referral code`,
    });

    return { success: true, bonusPoints: REFERRAL_BONUS };
  },
});

export const getReferralStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { totalReferrals: 0, totalBonus: 0 };

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", user._id))
      .collect();

    const completed = referrals.filter((r) => r.status === "completed");
    const totalBonus = completed.reduce((sum, r) => sum + (r.bonusPoints || 0), 0);

    return {
      totalReferrals: completed.length,
      totalBonus,
      pendingReferrals: referrals.filter((r) => r.status === "pending").length,
    };
  },
});

export const getReferralsList = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", user._id))
      .order("desc")
      .collect();

    const referralsWithNames = await Promise.all(
      referrals.map(async (referral) => {
        let referredUserName = null;
        if (referral.referredUserId) {
          const referredUser = await ctx.db.get(referral.referredUserId);
          referredUserName = referredUser?.name || null;
        }
        return {
          ...referral,
          referredUserName,
        };
      })
    );

    return referralsWithNames;
  },
});