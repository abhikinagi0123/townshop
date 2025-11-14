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
  { title: "10-Minute Delivery", icon: "⚡", desc: "Lightning fast" },
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
          // Default to a location if geolocation fails
          setUserLocation({ lat: 28.6139, lng: 77.2090 }); // Delhi
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 }); // Delhi
    }
  }, [user]);

  const nearbyShops = useQuery(
    api.stores.getNearbyShops,
    userLocation ? { lat: userLocation.lat, lng: userLocation.lng, category, search, radius: 10 } : "skip"
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight">QuickDeliver</span>
          </motion.div>
          <div className="flex items-center gap-3">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <Button onClick={() => navigate("/stores")} size="sm">
                    Browse Stores
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/auth")} size="sm">
                    Get Started
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Search */}
      <div className="bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 pt-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Location Display */}
            {userLocation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground"
              >
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">Delivering to your location</span>
              </motion.div>
            )}

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-tight"
            >
              Your Local Stores,
              <br />
              <span className="text-primary">Delivered in Minutes</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Get groceries, food, medicines, and more delivered to your doorstep
            </motion.p>

            {/* Prominent Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative max-w-2xl mx-auto mb-6"
            >
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for stores, products, or categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-14 pr-4 h-14 text-base shadow-lg border-2 focus:border-primary rounded-xl"
                />
              </div>
            </motion.div>

            {/* Category Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-2 justify-center flex-wrap"
            >
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={category === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory(cat.id)}
                  className="gap-2 rounded-full px-4 h-10"
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </Button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions Banner */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{action.icon}</div>
                  <h3 className="font-bold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Categories */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredCategories.map((cat, index) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="cursor-pointer overflow-hidden group">
                  <CardContent className={`p-6 bg-gradient-to-br ${cat.color} text-white`}>
                    <div className="text-center">
                      <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                        {cat.emoji}
                      </div>
                      <h3 className="font-bold text-sm">{cat.name}</h3>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Nearby Shops Section */}
      {nearbyShops && nearbyShops.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl md:text-3xl font-bold">Stores Near You</h2>
                </div>
                <p className="text-muted-foreground">
                  {nearbyShops.length} {nearbyShops.length === 1 ? "store" : "stores"} available
                </p>
              </div>
              {nearbyShops.length > 8 && (
                <Button
                  variant="ghost"
                  onClick={() => navigate("/stores")}
                  className="gap-2"
                >
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {nearbyShops.slice(0, 8).map((shop, index) => (
                <motion.div
                  key={shop._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                >
                  <StoreCard store={shop} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Choose Us?</h2>
            <p className="text-muted-foreground text-lg">Fast, reliable, and quality assured</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 mx-auto shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Get your orders delivered in 10-30 minutes
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 mx-auto shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">Local Stores</h3>
              <p className="text-muted-foreground">
                Support your neighborhood businesses
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-4 mx-auto shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">Quality Assured</h3>
              <p className="text-muted-foreground">
                Fresh products, every single time
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 QuickDeliver. All rights reserved.</p>
          <p className="mt-2">
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