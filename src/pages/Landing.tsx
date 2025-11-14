import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Home, Zap, MapPin, Star, Search, ChevronRight, Clock, TrendingUp, Sparkles, Flame, Award, Package, RefreshCw, User } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StoreCard } from "@/components/StoreCard";
import { OfferCard } from "@/components/OfferCard";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  { id: "all", label: "All", emoji: "🏪" },
  { id: "Grocery", label: "Grocery", emoji: "🛒" },
  { id: "Food", label: "Food", emoji: "🍕" },
  { id: "Pharmacy", label: "Pharmacy", emoji: "💊" },
  { id: "Electronics", label: "Electronics", emoji: "📱" },
];

const featuredCategories = [
  { name: "Vegetables & Fruits", emoji: "🥬", color: "from-primary/80 to-primary" },
  { name: "Dairy & Breakfast", emoji: "🥛", color: "from-primary/70 to-primary/90" },
  { name: "Munchies", emoji: "🍿", color: "from-primary/60 to-primary/80" },
  { name: "Cold Drinks", emoji: "🥤", color: "from-primary to-primary/70" },
  { name: "Instant Food", emoji: "🍜", color: "from-primary/90 to-primary" },
  { name: "Tea & Coffee", emoji: "☕", color: "from-primary/75 to-primary/95" },
  { name: "Bakery & Biscuits", emoji: "🍪", color: "from-primary/85 to-primary" },
  { name: "Sauces & Spreads", emoji: "🍯", color: "from-primary/65 to-primary/85" },
];

