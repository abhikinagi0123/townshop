import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";

// Type assertion to avoid deep type instantiation with React 19
const apiAny: any = api;
import { Package, ArrowLeft, IndianRupee, Users, Split, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const orders = useQuery(apiAny.orders.list);
  const serviceBookings = useQuery(apiAny.services.listUserBookings);
  const splitOrders = useQuery(apiAny.orderSplitting.listByUser);
  
  const createSplit = useMutation(apiAny.orderSplitting.create);
  const acceptSplit = useMutation(apiAny.orderSplitting.accept);
  const updateBookingStatus = useMutation(apiAny.services.updateBookingStatus);

  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [splitEmail, setSplitEmail] = useState("");
  const [splitAmount, setSplitAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "services">("products");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-500";
      case "out_for_delivery": return "bg-blue-500";
      case "preparing": return "bg-yellow-500";
      case "confirmed": return "bg-purple-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const handleOpenSplitDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setSplitDialogOpen(true);
  };

  const handleCreateSplit = async () => {
    if (!selectedOrderId || !splitEmail.trim() || !splitAmount) {
      toast.error("Please fill in all fields");
      return;
    }

    const amount = parseFloat(splitAmount);
    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await createSplit({
        orderId: selectedOrderId as Id<"orders">,
        participantEmail: splitEmail,
        amount,
      });
      toast.success("Split request sent!");
      setSplitEmail("");
      setSplitAmount("");
      setSplitDialogOpen(false);
      setSelectedOrderId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to create split");
    }
  };

  const handleAcceptSplit = async (splitId: string) => {
    try {
      await acceptSplit({ splitId: splitId as any });
      toast.success("Split accepted!");
    } catch (error) {
      toast.error("Failed to accept split");
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus({ bookingId: bookingId as any, status: "cancelled" });
      toast.success("Booking cancelled");
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch={false} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/profile")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "products" ? "default" : "outline"}
            onClick={() => setActiveTab("products")}
            className="flex-1"
          >
            <Package className="h-4 w-4 mr-2" />
            Product Orders
          </Button>
          <Button
            variant={activeTab === "services" ? "default" : "outline"}
            onClick={() => setActiveTab("services")}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-2" />
            Service Bookings
          </Button>
        </div>

        {splitOrders && splitOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Split className="h-5 w-5 text-primary" />
              Split Requests
            </h2>
            <div className="space-y-3">
              {splitOrders.map((split: any) => (
                <Card key={split._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {split.isInitiator ? "You requested" : `${split.initiatorName} requested`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Amount: ₹{split.amount}
                        </p>
                        <Badge variant={split.status === "accepted" ? "default" : "secondary"} className="mt-2">
                          {split.status}
                        </Badge>
                      </div>
                      {!split.isInitiator && split.status === "pending" && (
                        <Button size="sm" onClick={() => handleAcceptSplit(split._id)}>
                          Accept
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <>
            {!orders || orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl text-muted-foreground mb-4">No orders yet</p>
                <Button onClick={() => navigate("/stores")}>
                  Start Shopping
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/order/${order._id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg">{order.storeName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order._creationTime).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
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

                        <div className="border-t pt-4">
                          <div className="flex justify-between font-bold mb-3">
                            <span>Total Amount</span>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4" />
                              <span>{order.totalAmount}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Delivery to: {order.deliveryAddress}
                          </p>
                          
                          {order.status === "delivered" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSplitDialog(order._id);
                              }}
                              className="w-full"
                            >
                              <Split className="h-4 w-4 mr-2" />
                              Split Bill
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "services" && (
          <>
            {!serviceBookings || serviceBookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl text-muted-foreground mb-4">No service bookings yet</p>
                <Button onClick={() => navigate("/services")}>
                  Browse Services
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {serviceBookings.map((booking: any) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg">{booking.service?.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {booking.provider?.businessName}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.scheduledDate} at {booking.scheduledTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Duration: {booking.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.address}</span>
                          </div>
                          {booking.isRecurring && (
                            <Badge variant="secondary" className="text-xs">
                              Recurring: {booking.recurringFrequency}
                            </Badge>
                          )}
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex justify-between font-bold mb-3">
                            <span>Total Amount</span>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4" />
                              <span>{booking.totalAmount}</span>
                            </div>
                          </div>
                          
                          {booking.status === "pending" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelBooking(booking._id)}
                              className="w-full"
                            >
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={splitDialogOpen} onOpenChange={setSplitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Split Order Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Participant Email</Label>
              <Input
                type="email"
                placeholder="friend@example.com"
                value={splitEmail}
                onChange={(e) => setSplitEmail(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Split Amount (₹)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={splitAmount}
                onChange={(e) => setSplitAmount(e.target.value)}
                className="mt-2"
                min="1"
              />
            </div>
            <Button onClick={handleCreateSplit} className="w-full">
              <Split className="h-4 w-4 mr-2" />
              Send Split Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}