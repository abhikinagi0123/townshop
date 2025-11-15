import { api } from "@/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState } from "react";

// Type assertion to avoid deep type instantiation with React 19
const useAuthActions = (): any => {
  const authModule = require("@convex-dev/auth/react");
  return authModule.useAuthActions();
};

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const apiAny: any = api;
  const user = useQuery(apiAny.users.currentUser) as any;
  const authActions = useAuthActions();
  const { signIn, signOut } = authActions;

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