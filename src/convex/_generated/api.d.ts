/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as addresses from "../addresses.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as cart from "../cart.js";
import type * as chat from "../chat.js";
import type * as cleanup from "../cleanup.js";
import type * as deliveryPartners from "../deliveryPartners.js";
import type * as deliveryTracking from "../deliveryTracking.js";
import type * as favorites from "../favorites.js";
import type * as flashSales from "../flashSales.js";
import type * as giftCards from "../giftCards.js";
import type * as groupOrders from "../groupOrders.js";
import type * as http from "../http.js";
import type * as inventory from "../inventory.js";
import type * as loyalty from "../loyalty.js";
import type * as notifications from "../notifications.js";
import type * as offers from "../offers.js";
import type * as orderSplitting from "../orderSplitting.js";
import type * as orders from "../orders.js";
import type * as payments from "../payments.js";
import type * as platform from "../platform.js";
import type * as priceDropAlerts from "../priceDropAlerts.js";
import type * as priceTracking from "../priceTracking.js";
import type * as pricing from "../pricing.js";
import type * as productComparison from "../productComparison.js";
import type * as productQA from "../productQA.js";
import type * as products from "../products.js";
import type * as pushNotifications from "../pushNotifications.js";
import type * as razorpay from "../razorpay.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as seedOffers from "../seedOffers.js";
import type * as services from "../services.js";
import type * as shops from "../shops.js";
import type * as stockAlerts from "../stockAlerts.js";
import type * as storeSubscriptions from "../storeSubscriptions.js";
import type * as stores from "../stores.js";
import type * as subscriptionBoxes from "../subscriptionBoxes.js";
import type * as users from "../users.js";
import type * as wallet from "../wallet.js";
import type * as wishlistSharing from "../wishlistSharing.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  addresses: typeof addresses;
  analytics: typeof analytics;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  cart: typeof cart;
  chat: typeof chat;
  cleanup: typeof cleanup;
  deliveryPartners: typeof deliveryPartners;
  deliveryTracking: typeof deliveryTracking;
  favorites: typeof favorites;
  flashSales: typeof flashSales;
  giftCards: typeof giftCards;
  groupOrders: typeof groupOrders;
  http: typeof http;
  inventory: typeof inventory;
  loyalty: typeof loyalty;
  notifications: typeof notifications;
  offers: typeof offers;
  orderSplitting: typeof orderSplitting;
  orders: typeof orders;
  payments: typeof payments;
  platform: typeof platform;
  priceDropAlerts: typeof priceDropAlerts;
  priceTracking: typeof priceTracking;
  pricing: typeof pricing;
  productComparison: typeof productComparison;
  productQA: typeof productQA;
  products: typeof products;
  pushNotifications: typeof pushNotifications;
  razorpay: typeof razorpay;
  reviews: typeof reviews;
  seed: typeof seed;
  seedOffers: typeof seedOffers;
  services: typeof services;
  shops: typeof shops;
  stockAlerts: typeof stockAlerts;
  storeSubscriptions: typeof storeSubscriptions;
  stores: typeof stores;
  subscriptionBoxes: typeof subscriptionBoxes;
  users: typeof users;
  wallet: typeof wallet;
  wishlistSharing: typeof wishlistSharing;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