const quickActions = [
  { title: "10-Min Delivery", icon: "⚡", desc: "Lightning fast" },
  { title: "Fresh Produce", icon: "🌿", desc: "Farm to home" },
  { title: "Best Prices", icon: "💰", desc: "Save more" },
  { title: "24/7 Available", icon: "🌙", desc: "Always open" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location
  useEffect(() => {
    if (user?.lat && user?.lng) {
      setUserLocation({ lat: user.lat, lng: user.lng });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, [user]);

  const nearbyShops = useQuery(
    api.stores.getNearbyShops,
    userLocation ? { lat: userLocation.lat, lng: userLocation.lng, category, search, radius: 10 } : "skip"
  );

  // Fetch dynamic content
  const trendingProducts = useQuery(api.products.getTrendingProducts, { limit: 6 });
  const topRatedProducts = useQuery(api.products.getTopRatedProducts, { limit: 4 });
  const featuredProducts = useQuery(api.products.getFeaturedProducts, { limit: 8 });
  const activeOffers = useQuery(api.offers.getActiveOffers);
  
  // New personalized sections
  const recentOrders = useQuery(
    api.orders.getRecentOrders,
    isAuthenticated ? { limit: 3 } : "skip"
  );
  const recommendedProducts = useQuery(
    api.products.getRecommendedProducts,
    { limit: 8 }
  );
  const recentlyViewedProducts = useQuery(
    api.products.getRecentlyViewedProducts,
    isAuthenticated ? { limit: 6 } : "skip"
  );
  const recommendedStores = useQuery(
    api.stores.getRecommendedStores,
    userLocation ? { lat: userLocation.lat, lng: userLocation.lng, limit: 6 } : "skip"
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* App Header - Compact */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="px-4 py-3">
          {/* Location Display */}
          {userLocation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mb-3"
            >
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Delivering to</p>
                <p className="text-sm font-semibold truncate">Your Location</p>
              </div>
              {!isLoading && (
                <Button 
                  onClick={() => isAuthenticated ? navigate("/stores") : navigate("/auth")} 
                  size="sm"
                  className="flex-shrink-0"
                >
                  {isAuthenticated ? "Browse" : "Login"}
                </Button>
              )}
            </motion.div>
          )}

          {/* Search Bar - Compact */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stores or products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search.trim()) {
                  navigate(`/search?q=${encodeURIComponent(search.trim())}`);
                }
              }}
              onClick={() => navigate('/search')}
              className="pl-10 h-10 text-sm cursor-pointer"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background"
      >
        <div className="px-4 py-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="mb-3 bg-primary/20 text-primary border-primary/30">
                🚀 Fast Delivery
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
                Get Everything
                <br />
                <span className="text-primary">Delivered in Minutes</span>
              </h1>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Order from local stores and get your favorites delivered to your doorstep in 10-30 minutes. Fresh, fast, and reliable.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <Button 
                size="lg" 
                onClick={() => isAuthenticated ? navigate("/stores") : navigate("/auth")}
                className="gap-2"
              >
                <Star className="h-4 w-4" />
                Start Shopping
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => {
                  const storesSection = document.getElementById("nearby-stores");
                  storesSection?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explore Stores
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex gap-6 mt-6 pt-6 border-t"
            >
              <div>
                <p className="text-2xl font-bold text-primary">10-30</p>
                <p className="text-xs text-muted-foreground">Min Delivery</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{nearbyShops?.length || 0}+</p>
                <p className="text-xs text-muted-foreground">Local Stores</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="text-xs text-muted-foreground">Fresh Products</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
      </motion.div>

      {/* Main Content */}
      <div className="px-4">
        {/* Category Pills - Horizontal Scroll */}
        <div className="py-3 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={category === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat.id)}
                className="gap-1.5 rounded-full px-3 h-8 whitespace-nowrap flex-shrink-0"
              >
                <span className="text-sm">{cat.emoji}</span>
                <span className="text-xs">{cat.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Actions - Compact Grid */}
        <div className="py-3">
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.05 * index }}
                className="text-center"
              >
                <div className="bg-card border rounded-xl p-3 hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-1">{action.icon}</div>
                  <p className="text-[10px] font-semibold leading-tight">{action.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trending Products - Dynamic */}
        {trendingProducts && trendingProducts.length > 0 && (
          <div className="py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <h2 className="text-base font-bold">Trending Now</h2>
              </div>
              <Badge variant="secondary" className="text-[10px]">Hot 🔥</Badge>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {trendingProducts.filter((item): item is NonNullable<typeof item> & { image: string; name: string; price: number } => 
                item !== null && 'image' in item && 'name' in item && 'price' in item
              ).map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.03 * index }}
                  className="flex-shrink-0 w-28"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-full h-24 object-cover" />
                      <Badge className="absolute top-1 right-1 text-[9px] px-1.5 py-0 h-4 bg-orange-500">
                        Trending
                      </Badge>
                    </div>
                    <CardContent className="p-2">
                      <p className="text-[11px] font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground line-clamp-1">{item.storeName}</p>
                      <p className="text-[10px] text-primary font-bold">₹{item.price}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Top Rated Products */}
        {topRatedProducts && topRatedProducts.length > 0 && (
          <div className="py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <h2 className="text-base font-bold">Top Rated</h2>
              </div>
              <Badge variant="secondary" className="text-[10px]">Best Quality</Badge>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {topRatedProducts.filter((item): item is NonNullable<typeof item> & { image: string; name: string; price: number; storeRating: number } => 
                item !== null && 'image' in item && 'name' in item && 'price' in item
              ).map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.03 * index }}
                  className="flex-shrink-0 w-28"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-full h-24 object-cover" />
                      <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-background/95 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                        <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[9px] font-bold">{item.storeRating}</span>
                      </div>
                    </div>
                    <CardContent className="p-2">
                      <p className="text-[11px] font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground line-clamp-1">{item.storeName}</p>
                      <p className="text-[10px] text-primary font-bold">₹{item.price}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products */}
        {featuredProducts && featuredProducts.length > 0 && (
          <div className="py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold">Featured Picks</h2>
              </div>
              <Badge variant="secondary" className="text-[10px]">Handpicked</Badge>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {featuredProducts.filter((item): item is NonNullable<typeof item> & { image: string; name: string; price: number } => 
                item !== null && 'image' in item && 'name' in item && 'price' in item
              ).map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.03 * index }}
                  className="flex-shrink-0 w-28"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-full h-24 object-cover" />
                    </div>
                    <CardContent className="p-2">
                      <p className="text-[11px] font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground line-clamp-1">{item.storeName}</p>
                      <p className="text-[10px] text-primary font-bold">₹{item.price}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Products - Personalized */}
        {recommendedProducts && recommendedProducts.length > 0 && (
          <div className="py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <h2 className="text-base font-bold">Recommended for You</h2>
              </div>
              <Badge variant="secondary" className="text-[10px]">Personalized</Badge>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {recommendedProducts.filter((item): item is NonNullable<typeof item> & { image: string; name: string; price: number; storeName: string } => 
                item !== null && 'image' in item && 'name' in item && 'price' in item && 'storeName' in item
              ).map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.03 * index }}
                  className="flex-shrink-0 w-28"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-full h-24 object-cover" />
                    </div>
                    <CardContent className="p-2">
                      <p className="text-[11px] font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground line-clamp-1">{item.storeName}</p>
                      <p className="text-[10px] text-primary font-bold">₹{item.price}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Products */}
        {isAuthenticated && recentlyViewedProducts && recentlyViewedProducts.length > 0 && (
          <div className="py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-500" />
                <h2 className="text-base font-bold">Buy Again</h2>
              </div>
              <Badge variant="secondary" className="text-[10px]">From Your Orders</Badge>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {recentlyViewedProducts.filter((item): item is NonNullable<typeof item> & { image: string; name: string; price: number } => 
                item !== null && 'image' in item && 'name' in item && 'price' in item
              ).map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.03 * index }}
                  className="flex-shrink-0 w-28"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-full h-24 object-cover" />
                    </div>
                    <CardContent className="p-2">
                      <p className="text-[11px] font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground line-clamp-1">{item.storeName}</p>
                      <p className="text-[10px] text-primary font-bold">₹{item.price}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Categories - Horizontal Scroll */}
        <div className="py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">Shop by Category</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {featuredCategories.map((cat, index) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.03 * index }}
                className="flex-shrink-0 w-24"
              >
                <div className={`bg-gradient-to-br ${cat.color} rounded-2xl p-4 text-white text-center h-24 flex flex-col items-center justify-center shadow-md`}>
                  <div className="text-3xl mb-1">{cat.emoji}</div>
                  <p className="text-[10px] font-semibold leading-tight">{cat.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recommended Stores - Personalized */}
        {recommendedStores && recommendedStores.length > 0 && (
          <div className="py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <h2 className="text-base font-bold">Recommended Stores</h2>
              </div>
              <Badge variant="secondary" className="text-[10px]">For You</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {recommendedStores.slice(0, 4).map((shop, index) => (
                <motion.div
                  key={shop._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.03 * index }}
                >
                  <StoreCard store={shop} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Active Offers Section */}
        {activeOffers && activeOffers.length > 0 && (
          <div className="py-3">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <h2 className="text-base font-bold">Active Offers</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {activeOffers.slice(0, 5).map((offer, index) => (
                <OfferCard key={offer._id} offer={offer} compact />
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {isAuthenticated && recentOrders && recentOrders.length > 0 && (
          <div className="py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-500" />
                <h2 className="text-base font-bold">Recent Orders</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/orders")}
                className="gap-1 h-8 text-xs"
              >
                View All
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.03 * index }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/order/${order._id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm">{order.storeName}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.items.length} {order.items.length === 1 ? "item" : "items"}
                          </p>
                        </div>
                        <Badge className={
                          order.status === "delivered" ? "bg-green-500" :
                          order.status === "out_for_delivery" ? "bg-blue-500" :
                          "bg-yellow-500"
                        }>
                          {order.status.split("_").map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(" ")}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          {new Date(order._creationTime).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-bold">₹{order.totalAmount}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Shops Section */}
        {nearbyShops && nearbyShops.length > 0 && (
          <div className="py-3" id="nearby-stores">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold">Stores Near You</h2>
                <p className="text-xs text-muted-foreground">
                  {nearbyShops.length} {nearbyShops.length === 1 ? "store" : "stores"}
                </p>
              </div>
              {nearbyShops.length > 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/stores")}
                  className="gap-1 h-8 text-xs"
                >
                  View All
                  <ChevronRight className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {nearbyShops.slice(0, 6).map((shop, index) => (
                <motion.div
                  key={shop._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.03 * index }}
                >
                  <StoreCard store={shop} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section - Compact */}
        <div className="py-6 mt-4">
          <h2 className="text-base font-bold mb-4 text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-2 mx-auto shadow-md">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-semibold mb-1">Lightning Fast</p>
              <p className="text-[10px] text-muted-foreground leading-tight">10-30 min delivery</p>
            </div>

            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-2 mx-auto shadow-md">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-semibold mb-1">Local Stores</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Support local</p>
            </div>

            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-2 mx-auto shadow-md">
                <Star className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-semibold mb-1">Quality</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Fresh products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-full rounded-none flex-1"
            onClick={() => navigate("/")}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-full rounded-none flex-1"
            onClick={() => navigate("/search")}
          >
            <Search className="h-5 w-5" />
            <span className="text-xs">Search</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-full rounded-none flex-1"
            onClick={() => navigate("/stores")}
          >
            <Star className="h-5 w-5" />
            <span className="text-xs">Rewards</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-full rounded-none flex-1"
            onClick={() => isAuthenticated ? navigate("/profile") : navigate("/auth")}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}