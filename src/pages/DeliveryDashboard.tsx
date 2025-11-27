import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { 
  Package, 
  MapPin, 
  Clock, 
  DollarSign,
  CheckCircle,
  Navigation,
  Phone
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);

  const apiAny: any = api;

  // Get delivery partner profile
  const deliveryPartner = useQuery(
    apiAny.deliveryPartners.getById,
    user ? { partnerId: user._id } : "skip"
  );

  // Get assigned deliveries
  const assignedDeliveries = useQuery(
    apiAny.deliveryTracking.listByPartner,
    deliveryPartner ? { partnerId: deliveryPartner._id, status: "assigned" } : "skip"
  );

  const activeDeliveries = useQuery(
    apiAny.deliveryTracking.listByPartner,
    deliveryPartner ? { partnerId: deliveryPartner._id, status: "in_transit" } : "skip"
  );

  const updateAvailability = useMutation(apiAny.deliveryPartners.updateAvailability);
  const updateStatus = useMutation(apiAny.deliveryTracking.updateStatus);

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const handleToggleAvailability = async () => {
    if (!deliveryPartner) return;
    try {
      await updateAvailability({
        partnerId: deliveryPartner._id,
        isAvailable: !isAvailable,
      });
      setIsAvailable(!isAvailable);
      toast.success(isAvailable ? "You are now offline" : "You are now online");
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const handleAcceptDelivery = async (orderId: string) => {
    try {
      await updateStatus({ orderId: orderId as any, status: "picked_up" });
      toast.success("Delivery accepted!");
    } catch (error) {
      toast.error("Failed to accept delivery");
    }
  };

  const totalEarnings = deliveryPartner?.earnings || 0;
  const totalDeliveries = deliveryPartner?.totalDeliveries || 0;
  const rating = deliveryPartner?.rating || 5.0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Delivery Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {deliveryPartner?.name || "Delivery Partner"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleToggleAvailability}
              variant={isAvailable ? "default" : "outline"}
              className="gap-2"
            >
              <Navigation className="h-4 w-4" />
              {isAvailable ? "Online" : "Offline"}
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹{totalEarnings}</p>
                    <p className="text-xs text-muted-foreground">Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalDeliveries}</p>
                    <p className="text-xs text-muted-foreground">Deliveries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{rating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{assignedDeliveries?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Deliveries */}
          {activeDeliveries && activeDeliveries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Active Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeDeliveries.map((delivery: any) => (
                    <div
                      key={delivery._id}
                      className="p-4 border rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => navigate(`/order/${delivery.orderId}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">Order #{delivery.orderId.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">In Transit</p>
                        </div>
                        <Badge className="bg-blue-500">Active</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Distance: {delivery.distanceRemaining || "N/A"} km</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* New Delivery Requests */}
          {assignedDeliveries && assignedDeliveries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  New Delivery Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignedDeliveries.map((delivery: any) => (
                    <div
                      key={delivery._id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold">Order #{delivery.orderId.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">Pickup Ready</p>
                        </div>
                        <Badge variant="outline">New</Badge>
                      </div>
                      <Button
                        onClick={() => handleAcceptDelivery(delivery.orderId)}
                        className="w-full"
                      >
                        Accept Delivery
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {(!assignedDeliveries || assignedDeliveries.length === 0) && 
           (!activeDeliveries || activeDeliveries.length === 0) && (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Active Deliveries</h3>
                <p className="text-muted-foreground">
                  {isAvailable 
                    ? "You're online and ready to receive delivery requests" 
                    : "Go online to start receiving delivery requests"}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}
