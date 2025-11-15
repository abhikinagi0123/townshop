import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get dynamic price for a product
export const getDynamicPrice = query({
  args: {
    productId: v.id("products"),
    quantity: v.optional(v.number()),
    deliveryTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;

    let finalPrice = product.price;
    const discounts = [];
    const surcharges = [];

    // Bulk discount
    if (args.quantity && args.quantity >= 5) {
      const bulkDiscount = Math.min(20, Math.floor(args.quantity / 5) * 5);
      discounts.push({
        type: "bulk",
        percentage: bulkDiscount,
        amount: (finalPrice * bulkDiscount) / 100,
      });
    }

    // Time-based pricing (peak hours: 6-9 PM)
    const deliveryDate = args.deliveryTime ? new Date(args.deliveryTime) : new Date();
    const hour = deliveryDate.getHours();
    if (hour >= 18 && hour <= 21) {
      const surgeFee = 15;
      surcharges.push({
        type: "peak_hours",
        percentage: surgeFee,
        amount: (finalPrice * surgeFee) / 100,
      });
    }

    // Early morning discount (5-8 AM)
    if (hour >= 5 && hour <= 8) {
      const earlyDiscount = 10;
      discounts.push({
        type: "early_bird",
        percentage: earlyDiscount,
        amount: (finalPrice * earlyDiscount) / 100,
      });
    }

    // Calculate final price
    const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);
    const totalSurcharge = surcharges.reduce((sum, s) => sum + s.amount, 0);
    finalPrice = finalPrice - totalDiscount + totalSurcharge;

    return {
      basePrice: product.price,
      finalPrice: Math.max(0, Math.round(finalPrice * 100) / 100),
      discounts,
      surcharges,
      savings: totalDiscount - totalSurcharge,
    };
  },
});

// Get available delivery time slots
export const getDeliveryTimeSlots = query({
  args: {
    storeId: v.id("stores"),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);
    if (!store) return [];

    const selectedDate = args.date ? new Date(args.date) : new Date();
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    // Generate time slots (8 AM to 10 PM, 2-hour windows)
    const slots = [];
    const startHour = isToday ? Math.max(8, today.getHours() + 2) : 8;
    
    for (let hour = startHour; hour < 22; hour += 2) {
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(selectedDate);
      slotEnd.setHours(hour + 2, 0, 0, 0);

      // Check capacity (simulate - in production, check actual orders)
      const capacity = 10;
      const booked = Math.floor(Math.random() * 8); // Simulate bookings
      
      const isPeakHour = hour >= 18 && hour <= 20;
      
      slots.push({
        startTime: slotStart.getTime(),
        endTime: slotEnd.getTime(),
        label: `${formatTime(hour)}:00 - ${formatTime(hour + 2)}:00`,
        available: booked < capacity,
        capacity,
        booked,
        isPeakHour,
        surcharge: isPeakHour ? 20 : 0,
      });
    }

    return slots;
  },
});

function formatTime(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

// Record price history for analytics
export const recordPriceChange = internalMutation({
  args: {
    productId: v.id("products"),
    oldPrice: v.number(),
    newPrice: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("priceHistory", {
      productId: args.productId,
      oldPrice: args.oldPrice,
      newPrice: args.newPrice,
      reason: args.reason,
      timestamp: Date.now(),
    });
  },
});
