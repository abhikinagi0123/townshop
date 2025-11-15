import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Trash2, IndianRupee, ShoppingBag, Calendar, Clock, CreditCard, Smartphone, Wallet, Award } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const cartItems = useQuery(api.cart.get);
  const addresses = useQuery(api.addresses.list);
  const savedPaymentMethods = useQuery(api.payments.listSavedPaymentMethods);
  
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.removeItem);
  const clearCart = useMutation(api.cart.clear);
  const createOrder = useMutation(api.orders.create);
  const createAddress = useMutation(api.addresses.create);
  const createPayment = useMutation(api.payments.create);
  const addSavedPaymentMethod = useMutation(api.payments.addSavedPaymentMethod);

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

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "wallet" | "cod" | "app_wallet">("cod");
  const [cardNumber, setCardNumber] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [upiId, setUpiId] = useState("");
  const [walletProvider, setWalletProvider] = useState("");
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);

  // Loyalty points redemption states
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const loyaltyData = useQuery(api.loyalty.getPoints);
  const walletData = useQuery(api.wallet.getBalance);
  const redeemPoints = useMutation(api.loyalty.redeemPoints);
  const recordRedemption = useMutation(api.loyalty.recordRedemption);
  const deductWalletMoney = useMutation(api.wallet.deductMoney);
  
  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  
  // Tip and notes states
  const [deliveryTip, setDeliveryTip] = useState(0);
  const [orderNotes, setOrderNotes] = useState("");
  
  // Move to favorites mutation
  const moveToFavorites = useMutation(api.cart.moveToFavorites);

  const subtotal = cartItems?.reduce((sum, item) => 
    sum + (item.product?.price || 0) * item.quantity, 0
  ) || 0;
  
  const validateCoupon = useQuery(
    api.offers.validateCoupon,
    couponCode && cartItems && cartItems.length > 0
      ? { code: couponCode, storeId: cartItems[0].product?.storeId, orderAmount: subtotal }
      : "skip"
  );
  const deliveryFee = subtotal > 0 ? 40 : 0;
  
  // Calculate loyalty discount
  const maxRedeemablePoints = loyaltyData?.points || 0;
  const maxDiscount = Math.floor(maxRedeemablePoints / 100);
  const loyaltyDiscount = usePoints ? Math.min(Math.floor(pointsToRedeem / 100), subtotal + deliveryFee) : 0;
  
  // Calculate coupon discount
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  
  // Calculate wallet balance available
  const walletBalance = walletData?.balance || 0;
  
  const total = Math.max(0, subtotal + deliveryFee + deliveryTip - loyaltyDiscount - couponDiscount);

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
  
  const handleSaveForLater = async (cartItemId: string) => {
    try {
      await moveToFavorites({ cartItemId: cartItemId as any });
      toast.success("Item moved to favorites");
    } catch (error) {
      toast.error("Failed to save for later");
    }
  };
  
  const handleApplyCoupon = () => {
    if (!validateCoupon || typeof validateCoupon === "string") return;
    
    if (validateCoupon.valid && validateCoupon.offer) {
      setAppliedCoupon({
        code: couponCode,
        discountAmount: validateCoupon.discountAmount,
      });
      toast.success(validateCoupon.message);
      setCouponCode("");
    } else {
      toast.error(validateCoupon.message);
    }
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
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

    // Validate payment method details
    if (paymentMethod === "card" && !cardNumber) {
      toast.error("Please enter card details");
      return;
    }
    if (paymentMethod === "upi" && !upiId) {
      toast.error("Please enter UPI ID");
      return;
    }
    if (paymentMethod === "wallet" && !walletProvider) {
      toast.error("Please select wallet provider");
      return;
    }
    if (paymentMethod === "app_wallet" && walletBalance < total) {
      toast.error("Insufficient wallet balance");
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
      // Redeem points if applicable
      let actualPointsRedeemed = 0;
      if (usePoints && pointsToRedeem > 0) {
        try {
          const redemptionResult = await redeemPoints({ points: pointsToRedeem });
          actualPointsRedeemed = pointsToRedeem;
        } catch (error: any) {
          toast.error(error.message || "Failed to redeem points");
          return;
        }
      }

      const orderId = await createOrder({
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
        deliveryTip: deliveryTip > 0 ? deliveryTip : undefined,
        orderNotes: orderNotes.trim() || undefined,
        appliedCoupon: appliedCoupon || undefined,
      });

      // Process payment
      if (paymentMethod === "app_wallet") {
        await deductWalletMoney({ amount: total, orderId });
      }
      
      const last4 = paymentMethod === "card" ? cardNumber.slice(-4) : undefined;
      
      // Map payment method for backend
      let backendMethod: "card" | "upi" | "wallet" | "cod";
      if (paymentMethod === "app_wallet") {
        backendMethod = "wallet";
      } else if (paymentMethod === "card") {
        backendMethod = "card";
      } else if (paymentMethod === "upi") {
        backendMethod = "upi";
      } else if (paymentMethod === "wallet") {
        backendMethod = "wallet";
      } else {
        backendMethod = "cod";
      }
      
      await createPayment({
        orderId,
        amount: total,
        method: backendMethod,
        cardLast4: last4,
        upiId: paymentMethod === "upi" ? upiId : undefined,
      });

      // Save payment method if requested
      if (savePaymentMethod && paymentMethod !== "cod" && paymentMethod !== "app_wallet") {
        await addSavedPaymentMethod({
          type: paymentMethod,
          cardLast4: last4,
          cardBrand: paymentMethod === "card" ? "Visa" : undefined,
          upiId: paymentMethod === "upi" ? upiId : undefined,
          walletProvider: paymentMethod === "wallet" ? walletProvider : undefined,
        });
      }
      
      // Record redemption transaction
      if (actualPointsRedeemed > 0) {
        await recordRedemption({
          points: actualPointsRedeemed,
          orderId,
          discountAmount: loyaltyDiscount,
        });
      }

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
                            <div className="flex flex-col gap-2">
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
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveForLater(item._id)}
                                className="text-xs"
                              >
                                Save for Later
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
                    {deliveryTip > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Delivery Tip</span>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          <span>{deliveryTip}</span>
                        </div>
                      </div>
                    )}
                    {loyaltyDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Loyalty Discount</span>
                        <div className="flex items-center gap-1">
                          <span>-</span>
                          <IndianRupee className="h-3 w-3" />
                          <span>{loyaltyDiscount}</span>
                        </div>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Coupon Discount ({appliedCoupon?.code})</span>
                        <div className="flex items-center gap-1">
                          <span>-</span>
                          <IndianRupee className="h-3 w-3" />
                          <span>{couponDiscount}</span>
                        </div>
                      </div>
                    )}
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

            {/* Payment Method Selection */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Method
              </h3>
              
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="space-y-3">
                  {/* Saved Payment Methods */}
                  {savedPaymentMethods && savedPaymentMethods.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Saved Methods</p>
                      {savedPaymentMethods.map((method) => (
                        <Card key={method._id} className="mb-2 cursor-pointer hover:border-primary">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value={method.type} id={method._id} />
                              <Label htmlFor={method._id} className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  {method.type === "card" && <CreditCard className="h-4 w-4" />}
                                  {method.type === "upi" && <Smartphone className="h-4 w-4" />}
                                  {method.type === "wallet" && <Wallet className="h-4 w-4" />}
                                  <span className="text-sm">
                                    {method.type === "card" && `${method.cardBrand} •••• ${method.cardLast4}`}
                                    {method.type === "upi" && method.upiId}
                                    {method.type === "wallet" && method.walletProvider}
                                  </span>
                                </div>
                              </Label>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Separator className="my-3" />
                    </div>
                  )}

                  {/* Card Payment */}
                  <Card className={paymentMethod === "card" ? "border-primary" : ""}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span>Credit/Debit Card</span>
                          </div>
                        </Label>
                      </div>
                      {paymentMethod === "card" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 space-y-2"
                        >
                          <Input
                            placeholder="Card Number"
                            value={cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 16);
                              setCardNumber(value);
                              setCardLast4(value.slice(-4));
                            }}
                            maxLength={16}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="MM/YY" maxLength={5} />
                            <Input placeholder="CVV" maxLength={3} type="password" />
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>

                  {/* UPI Payment */}
                  <Card className={paymentMethod === "upi" ? "border-primary" : ""}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            <span>UPI</span>
                          </div>
                        </Label>
                      </div>
                      {paymentMethod === "upi" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3"
                        >
                          <Input
                            placeholder="UPI ID (e.g., user@paytm)"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                          />
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Wallet Payment */}
                  <Card className={paymentMethod === "wallet" ? "border-primary" : ""}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="wallet" id="wallet" />
                        <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            <span>Wallet</span>
                          </div>
                        </Label>
                      </div>
                      {paymentMethod === "wallet" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3"
                        >
                          <Select value={walletProvider} onValueChange={setWalletProvider}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Wallet" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paytm">Paytm</SelectItem>
                              <SelectItem value="phonepe">PhonePe</SelectItem>
                              <SelectItem value="googlepay">Google Pay</SelectItem>
                              <SelectItem value="amazonpay">Amazon Pay</SelectItem>
                            </SelectContent>
                          </Select>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>

                  {/* App Wallet */}
                  <Card className={paymentMethod === "app_wallet" ? "border-primary" : ""}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="app_wallet" id="app_wallet" />
                        <Label htmlFor="app_wallet" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Wallet className="h-4 w-4" />
                              <span>App Wallet</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              Balance: ₹{walletBalance.toFixed(2)}
                            </span>
                          </div>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cash on Delivery */}
                  <Card className={paymentMethod === "cod" ? "border-primary" : ""}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4" />
                            <span>Cash on Delivery</span>
                          </div>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </RadioGroup>

              {/* Save Payment Method Option */}
              {paymentMethod !== "cod" && (
                <div className="flex items-center justify-between mt-3 p-3 bg-muted rounded-lg">
                  <span className="text-sm">Save this payment method</span>
                  <Switch
                    checked={savePaymentMethod}
                    onCheckedChange={setSavePaymentMethod}
                  />
                </div>
              )}
            </div>

            {/* Apply Coupon Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">Apply Coupon</h3>
              {appliedCoupon ? (
                <Card className="border-green-500 bg-green-50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-700">{appliedCoupon.code}</p>
                        <p className="text-sm text-green-600">
                          You saved ₹{appliedCoupon.discountAmount}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRemoveCoupon}
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>

            {/* Delivery Tip Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">Tip Your Delivery Partner</h3>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[0, 10, 20, 30].map((tip) => (
                  <Button
                    key={tip}
                    variant={deliveryTip === tip ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDeliveryTip(tip)}
                  >
                    {tip === 0 ? "No Tip" : `₹${tip}`}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                placeholder="Custom tip amount"
                value={deliveryTip || ""}
                onChange={(e) => setDeliveryTip(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>

            {/* Order Notes Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">Special Instructions</h3>
              <textarea
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
                placeholder="Add delivery instructions, preferences, etc."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {orderNotes.length}/200 characters
              </p>
            </div>

            {/* Loyalty Points Redemption */}
            {loyaltyData && loyaltyData.points >= 100 && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">Use Loyalty Points</h3>
                      <p className="text-xs text-muted-foreground">
                        You have {loyaltyData.points} points (₹{Math.floor(loyaltyData.points / 100)} max discount)
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={usePoints}
                    onCheckedChange={(checked) => {
                      setUsePoints(checked);
                      if (!checked) setPointsToRedeem(0);
                    }}
                  />
                </div>

                {usePoints && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                  >
                    <div>
                      <Label>Points to Redeem (100 points = ₹1)</Label>
                      <Input
                        type="number"
                        min={100}
                        max={Math.min(loyaltyData.points, (subtotal + deliveryFee) * 100)}
                        step={100}
                        value={pointsToRedeem}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          const maxAllowed = Math.min(loyaltyData.points, (subtotal + deliveryFee) * 100);
                          setPointsToRedeem(Math.min(value, maxAllowed));
                        }}
                        placeholder="Enter points (min 100)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Discount: ₹{Math.floor(pointsToRedeem / 100)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPointsToRedeem(Math.min(500, loyaltyData.points, (subtotal + deliveryFee) * 100))}
                      >
                        Use 500
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPointsToRedeem(Math.min(1000, loyaltyData.points, (subtotal + deliveryFee) * 100))}
                      >
                        Use 1000
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPointsToRedeem(Math.min(loyaltyData.points, (subtotal + deliveryFee) * 100))}
                      >
                        Use Max
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Order Scheduling */}
            <div className="border-t pt-4 mt-4">
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