// Animation delays
export const ANIMATION_DELAYS = {
  ITEM_STAGGER: 0.03,
  MAX_STAGGER: 0.3,
  SHORT: 0.2,
  MEDIUM: 0.4,
  LONG: 0.6,
} as const;

// Delivery settings
export const DELIVERY = {
  MIN_TIME: 10,
  MAX_TIME: 30,
  FEE: 40,
  DEFAULT_RADIUS_KM: 10,
} as const;

// Default location (Delhi)
export const DEFAULT_LOCATION = {
  lat: 28.6139,
  lng: 77.2090,
} as const;

// UI limits
export const UI_LIMITS = {
  TRENDING_PRODUCTS: 6,
  TOP_RATED_PRODUCTS: 4,
  FEATURED_PRODUCTS: 8,
  RECENT_ORDERS: 3,
  RECOMMENDED_PRODUCTS: 8,
  RECENTLY_VIEWED: 6,
  RECOMMENDED_STORES: 6,
  ACTIVE_OFFERS: 5,
  NEARBY_STORES_PREVIEW: 6,
} as const;

// Status colors
export const STATUS_COLORS = {
  delivered: "bg-green-500",
  out_for_delivery: "bg-blue-500",
  preparing: "bg-yellow-500",
  confirmed: "bg-purple-500",
  cancelled: "bg-red-500",
} as const;

// Touch target minimum size (WCAG 2.1 Level AAA)
export const MIN_TOUCH_TARGET = 44; // pixels
