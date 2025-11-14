import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, Trash2, IndianRupee, ShoppingBag, Home, Search, Star, User } from "lucide-react";
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

    const address = addresses?.find(a => a._id === selectedAddress);
    if (!address) return;

    const storeId = cartItems[0].product?.storeId;
    const storeName = cartItems[0].store?.name;
    
    if (!storeId || !storeName) {
      toast.error("Invalid cart data");
      return;
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
      });
      
      await clearCart();
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  if (!cartItems) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                <span className="font-bold text-lg tracking-tight">Cart</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
              <span className="font-bold text-lg tracking-tight">Your Cart</span>
            </div>
          </div>
        </div>
      </div>
      
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Delivery Address</DialogTitle>
            <DialogDescription>
              Choose where you want your order delivered
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {addresses?.map((address) => (
              <Card
                key={address._id}
                className={`cursor-pointer ${selectedAddress === address._id ? 'border-primary' : ''}`}
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
            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={!selectedAddress}
            >
              Place Order
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

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-full rounded-none flex-1"
            onClick={() => navigate("/")}
          >
            <Home className="h-5 w-5" />
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
            onClick={() => isAuthenticated ? navigate("/profile") : navigate("/auth")}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}