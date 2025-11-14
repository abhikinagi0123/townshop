import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { StoreCard } from "@/components/StoreCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Store } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  { id: "all", label: "All", emoji: "🏪" },
  { id: "Grocery", label: "Grocery", emoji: "🛒" },
  { id: "Food", label: "Food", emoji: "🍕" },
  { id: "Pharmacy", label: "Pharmacy", emoji: "💊" },
  { id: "Electronics", label: "Electronics", emoji: "📱" },
];

export default function Stores() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  
  const cartItems = useQuery(api.cart.get);
  const stores = useQuery(api.stores.list, { category, search });

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar cartCount={cartCount} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Explore Stores</h1>
          </div>
          <p className="text-muted-foreground ml-15">
            Discover local stores and get your favorites delivered fast
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for stores, products, or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 text-base shadow-sm"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Button
                  variant={category === cat.id ? "default" : "outline"}
                  size="lg"
                  onClick={() => setCategory(cat.id)}
                  className="whitespace-nowrap gap-2 min-w-[120px] h-12"
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {stores === undefined ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col justify-center items-center h-64"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading stores...</p>
            </motion.div>
          ) : stores.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16"
            >
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Store className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No stores found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="stores"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {stores.map((store, index) => (
                <motion.div
                  key={store._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                >
                  <StoreCard store={store} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {stores && stores.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            Showing {stores.length} {stores.length === 1 ? "store" : "stores"}
          </motion.div>
        )}
      </div>
    </div>
  );
}