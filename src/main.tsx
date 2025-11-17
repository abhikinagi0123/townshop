import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, useLocation } from "react-router";
import "./index.css";
import { Loader2 } from "lucide-react";
import "./types/global.d.ts";

// Eager load critical pages
import Landing from "./pages/Landing.tsx";
import AuthPage from "@/pages/Auth.tsx";

// Lazy load non-critical pages
const Stores = lazy(() => import("./pages/Stores.tsx"));
const StoreDetail = lazy(() => import("./pages/StoreDetail.tsx"));
const Cart = lazy(() => import("./pages/Cart.tsx"));
const Orders = lazy(() => import("./pages/Orders.tsx"));
const OrderTracking = lazy(() => import("./pages/OrderTracking.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const Addresses = lazy(() => import("./pages/Addresses.tsx"));
const Search = lazy(() => import("./pages/Search.tsx"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Chat = lazy(() => import("./pages/Chat"));
const Loyalty = lazy(() => import("./pages/Loyalty"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const FlashSales = lazy(() => import("./pages/FlashSales.tsx"));
const GiftCards = lazy(() => import("./pages/GiftCards.tsx"));
const PriceDropAlerts = lazy(() => import("./pages/PriceDropAlerts.tsx"));
const SubscriptionBoxes = lazy(() => import("./pages/SubscriptionBoxes.tsx"));
const GroupBuying = lazy(() => import("./pages/GroupBuying.tsx"));
const Services = lazy(() => import("./pages/Services.tsx"));

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/auth", element: <AuthPage redirectAfterAuth="/stores" /> },
  { path: "/stores", element: <Suspense fallback={<PageLoader />}><Stores /></Suspense> },
  { path: "/store/:storeId", element: <Suspense fallback={<PageLoader />}><StoreDetail /></Suspense> },
  { path: "/services", element: <Suspense fallback={<PageLoader />}><Services /></Suspense> },
  { path: "/product/:productId", element: <Suspense fallback={<PageLoader />}><ProductDetail /></Suspense> },
  { path: "/search", element: <Suspense fallback={<PageLoader />}><Search /></Suspense> },
  { path: "/cart", element: <Suspense fallback={<PageLoader />}><Cart /></Suspense> },
  { path: "/orders", element: <Suspense fallback={<PageLoader />}><Orders /></Suspense> },
  { path: "/order/:orderId", element: <Suspense fallback={<PageLoader />}><OrderTracking /></Suspense> },
  { path: "/profile", element: <Suspense fallback={<PageLoader />}><Profile /></Suspense> },
  { path: "/addresses", element: <Suspense fallback={<PageLoader />}><Addresses /></Suspense> },
  { path: "/favorites", element: <Suspense fallback={<PageLoader />}><Favorites /></Suspense> },
  { path: "/loyalty", element: <Suspense fallback={<PageLoader />}><Loyalty /></Suspense> },
  { path: "/notifications", element: <Suspense fallback={<PageLoader />}><Notifications /></Suspense> },
  { path: "/chat/:sessionId", element: <Suspense fallback={<PageLoader />}><Chat /></Suspense> },
  { path: "/dashboard", element: <Suspense fallback={<PageLoader />}><Dashboard /></Suspense> },
  { path: "/flash-sales", element: <Suspense fallback={<PageLoader />}><FlashSales /></Suspense> },
  { path: "/gift-cards", element: <Suspense fallback={<PageLoader />}><GiftCards /></Suspense> },
  { path: "/price-alerts", element: <Suspense fallback={<PageLoader />}><PriceDropAlerts /></Suspense> },
  { path: "/subscriptions", element: <Suspense fallback={<PageLoader />}><SubscriptionBoxes /></Suspense> },
  { path: "/group-buying", element: <Suspense fallback={<PageLoader />}><GroupBuying /></Suspense> },
  { path: "*", element: <Suspense fallback={<PageLoader />}><NotFound /></Suspense> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <RouterProvider router={router} />
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);