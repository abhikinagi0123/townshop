import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, Zap, MapPin, Star, Search } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StoreCard } from "@/components/StoreCard";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

const categories = [
  { id: "all", label: "All", emoji: "🏪" },
  { id: "Grocery", label: "Grocery", emoji: "🛒" },
  { id: "Food", label: "Food", emoji: "🍕" },
  { id: "Pharmacy", label: "Pharmacy", emoji: "💊" },
  { id: "Electronics", label: "Electronics", emoji: "📱" },
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20"
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="font-bold text-xl">QuickDeliver</span>
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <Button onClick={() => navigate("/stores")}>
                    Browse Stores
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/auth")}>
                    Get Started
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
              <ShoppingBag className="h-12 w-12 text-primary" />
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Your Local Stores,
            <br />
            <span className="text-primary">Delivered Fast</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get groceries, food, medicines, and more delivered to your doorstep in minutes.
          </p>

          {/* Location Display */}
          {userLocation && (
            <div className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Delivering to your location</span>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search shops or items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 text-base shadow-lg"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 justify-center flex-wrap mb-8">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={category === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat.id)}
                className="gap-2"
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Nearby Shops */}
        {nearbyShops && nearbyShops.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Nearby Shops</h2>
              <Badge variant="secondary">{nearbyShops.length} shops found</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            {nearbyShops.length > 8 && (
              <div className="text-center mt-6">
                <Button onClick={() => navigate("/stores")} variant="outline" size="lg">
                  View All Shops
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          <div className="p-6 rounded-lg bg-card border">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 mx-auto">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-center">Lightning Fast</h3>
            <p className="text-muted-foreground text-sm text-center">
              Get your orders delivered in 10-30 minutes
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4 mx-auto">
              <MapPin className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-center">Local Stores</h3>
            <p className="text-muted-foreground text-sm text-center">
              Support your neighborhood businesses
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border">
            <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 mx-auto">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-center">Quality Assured</h3>
            <p className="text-muted-foreground text-sm text-center">
              Fresh products, every single time
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
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
    </motion.div>
  );
}