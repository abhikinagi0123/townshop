import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, Zap, MapPin, Star, Search, ChevronRight, Clock, TrendingUp, Sparkles } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StoreCard } from "@/components/StoreCard";
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
  { name: "Vegetables & Fruits", emoji: "🥬", color: "from-green-500 to-emerald-600" },
  { name: "Dairy & Breakfast", emoji: "🥛", color: "from-blue-500 to-cyan-600" },
  { name: "Munchies", emoji: "🍿", color: "from-orange-500 to-amber-600" },
  { name: "Cold Drinks", emoji: "🥤", color: "from-red-500 to-pink-600" },
  { name: "Instant Food", emoji: "🍜", color: "from-purple-500 to-violet-600" },
  { name: "Tea & Coffee", emoji: "☕", color: "from-yellow-500 to-orange-600" },
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
              className="pl-10 h-10 text-sm"
            />
          </div>
        </div>
      </div>

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

        {/* Nearby Shops Section */}
        {nearbyShops && nearbyShops.length > 0 && (
          <div className="py-3">
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

      {/* Footer - Compact */}
      <footer className="border-t py-4 mt-6 bg-muted/30">
        <div className="px-4 text-center text-[10px] text-muted-foreground">
          <p>© 2024 QuickDeliver. All rights reserved.</p>
          <p className="mt-1">
            Powered by{" "}
            <a
              href="https://vly.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors"
            >
              vly.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}