import { Button } from "@/components/ui/button";
import { Home, Search, Star, User } from "lucide-react";
import { useNavigate } from "react-router";

interface MobileBottomNavProps {
  isAuthenticated?: boolean;
}

export function MobileBottomNav({ isAuthenticated }: MobileBottomNavProps) {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50" aria-label="Main navigation">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-full rounded-none flex-1 min-h-[44px] min-w-[44px]"
          onClick={() => navigate("/")}
          aria-label="Navigate to home page"
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs">Home</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-full rounded-none flex-1 min-h-[44px] min-w-[44px]"
          onClick={() => navigate("/search")}
          aria-label="Navigate to search page"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs">Search</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-full rounded-none flex-1 min-h-[44px] min-w-[44px]"
          onClick={() => navigate("/stores")}
          aria-label="Navigate to stores page"
        >
          <Star className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs">Stores</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-full rounded-none flex-1 min-h-[44px] min-w-[44px]"
          onClick={() => isAuthenticated ? navigate("/profile") : navigate("/auth")}
          aria-label={isAuthenticated ? "Navigate to profile page" : "Navigate to login page"}
        >
          <User className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs">Profile</span>
        </Button>
      </div>
    </nav>
  );
}
