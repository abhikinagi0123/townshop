"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import Razorpay from "razorpay";
import crypto from "crypto";

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const createPaymentOrder = action({
  args: {
    amount: v.number(),
    orderId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const razorpay = getRazorpayInstance();
    
    const options = {
      amount: Math.round(Number(args.amount) * 100), // Convert to paise
      currency: "INR",
      receipt: `order_${args.orderId}`,
      payment_capture: 1,
      notes: {
        orderId: args.orderId,
        userId: args.userId,
      },
    };
    
    const order = await razorpay.orders.create(options);
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    };
  },
});

export const verifyPaymentSignature = action({
  args: {
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.string(),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay secret not configured");
    }
    
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${args.razorpayOrderId}|${args.razorpayPaymentId}`);
    const generatedSignature = hmac.digest("hex");
    
    const isValid = generatedSignature === args.razorpaySignature;
    
    if (isValid) {
      // Update order payment status
      await ctx.scheduler.runAfter(
        0,
        internal.payments.updatePaymentStatus,
        {
          orderId: args.orderId,
          paymentId: args.razorpayPaymentId,
          status: "completed",
        }
      );
    }
    
    return { verified: isValid, paymentId: args.razorpayPaymentId };
  },
});

export const createWalletRechargeOrder = action({
  args: {
    amount: v.number(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const razorpay = getRazorpayInstance();
    
    const options = {
      amount: Math.round(Number(args.amount) * 100),
      currency: "INR",
      receipt: `wallet_${args.userId}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        type: "wallet_recharge",
        userId: args.userId,
      },
    };
    
    const order = await razorpay.orders.create(options);
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  },
});

export const verifyWalletRecharge = action({
  args: {
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay secret not configured");
    }
    
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${args.razorpayOrderId}|${args.razorpayPaymentId}`);
    const generatedSignature = hmac.digest("hex");
    
    const isValid = generatedSignature === args.razorpaySignature;
    
    if (isValid) {
      await ctx.scheduler.runAfter(
        0,
        internal.wallet.addMoneyInternal,
        {
          amount: args.amount,
          transactionId: args.razorpayPaymentId,
        }
      );
    }
    
    return { verified: isValid };
  },
});

export const getPaymentDetails = action({
  args: { paymentId: v.string() },
  handler: async (ctx, args) => {
    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.fetch(args.paymentId);
    
    return {
      id: payment.id,
      status: payment.status,
      amount: Number(payment.amount) / 100,
      method: payment.method,
      createdAt: payment.created_at,
    };
  },
});
