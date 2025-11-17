import { Button } from "@/components/ui/button";
import { Home, Search, Store, User } from "lucide-react";
import { useNavigate } from "react-router";

interface MobileBottomNavProps {
  isAuthenticated?: boolean;
}

export function MobileBottomNav({ isAuthenticated }: MobileBottomNavProps) {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50" aria-label="Main navigation">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-2">
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1.5 h-full rounded-xl flex-1 min-h-[56px] min-w-[56px] active:bg-accent transition-colors"
          onClick={() => navigate("/")}
          aria-label="Navigate to home page"
        >
          <Home className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs font-semibold">Home</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1.5 h-full rounded-xl flex-1 min-h-[56px] min-w-[56px] active:bg-accent transition-colors"
          onClick={() => navigate("/search")}
          aria-label="Navigate to search page"
        >
          <Search className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs font-semibold">Search</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1.5 h-full rounded-xl flex-1 min-h-[56px] min-w-[56px] active:bg-accent transition-colors"
          onClick={() => navigate("/stores")}
          aria-label="Navigate to stores page"
        >
          <Store className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs font-semibold">Stores</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1.5 h-full rounded-xl flex-1 min-h-[56px] min-w-[56px] active:bg-accent transition-colors"
          onClick={() => isAuthenticated ? navigate("/profile") : navigate("/auth")}
          aria-label={isAuthenticated ? "Navigate to profile page" : "Navigate to login page"}
        >
          <User className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs font-semibold">Profile</span>
        </Button>
      </div>
    </nav>
  );
}