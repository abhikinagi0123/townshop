import { Toaster } from "@/components/ui/sonner";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "../../index.css";
import CustomerAuth from "./pages/Auth";
import CustomerLanding from "./pages/Landing";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const Stores = lazy(() => import("../../pages/Stores"));
const StoreDetail = lazy(() => import("../../pages/StoreDetail"));
const Cart = lazy(() => import("../../pages/Cart"));
const Orders = lazy(() => import("../../pages/Orders"));
const OrderTracking = lazy(() => import("../../pages/OrderTracking"));
const Profile = lazy(() => import("../../pages/Profile"));
const ProductDetail = lazy(() => import("../../pages/ProductDetail"));
const Search = lazy(() => import("../../pages/Search"));
const Wallet = lazy(() => import("../../pages/Wallet"));

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const router = createBrowserRouter([
  { path: "/", element: <CustomerLanding /> },
  { path: "/auth", element: <CustomerAuth /> },
  { path: "/stores", element: <Suspense fallback={<PageLoader />}><Stores /></Suspense> },
  { path: "/store/:storeId", element: <Suspense fallback={<PageLoader />}><StoreDetail /></Suspense> },
  { path: "/product/:productId", element: <Suspense fallback={<PageLoader />}><ProductDetail /></Suspense> },
  { path: "/search", element: <Suspense fallback={<PageLoader />}><Search /></Suspense> },
  { path: "/cart", element: <Suspense fallback={<PageLoader />}><Cart /></Suspense> },
  { path: "/orders", element: <Suspense fallback={<PageLoader />}><Orders /></Suspense> },
  { path: "/order/:orderId", element: <Suspense fallback={<PageLoader />}><OrderTracking /></Suspense> },
  { path: "/profile", element: <Suspense fallback={<PageLoader />}><Profile /></Suspense> },
  { path: "/wallet", element: <Suspense fallback={<PageLoader />}><Wallet /></Suspense> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <RouterProvider router={router} />
      <Toaster />
    </ConvexAuthProvider>
  </StrictMode>
);
