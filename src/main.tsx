import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, useLocation } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import Stores from "./pages/Stores.tsx";
import StoreDetail from "./pages/StoreDetail.tsx";
import Cart from "./pages/Cart.tsx";
import Orders from "./pages/Orders.tsx";
import OrderTracking from "./pages/OrderTracking.tsx";
import Profile from "./pages/Profile.tsx";
import Addresses from "./pages/Addresses.tsx";
import Search from "./pages/Search.tsx";
import Favorites from "./pages/Favorites";
import Notifications from "./pages/Notifications";
import "./types/global.d.ts";

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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/auth",
    element: <AuthPage redirectAfterAuth="/stores" />,
  },
  {
    path: "/stores",
    element: <Stores />,
  },
  {
    path: "/store/:storeId",
    element: <StoreDetail />,
  },
  {
    path: "/cart",
    element: <Cart />,
  },
  {
    path: "/orders",
    element: <Orders />,
  },
  {
    path: "/order/:orderId",
    element: <OrderTracking />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/addresses",
    element: <Addresses />,
  },
  {
    path: "/search",
    element: <Search />,
  },
  {
    path: "/favorites",
    element: <Favorites />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
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