import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router";

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

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
      <div className="px-4 py-3">
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
                aria-label={isAuthenticated ? "Browse stores" : "Login to browse"}
              >
                {isAuthenticated ? "Browse" : "Login"}
              </Button>
            )}
          </motion.div>
        )}

        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search stores or products..."
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search.trim()) {
                  navigate(`/search?q=${encodeURIComponent(search.trim())}`);
                }
              }}
              onClick={() => navigate('/search')}
              className="pl-10 h-10 text-sm cursor-pointer"
              readOnly
              aria-label="Search stores or products"
            />
          </div>
        )}
      </div>
    </div>
  );
}