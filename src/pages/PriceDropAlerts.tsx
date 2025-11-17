import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { ArrowLeft, Bell, Trash2, Plus, TrendingDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function PriceDropAlerts() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const apiAny: any = api;
  const alerts = useQuery(apiAny.priceDropAlerts.listByUser);
  const removeAlert = useMutation(apiAny.priceDropAlerts.remove);
  const createAlert = useMutation(apiAny.priceDropAlerts.create);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [targetPrice, setTargetPrice] = useState("");

  const searchResults = useQuery(
    apiAny.products.search,
    searchQuery.trim() ? { query: searchQuery, limit: 10 } : "skip"
  );

  const handleRemove = async (alertId: string) => {
    try {
      await removeAlert({ alertId: alertId as any });
      toast.success("Alert removed");
    } catch (error) {
      toast.error("Failed to remove alert");
    }
  };

  const handleCreateAlert = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    const price = parseFloat(targetPrice);
    if (!price || price <= 0 || price >= selectedProduct.price) {
      toast.error("Target price must be below current price");
      return;
    }
    try {
      await createAlert({
        productId: selectedProduct._id,
        targetPrice: price,
      });
      toast.success("Price alert created!");
      setCreateDialogOpen(false);
      setSearchQuery("");
      setSelectedProduct(null);
      setTargetPrice("");
    } catch (error) {
      toast.error("Failed to create alert");
    }
  };

  const getPriceDifference = (currentPrice: number, targetPrice: number) => {
    const diff = currentPrice - targetPrice;
    const percent = ((diff / currentPrice) * 100).toFixed(0);
    return { diff: diff.toFixed(2), percent };
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view price alerts</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Bell className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Price Drop Alerts</h1>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Price Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Search Product</Label>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {searchResults && searchResults.length > 0 && !selectedProduct && (
                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
                      {searchResults.map((product: any) => (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                          onClick={() => {
                            setSelectedProduct(product);
                            setSearchQuery("");
                          }}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-sm text-muted-foreground">₹{product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedProduct && (
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{selectedProduct.name}</p>
                            <p className="text-lg font-bold text-primary">₹{selectedProduct.price}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProduct(null)}
                          >
                            Change
                          </Button>
                        </div>
                        <div>
                          <Label>Target Price (₹)</Label>
                          <Input
                            type="number"
                            placeholder="Enter target price"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            You'll be notified when price drops to or below ₹{targetPrice || "0"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={handleCreateAlert}
                    className="w-full"
                    disabled={!selectedProduct || !targetPrice}
                  >
                    Create Alert
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No price alerts set</p>
            <p className="text-sm text-muted-foreground mt-2">Create alerts to track price drops!</p>
            <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Alert
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert: any, index: number) => {
              const priceDiff = getPriceDifference(alert.product?.price || 0, alert.targetPrice);
              const isPriceReached = (alert.product?.price || 0) <= alert.targetPrice;

              return (
                <motion.div
                  key={alert._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={isPriceReached ? "border-green-500 border-2" : ""}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {alert.product?.image && (
                          <img
                            src={alert.product.image}
                            alt={alert.product.name}
                            className="w-20 h-20 object-cover rounded cursor-pointer"
                            onClick={() => navigate(`/product/${alert.productId}`)}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3
                              className="font-semibold cursor-pointer hover:text-primary"
                              onClick={() => navigate(`/product/${alert.productId}`)}
                            >
                              {alert.product?.name || "Product"}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(alert._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-muted-foreground">Current:</span>
                                <span className="font-semibold">₹{alert.product?.price}</span>
                              </div>
                              <TrendingDown className="h-4 w-4 text-green-600" />
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-muted-foreground">Target:</span>
                                <span className="font-semibold text-green-600">₹{alert.targetPrice}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {isPriceReached ? (
                                <Badge className="bg-green-600">
                                  🎉 Target Reached!
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  ₹{priceDiff.diff} ({priceDiff.percent}%) to go
                                </Badge>
                              )}
                              {alert.isNotified && (
                                <Badge variant="outline">Notified</Badge>
                              )}
                            </div>

                            {isPriceReached && (
                              <Button
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => navigate(`/product/${alert.productId}`)}
                              >
                                View Product
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}