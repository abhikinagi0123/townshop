import { Button } from "@/components/ui/button";
import { ShoppingCart, User, MapPin } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface NavbarProps {
  cartCount?: number;
}

export function Navbar({ cartCount = 0 }: NavbarProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b shadow-sm">
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

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/stores")}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Stores</span>
          </Button>

          {isAuthenticated && (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => navigate("/cart")}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-in zoom-in"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/profile")}
                >
                  <User className="h-5 w-5" />
                </Button>
              </motion.div>
            </>
          )}

          {!isAuthenticated && (
            <Button onClick={() => navigate("/auth")} size="sm">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}