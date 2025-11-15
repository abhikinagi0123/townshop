import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Flame, Award, Sparkles, RefreshCw, Star, TrendingUp, Package, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PushNotificationPrompt } from "@/components/PushNotificationPrompt";
import { HeroSection } from "@/components/HeroSection";
import { CategoryPills } from "@/components/CategoryPills";
import { QuickActions } from "@/components/QuickActions";
import { ProductSection } from "@/components/ProductSection";
import { ProductSectionSkeleton } from "@/components/LoadingStates";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { StoreCard } from "@/components/StoreCard";
import { OfferCard } from "@/components/OfferCard";

const categories = [
  { id: "all", label: "All", emoji: "🏪" },
  { id: "Grocery", label: "Grocery", emoji: "🛒" },
  { id: "Food", label: "Food", emoji: "🍕" },
  { id: "Pharmacy", label: "Pharmacy", emoji: "💊" },
  { id: "Electronics", label: "Electronics", emoji: "📱" },
];

const featuredCategories = [
  { name: "Vegetables & Fruits", emoji: "🥬", color: "from-green-500 to-green-400" },
  { name: "Dairy & Breakfast", emoji: "🥛", color: "from-blue-500 to-blue-400" },
  { name: "Munchies", emoji: "🍿", color: "from-orange-500 to-orange-400" },
  { name: "Cold Drinks", emoji: "🥤", color: "from-red-500 to-red-400" },
  { name: "Instant Food", emoji: "🍜", color: "from-yellow-500 to-yellow-400" },
  { name: "Tea & Coffee", emoji: "☕", color: "from-purple-500 to-purple-400" },
  { name: "Bakery & Biscuits", emoji: "🍪", color: "from-pink-500 to-pink-400" },
  { name: "Sauces & Spreads", emoji: "🍯", color: "from-amber-500 to-amber-400" },
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

  // Type assertion to avoid deep type instantiation with React 19
  const apiAny: any = api;

  const nearbyShops = useQuery(
    apiAny.stores.getNearbyShops,
    userLocation ? { userLat: userLocation.lat, userLng: userLocation.lng, category, search, radius: 10 } : "skip"
  );

  const trendingProducts = useQuery(apiAny.products.getTrendingProducts, { limit: 6 });
  const topRatedProducts = useQuery(apiAny.products.getTopRatedProducts, { limit: 4 });
  const featuredProducts = useQuery(apiAny.products.getFeaturedProducts, { limit: 8 });
  const activeOffers = useQuery(apiAny.offers.getActiveOffers);
  
  const recentOrders = useQuery(
    apiAny.orders.getRecentOrders,
    isAuthenticated ? { limit: 3 } : "skip"
  );
  const recommendedProducts = useQuery(
    apiAny.products.getRecommendedProducts,
    { limit: 8 }
  );
  const recentlyViewedProducts = useQuery(
    apiAny.products.getRecentlyViewedProducts,
    isAuthenticated ? { limit: 6 } : "skip"
  );
  const recommendedStores = useQuery(
    apiAny.stores.getRecommendedStores,
    userLocation ? { lat: userLocation.lat, lng: userLocation.lng, limit: 6 } : "skip"
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      
      <MobileHeader 
        userLocation={userLocation}
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
      />

      <main id="main-content" role="main">
        <HeroSection 
          isAuthenticated={isAuthenticated}
          nearbyShopsCount={nearbyShops?.length || 0}
        />

        <div className="px-4">
          <CategoryPills 
            categories={categories}
            selectedCategory={category}
            onCategoryChange={setCategory}
          />

          <QuickActions actions={quickActions} />

          {trendingProducts === undefined ? (
            <ProductSectionSkeleton />
          ) : trendingProducts && trendingProducts.length > 0 ? (
            <ProductSection
              title="Trending Now"
              icon={<Flame className="h-4 w-4 text-orange-500" />}
              badge="Hot 🔥"
              products={trendingProducts.filter((item: any) => 
                item !== null && 'image' in item && 'name' in item && 'price' in item
              ).map((item: any) => ({
                _id: item._id as string,
                image: (item as any).image,
                name: (item as any).name,
                price: (item as any).price,
                storeName: (item as any).storeName,
              }))}
            />
          ) : null}

          {topRatedProducts === undefined ? (
            <ProductSectionSkeleton />
          ) : topRatedProducts && topRatedProducts.length > 0 ? (
            <ProductSection
              title="Top Rated"
              icon={<Award className="h-4 w-4 text-yellow-500" />}
              badge="Best Quality"
              products={topRatedProducts.filter((item: any) => 
                item !== null && 'image' in item && 'name' in item && 'price' in item
              ).map((item: any) => ({
                _id: item._id as string,
                image: (item as any).image,
                name: (item as any).name,
                price: (item as any).price,
                storeName: (item as any).storeName,
                storeRating: (item as any).storeRating,
              }))}
              showRating
            />
          ) : null}

          {featuredProducts && featuredProducts.length > 0 && (
            <ProductSection
              title="Featured Picks"
              icon={<Sparkles className="h-4 w-4 text-primary" />}
              badge="Handpicked"
              products={featuredProducts.filter((item: any) => 
                item !== null && 'image' in item && 'name' in item && 'price' in item
              ).map((item: any) => ({
                _id: item._id as string,
                image: (item as any).image,
                name: (item as any).name,
                price: (item as any).price,
                storeName: (item as any).storeName,
              }))}
            />
          )}

          {recommendedProducts && recommendedProducts.length > 0 && (
            <ProductSection
              title="Recommended for You"
              icon={<Sparkles className="h-4 w-4 text-purple-500" />}
              badge="Personalized"
              products={recommendedProducts.filter((item: any) => 
                item && 'image' in item && 'name' in item && 'price' in item && 'storeName' in item
              ).map((item: any) => ({
                _id: item._id as string,
                image: (item as any).image,
                name: (item as any).name,
                price: (item as any).price,
                storeName: (item as any).storeName,
              }))}
            />
          )}

          {isAuthenticated && recentlyViewedProducts && recentlyViewedProducts.length > 0 && (
            <ProductSection
              title="Buy Again"
              icon={<RefreshCw className="h-4 w-4 text-blue-500" />}
              badge="From Your Orders"
              products={recentlyViewedProducts.filter((item: any) => 
                item && 'image' in item && 'name' in item && 'price' in item && 'storeName' in item
              ).map((item: any) => ({
                _id: item._id as string,
                image: (item as any).image,
                name: (item as any).name,
                price: (item as any).price,
                storeName: (item as any).storeName,
              }))}
            />
          )}

          <FeaturedCategories categories={featuredCategories} />

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
                {recommendedStores.slice(0, 4).map((shop: any, index: number) => (
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

          {activeOffers && activeOffers.length > 0 && (
            <div className="py-3">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <h2 className="text-base font-bold">Active Offers</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {activeOffers.slice(0, 5).map((offer: any) => (
                  <OfferCard key={offer._id} offer={offer} compact />
                ))}
              </div>
            </div>
          )}

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
                {recentOrders.map((order: any, index: number) => (
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
                            {order.status.split("_").map((word: string) => 
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
                {nearbyShops.slice(0, 6).map((shop: any, index: number) => (
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

          <WhyChooseUs />
        </div>
      </main>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
      {isAuthenticated && <PushNotificationPrompt />}
    </div>
  );
}