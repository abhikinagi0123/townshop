import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useNavigate } from "react-router";
import { ShoppingBag, Search, Star, MapPin, ArrowLeft, Package, CheckCircle2, Clock, Truck, Phone, IndianRupee, MessageSquare, Navigation, Share2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const apiAny: any = api;
  const order = useQuery(apiAny.orders.getById, { orderId: orderId as Id<"orders"> });
  const cartItems = useQuery(apiAny.cart.get);
  const deliveryLocation = useQuery(apiAny.deliveryTracking.getDeliveryPartnerLocation, { 
    orderId: orderId as Id<"orders"> 
  });
  const createReview = useMutation(apiAny.reviews.create);
  const mapRef = useRef<HTMLDivElement>(null);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const cartCount = cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

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

  const handleSubmitReview = async () => {
    if (!order || rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      await createReview({
        storeId: order.storeId,
        rating,
        comment,
        orderId: order._id,
      });
      toast.success("Review submitted successfully!");
      setReviewDialogOpen(false);
      setRating(0);
      setComment("");
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                <span className="font-bold text-xl tracking-tight">QuickDeliver</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* App Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
              <span className="font-bold text-xl tracking-tight">QuickDeliver</span>
            </div>
          </div>
        </div>
      </div>
      
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
              {order.status.split("_").map((word: string) => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(" ")}
            </Badge>
          </div>

          {/* Review Button for Delivered Orders */}
          {order.status === "delivered" && (
            <Card className="mb-6 bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold mb-1">How was your experience?</p>
                    <p className="text-sm text-muted-foreground">Rate this store and help others</p>
                  </div>
                  <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Star className="h-4 w-4 mr-2" />
                        Write Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rate Your Experience</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Rating</p>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`h-8 w-8 ${
                                    star <= (hoveredRating || rating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Comment (Optional)</p>
                          <Textarea
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button onClick={handleSubmitReview} className="w-full">
                          Submit Review
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Delivery Partner Info & Live Tracking */}
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

                  {/* Live Location Tracking */}
                  {deliveryLocation && deliveryLocation.currentLat && deliveryLocation.currentLng && (
                    <div className="mt-4 border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-primary animate-pulse" />
                          <span className="font-semibold text-sm">Live Tracking</span>
                        </div>
                        {deliveryLocation.lastLocationUpdate && (
                          <span className="text-xs text-muted-foreground">
                            Updated {Math.floor((Date.now() - deliveryLocation.lastLocationUpdate) / 60000)}m ago
                          </span>
                        )}
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden h-64 relative border-2 border-primary/20">
                        <div ref={mapRef} className="w-full h-full flex items-center justify-center">
                          <div className="text-center relative z-10">
                            <div className="relative inline-block mb-3">
                              <MapPin className="h-12 w-12 text-primary animate-bounce" />
                              <div className="absolute inset-0 h-12 w-12 bg-primary/20 rounded-full animate-ping" />
                            </div>
                            <p className="text-sm font-medium mb-1">Delivery Partner En Route</p>
                            <p className="text-xs text-muted-foreground mb-3">
                              Lat: {deliveryLocation.currentLat.toFixed(4)}, Lng: {deliveryLocation.currentLng.toFixed(4)}
                            </p>
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  window.open(
                                    `https://www.google.com/maps/dir/?api=1&destination=${deliveryLocation.currentLat},${deliveryLocation.currentLng}`,
                                    '_blank'
                                  );
                                }}
                              >
                                <Navigation className="h-3 w-3 mr-1" />
                                Open in Maps
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (navigator.share) {
                                    navigator.share({
                                      title: 'Track My Delivery',
                                      text: 'Follow my delivery in real-time',
                                      url: window.location.href,
                                    });
                                  }
                                }}
                              >
                                <Share2 className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                    {order.items.map((item: any, idx: number) => (
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

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-full rounded-none flex-1"
            onClick={() => navigate("/")}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-full rounded-none flex-1"
            onClick={() => navigate("/search")}
          >
            <Search className="h-5 w-5" />
            <span className="text-xs">Search</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-full rounded-none flex-1"
            onClick={() => navigate("/stores")}
          >
            <Star className="h-5 w-5" />
            <span className="text-xs">Stores</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-full rounded-none flex-1"
            onClick={() => navigate("/profile")}
          >
            <MapPin className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}