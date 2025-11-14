/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as addresses from "../addresses.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as cart from "../cart.js";
import type * as chat from "../chat.js";
import type * as deliveryTracking from "../deliveryTracking.js";
import type * as favorites from "../favorites.js";
import type * as http from "../http.js";
import type * as loyalty from "../loyalty.js";
import type * as notifications from "../notifications.js";
import type * as offers from "../offers.js";
import type * as orders from "../orders.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";
import type * as pushNotifications from "../pushNotifications.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as seedOffers from "../seedOffers.js";
import type * as stores from "../stores.js";
import type * as users from "../users.js";
import type * as wallet from "../wallet.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  addresses: typeof addresses;
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  cart: typeof cart;
  chat: typeof chat;
  deliveryTracking: typeof deliveryTracking;
  favorites: typeof favorites;
  http: typeof http;
  loyalty: typeof loyalty;
  notifications: typeof notifications;
  offers: typeof offers;
  orders: typeof orders;
  payments: typeof payments;
  products: typeof products;
  pushNotifications: typeof pushNotifications;
  reviews: typeof reviews;
  seed: typeof seed;
  seedOffers: typeof seedOffers;
  stores: typeof stores;
  users: typeof users;
  wallet: typeof wallet;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
