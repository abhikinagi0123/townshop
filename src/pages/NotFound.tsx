import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Home, Search, Star, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-background pb-20"
    >
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="font-bold text-lg tracking-tight">QuickDeliver</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-5xl mx-auto relative px-4">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-lg text-gray-600 mb-6">Page Not Found</p>
              <Button onClick={() => navigate("/")}>
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-full rounded-none flex-1"
            onClick={() => navigate("/")}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-full rounded-none flex-1"
            onClick={() => navigate("/search")}
          >
            <Search className="h-5 w-5" />
            <span className="text-xs">Search</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-full rounded-none flex-1"
            onClick={() => navigate("/stores")}
          >
            <Star className="h-5 w-5" />
            <span className="text-xs">Rewards</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-full rounded-none flex-1"
            onClick={() => isAuthenticated ? navigate("/profile") : navigate("/auth")}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </motion.div>
  );
}