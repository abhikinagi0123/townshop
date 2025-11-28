import { Toaster } from "@/components/ui/sonner";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "../../index.css";
import ShopAuth from "./pages/Auth";
import ShopDashboard from "./pages/Dashboard";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const router = createBrowserRouter([
  { path: "/", element: <ShopDashboard /> },
  { path: "/auth", element: <ShopAuth /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <RouterProvider router={router} />
      <Toaster />
    </ConvexAuthProvider>
  </StrictMode>
);
