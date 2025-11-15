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
  PAGINATION_PAGE_SIZE: 20,
} as const;

// Cache durations (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
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

// Comprehensive shop categories for all local businesses
export const SHOP_CATEGORIES = [
  { id: "all", label: "All Shops", emoji: "🏪" },
  { id: "Grocery", label: "Grocery", emoji: "🛒" },
  { id: "Food", label: "Food & Dining", emoji: "🍕" },
  { id: "Pharmacy", label: "Pharmacy", emoji: "💊" },
  { id: "Electronics", label: "Electronics", emoji: "📱" },
  { id: "Fashion", label: "Fashion & Apparel", emoji: "👗" },
  { id: "Beauty", label: "Beauty & Salon", emoji: "💇" },
  { id: "HomeServices", label: "Home Services", emoji: "🔧" },
  { id: "Repair", label: "Repair & Maintenance", emoji: "🛠️" },
  { id: "Education", label: "Education & Tutoring", emoji: "📚" },
  { id: "Fitness", label: "Fitness & Wellness", emoji: "💪" },
  { id: "PetCare", label: "Pet Care", emoji: "🐾" },
  { id: "Automotive", label: "Automotive", emoji: "🚗" },
  { id: "HomeDecor", label: "Home & Decor", emoji: "🏠" },
  { id: "Stationery", label: "Stationery & Books", emoji: "📝" },
  { id: "Bakery", label: "Bakery & Sweets", emoji: "🍰" },
  { id: "Laundry", label: "Laundry & Dry Clean", emoji: "👔" },
  { id: "Photography", label: "Photography", emoji: "📸" },
  { id: "EventServices", label: "Event Services", emoji: "🎉" },
  { id: "Other", label: "Other Services", emoji: "✨" },
] as const;

// Featured categories for homepage
export const FEATURED_CATEGORIES = [
  { name: "Grocery & Daily Needs", emoji: "🛒", color: "from-green-500 to-green-400" },
  { name: "Food & Restaurants", emoji: "🍕", color: "from-orange-500 to-orange-400" },
  { name: "Beauty & Salon", emoji: "💇", color: "from-pink-500 to-pink-400" },
  { name: "Home Services", emoji: "🔧", color: "from-blue-500 to-blue-400" },
  { name: "Fashion & Apparel", emoji: "👗", color: "from-purple-500 to-purple-400" },
  { name: "Electronics & Gadgets", emoji: "📱", color: "from-indigo-500 to-indigo-400" },
  { name: "Health & Pharmacy", emoji: "💊", color: "from-red-500 to-red-400" },
  { name: "Education & Learning", emoji: "📚", color: "from-yellow-500 to-yellow-400" },
  { name: "Fitness & Wellness", emoji: "💪", color: "from-teal-500 to-teal-400" },
  { name: "Pet Care & Supplies", emoji: "🐾", color: "from-amber-500 to-amber-400" },
  { name: "Automotive Services", emoji: "🚗", color: "from-gray-500 to-gray-400" },
  { name: "Repair & Maintenance", emoji: "🛠️", color: "from-slate-500 to-slate-400" },
] as const;