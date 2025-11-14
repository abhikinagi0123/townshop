import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, Zap, Clock, MapPin, Star } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuth();

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
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-6">
              <ShoppingBag className="h-16 w-16 text-primary" />
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Your Local Stores,
            <br />
            <span className="text-primary">Delivered Fast</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get groceries, food, medicines, and more delivered to your doorstep in minutes. 
            Shop from your favorite local stores with just a few taps.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate(isAuthenticated ? "/stores" : "/auth")}
            >
              {isAuthenticated ? "Browse Stores" : "Get Started"}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8"
              onClick={() => navigate("/stores")}
            >
              Explore
            </Button>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
          >
            <div className="p-6 rounded-lg bg-card border">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 mx-auto">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground text-sm">
                Get your orders delivered in 10-30 minutes
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4 mx-auto">
                <MapPin className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Local Stores</h3>
              <p className="text-muted-foreground text-sm">
                Support your neighborhood businesses
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border">
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 mx-auto">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Quality Assured</h3>
              <p className="text-muted-foreground text-sm">
                Fresh products, every single time
              </p>
            </div>
          </motion.div>

          {/* Categories Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-20"
          >
            <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Grocery", emoji: "🛒", color: "bg-green-500/10" },
                { name: "Food", emoji: "🍕", color: "bg-red-500/10" },
                { name: "Pharmacy", emoji: "💊", color: "bg-blue-500/10" },
                { name: "Electronics", emoji: "📱", color: "bg-purple-500/10" },
              ].map((category) => (
                <motion.div
                  key={category.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-6 rounded-lg ${category.color} cursor-pointer border`}
                  onClick={() => navigate("/stores")}
                >
                  <div className="text-4xl mb-2">{category.emoji}</div>
                  <p className="font-semibold">{category.name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
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