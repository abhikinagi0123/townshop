import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Bell, ShoppingCart, Heart } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AccessibilityControls } from "@/components/AccessibilityControls";

interface MobileHeaderProps {
  userLocation?: { lat: number; lng: number } | null;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
}

export function MobileHeader({ 
  userLocation, 
  isAuthenticated, 
  isLoading,
  search = "",
  onSearchChange,
  showSearch = true
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const apiAny: any = api;
  const unreadCount = useQuery(apiAny.notifications.getUnreadCount);
  const cartItems = useQuery(apiAny.cart.get);
  const favorites = useQuery(apiAny.favorites.list);

  const cartCount = cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  const favoritesCount = favorites?.length || 0;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm"
      role="banner"
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 flex-1"
          >
            <img src="/logo.svg" alt="TownShop Logo" className="h-8 w-8" />
            <div className="flex-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                <span className="truncate max-w-[150px]">
                  {userLocation ? "Current Location" : "Loading..."}
                </span>
              </div>
              <p className="text-sm font-semibold truncate max-w-[200px]">
                Delivering now
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <AccessibilityControls />
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative min-h-[44px] min-w-[44px] p-0"
                  onClick={() => navigate("/favorites")}
                  aria-label={`Favorites${favoritesCount ? ` (${favoritesCount} items)` : ""}`}
                >
                  <Heart className="h-6 w-6" aria-hidden="true" />
                  {favoritesCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
                    >
                      {favoritesCount > 9 ? "9+" : favoritesCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative min-h-[44px] min-w-[44px] p-0"
                  onClick={() => navigate("/cart")}
                  aria-label={`Cart${cartCount ? ` (${cartCount} items)` : ""}`}
                >
                  <ShoppingCart className="h-6 w-6" aria-hidden="true" />
                  {cartCount > 0 && (
                    <Badge
                      variant="default"
                      className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative min-h-[44px] min-w-[44px] p-0"
                  onClick={() => navigate("/notifications")}
                  aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
                >
                  <Bell className="h-6 w-6" aria-hidden="true" />
                  {unreadCount && unreadCount > 0 ? (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  ) : null}
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/auth")}
                className="min-h-[44px] px-6 text-base font-semibold"
                aria-label="Login"
              >
                Login
              </Button>
            )}
          </div>
        </div>

        {showSearch && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search stores, products..."
                className="pl-12 h-12 bg-muted/50 text-base rounded-xl"
                readOnly
                onClick={() => navigate("/search")}
                aria-label="Search for stores and products"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate("/search");
                  }
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}