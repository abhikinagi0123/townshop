import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Store, Loader2 } from "lucide-react";
import { StoreCard } from "@/components/StoreCard";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileCompletionDialog } from "@/components/ProfileCompletionDialog";
import { useAuth } from "@/hooks/use-auth";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AdvancedFilters } from "@/components/AdvancedFilters";

const categories = [
  { id: "all", label: "All", emoji: "🏪" },
  { id: "Grocery", label: "Grocery", emoji: "🛒" },
  { id: "Food", label: "Food", emoji: "🍕" },
  { id: "Pharmacy", label: "Pharmacy", emoji: "💊" },
  { id: "Electronics", label: "Electronics", emoji: "📱" },
];

export default function Stores() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [filters, setFilters] = useState<any>({});
  
  const { user, isAuthenticated } = useAuth();
  const apiAny: any = api;
  const cartItems = useQuery(apiAny.cart.get);
  const storesData = useQuery(
    apiAny.stores.list, 
    { 
      category: category === "all" ? undefined : category, 
      search,
      filters,
      sortBy: filters.sortBy,
    }
  );
  const stores = storesData?.stores || [];

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    if (isAuthenticated && user && (!user.name || !user.phone || user.lat === undefined || user.lng === undefined)) {
      setShowProfileDialog(true);
    }
  }, [isAuthenticated, user]);

  const handleProfileComplete = () => {
    setShowProfileDialog(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader 
        search={search}
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
      />
      
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
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 space-y-4"
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

          <div className="flex justify-end">
            <AdvancedFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories.slice(1).map(c => c.id)}
              type="stores"
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {storesData === undefined ? (
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
                  setFilters({});
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
              {stores.map((store: any, index: number) => (
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
            {storesData?.hasMore && " (scroll for more)"}
          </motion.div>
        )}
      </div>

      <ProfileCompletionDialog
        open={showProfileDialog}
        onComplete={handleProfileComplete}
        currentName={user?.name}
        currentPhone={user?.phone}
        currentLat={user?.lat}
        currentLng={user?.lng}
      />

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}