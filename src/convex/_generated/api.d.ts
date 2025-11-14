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
import type * as admin_appSettings from "../admin/appSettings.js";
import type * as admin_banners from "../admin/banners.js";
import type * as admin_categories from "../admin/categories.js";
import type * as admin_quickActions from "../admin/quickActions.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as cart from "../cart.js";
import type * as http from "../http.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as seed from "../seed.js";
import type * as stores from "../stores.js";
import type * as users from "../users.js";

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
  "admin/appSettings": typeof admin_appSettings;
  "admin/banners": typeof admin_banners;
  "admin/categories": typeof admin_categories;
  "admin/quickActions": typeof admin_quickActions;
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  cart: typeof cart;
  http: typeof http;
  orders: typeof orders;
  products: typeof products;
  seed: typeof seed;
  stores: typeof stores;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
