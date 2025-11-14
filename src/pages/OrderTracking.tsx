import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useNavigate } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, CheckCircle2, Clock, Truck, MapPin, Phone, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const order = useQuery(api.orders.getById, { orderId: orderId as Id<"orders"> });
  const cartItems = useQuery(api.cart.get);

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const statusSteps = [
    { key: "pending", label: "Order Placed", icon: Package },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { key: "preparing", label: "Preparing", icon: Clock },
    { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const currentStatusIndex = order ? getStatusIndex(order.status) : -1;

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={cartCount} />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/orders")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">Track Order</h1>
              <p className="text-sm text-muted-foreground">
                Order placed on {new Date(order._creationTime).toLocaleDateString()}
              </p>
            </div>
            <Badge className={
              order.status === "delivered" ? "bg-green-500" :
              order.status === "cancelled" ? "bg-red-500" :
              "bg-blue-500"
            }>
              {order.status.split("_").map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(" ")}
            </Badge>
          </div>

          {/* Status Timeline */}
          {order.status !== "cancelled" && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-6">Order Status</h2>
                <div className="relative">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    
                    return (
                      <div key={step.key} className="flex items-start mb-8 last:mb-0">
                        <div className="relative flex flex-col items-center mr-4">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isCompleted 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </motion.div>
                          {index < statusSteps.length - 1 && (
                            <div className={`w-0.5 h-16 mt-2 ${
                              isCompleted ? "bg-primary" : "bg-muted"
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pt-2">
                          <p className={`font-semibold ${isCurrent ? "text-primary" : ""}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Current status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Partner Info */}
          {order.deliveryPartner && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4">Delivery Partner</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{order.deliveryPartner.name}</p>
                      {order.deliveryPartner.vehicleNumber && (
                        <p className="text-sm text-muted-foreground">
                          Vehicle: {order.deliveryPartner.vehicleNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${order.deliveryPartner.phone}`} className="text-primary hover:underline">
                      {order.deliveryPartner.phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-4">Order Details</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="font-semibold mb-2">{order.storeName}</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.productName} x {item.quantity}</span>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          <span>{item.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total Amount</span>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    <span>{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
