import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Trash2, IndianRupee, ShoppingBag, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const cartItems = useQuery(api.cart.get);
  const addresses = useQuery(api.addresses.list);
  
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.removeItem);
  const clearCart = useMutation(api.cart.clear);
  const createOrder = useMutation(api.orders.create);
  const createAddress = useMutation(api.addresses.create);

  const [showCheckout, setShowCheckout] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [newAddress, setNewAddress] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Order scheduling states
  const [scheduleOrder, setScheduleOrder] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");

  const subtotal = cartItems?.reduce((sum, item) => 
    sum + (item.product?.price || 0) * item.quantity, 0
  ) || 0;
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      await updateQuantity({ cartItemId: cartItemId as any, quantity: newQuantity });
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeItem({ cartItemId: cartItemId as any });
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleAddAddress = async () => {
    try {
      await createAddress({
        ...newAddress,
        isDefault: addresses?.length === 0,
      });
      setShowAddAddress(false);
      setNewAddress({ label: "", street: "", city: "", state: "", zipCode: "" });
      toast.success("Address added");
    } catch (error) {
      toast.error("Failed to add address");
    }
  };

  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) return;
    
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    // Validate scheduling if enabled
    if (scheduleOrder && (!scheduledDate || !scheduledTime)) {
      toast.error("Please select date and time for scheduled delivery");
      return;
    }

    const address = addresses?.find(a => a._id === selectedAddress);
    if (!address) return;

    const storeId = cartItems[0].product?.storeId;
    const storeName = cartItems[0].store?.name;
    
    if (!storeId || !storeName) {
      toast.error("Invalid cart data");
      return;
    }

    // Calculate scheduled timestamp if scheduling is enabled
    let scheduledFor: number | undefined;
    if (scheduleOrder && scheduledDate && scheduledTime) {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      scheduledFor = scheduledDateTime.getTime();
      
      // Validate that scheduled time is in the future
      if (scheduledFor <= Date.now()) {
        toast.error("Scheduled time must be in the future");
        return;
      }
    }

    try {
      await createOrder({
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.product?.name || "",
          quantity: item.quantity,
          price: item.product?.price || 0,
        })),
        storeId,
        storeName,
        totalAmount: total,
        deliveryAddress: `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`,
        scheduledFor,
        isRecurring: scheduleOrder && isRecurring ? isRecurring : undefined,
        recurringFrequency: scheduleOrder && isRecurring ? recurringFrequency : undefined,
      });
      
      await clearCart();
      
      if (scheduleOrder) {
        toast.success(isRecurring ? "Recurring order scheduled successfully!" : "Order scheduled successfully!");
      } else {
        toast.success("Order placed successfully!");
      }
      
      navigate("/orders");
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  if (!cartItems) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />
        <MobileBottomNav isAuthenticated={isAuthenticated} />
      </div>
    );
  }

  // Get minimum date (today) and time for scheduling
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const minTime = scheduledDate === today ? 
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` : 
    "00:00";

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => navigate("/stores")}>
              Browse Stores
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{item.product?.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.store?.name}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 font-bold">
                              <IndianRupee className="h-4 w-4" />
                              <span>{item.product?.price}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-semibold min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemove(item._id)}
                                className="h-8 w-8 p-0 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <h2 className="font-bold text-lg mb-4">Bill Details</h2>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        <span>{subtotal}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        <span>{deliveryFee}</span>
                      </div>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" />
                        <span>{total}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Complete your order details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Address Selection */}
            <div>
              <h3 className="font-semibold mb-3">Delivery Address</h3>
              <div className="space-y-2">
                {addresses?.map((address) => (
                  <Card
                    key={address._id}
                    className={`cursor-pointer transition-colors ${selectedAddress === address._id ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setSelectedAddress(address._id)}
                  >
                    <CardContent className="p-4">
                      <div className="font-semibold">{address.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {address.street}, {address.city}, {address.state} {address.zipCode}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAddAddress(true)}
                >
                  Add New Address
                </Button>
              </div>
            </div>

            {/* Order Scheduling */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Schedule Delivery</h3>
                </div>
                <Switch
                  checked={scheduleOrder}
                  onCheckedChange={setScheduleOrder}
                />
              </div>

              {scheduleOrder && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        min={today}
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        min={minTime}
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Make this a recurring order</span>
                    </div>
                    <Switch
                      checked={isRecurring}
                      onCheckedChange={setIsRecurring}
                    />
                  </div>

                  {isRecurring && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <Label>Frequency</Label>
                      <Select
                        value={recurringFrequency}
                        onValueChange={(value: "daily" | "weekly" | "monthly") => setRecurringFrequency(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={!selectedAddress}
            >
              {scheduleOrder ? (isRecurring ? "Schedule Recurring Order" : "Schedule Order") : "Place Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddAddress} onOpenChange={setShowAddAddress}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Label (Home, Work, etc.)</Label>
              <Input
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
              />
            </div>
            <div>
              <Label>Street Address</Label>
              <Input
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>ZIP Code</Label>
              <Input
                value={newAddress.zipCode}
                onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleAddAddress}>
              Save Address
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}