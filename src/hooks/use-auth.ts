import { api } from "@/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions as useConvexAuthActions } from "@convex-dev/auth/react";
import { useEffect, useState } from "react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const apiAny: any = api;
  const user = useQuery(apiAny.users.currentUser) as any;
  const { signIn, signOut } = useConvexAuthActions();

  const [isLoading, setIsLoading] = useState(true);

  // This effect updates the loading state once auth is loaded and user data are available
  // It ensures we only show content when both authentication state and user data are ready
  useEffect(() => {
    if (!isAuthLoading && user !== undefined) {
      setIsLoading(false);
    }
  }, [isAuthLoading, user]);

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}