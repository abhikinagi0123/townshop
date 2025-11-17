import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { ArrowLeft, Package, Plus, Pause, Play, Trash2, Search, Calendar, Edit, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export default function SubscriptionBoxes() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const apiAny: any = api;
  const subscriptions = useQuery(apiAny.subscriptionBoxes.listByUser);
  const pauseSubscription = useMutation(apiAny.subscriptionBoxes.pause);
  const resumeSubscription = useMutation(apiAny.subscriptionBoxes.resume);
  const cancelSubscription = useMutation(apiAny.subscriptionBoxes.cancel);
  const createSubscription = useMutation(apiAny.subscriptionBoxes.create);
  const updateFrequency = useMutation(apiAny.subscriptionBoxes.updateFrequency);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  
  // Create subscription state
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const searchResults = useQuery(
    apiAny.products.search,
    searchQuery.trim() ? { term: searchQuery } : "skip"
  );

  const handlePause = async (subId: string) => {
    try {
      await pauseSubscription({ subscriptionId: subId as any });
      toast.success("Subscription paused");
    } catch (error) {
      toast.error("Failed to pause subscription");
    }
  };

  const handleResume = async (subId: string) => {
    try {
      await resumeSubscription({ subscriptionId: subId as any });
      toast.success("Subscription resumed");
    } catch (error) {
      toast.error("Failed to resume subscription");
    }
  };

  const handleCancel = async (subId: string) => {
    try {
      await cancelSubscription({ subscriptionId: subId as any });
      toast.success("Subscription cancelled");
    } catch (error) {
      toast.error("Failed to cancel subscription");
    }
  };

  const handleToggleProduct = (product: any) => {
    const exists = selectedProducts.find(p => p._id === product._id);
    if (exists) {
      setSelectedProducts(selectedProducts.filter(p => p._id !== product._id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const calculateTotalPrice = () => {
    return selectedProducts.reduce((sum, p) => sum + p.price, 0);
  };

  const handleCreateSubscription = async () => {
    if (!name.trim()) {
      toast.error("Please enter a subscription name");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    try {
      await createSubscription({
        name,
        description: description || `${frequency} delivery of ${selectedProducts.length} products`,
        price: calculateTotalPrice(),
        frequency,
        productIds: selectedProducts.map(p => p._id),
      });
      toast.success("Subscription created successfully!");
      setCreateDialogOpen(false);
      resetCreateForm();
    } catch (error) {
      toast.error("Failed to create subscription");
    }
  };

  const handleUpdateFrequency = async (subId: string, newFrequency: "weekly" | "biweekly" | "monthly") => {
    try {
      await updateFrequency({ subscriptionId: subId as any, frequency: newFrequency });
      toast.success("Delivery schedule updated");
      setEditDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update schedule");
    }
  };

  const resetCreateForm = () => {
    setStep(1);
    setName("");
    setDescription("");
    setFrequency("weekly");
    setSearchQuery("");
    setSelectedProducts([]);
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case "weekly": return "Every Week";
      case "biweekly": return "Every 2 Weeks";
      case "monthly": return "Every Month";
      default: return freq;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view subscriptions</p>
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
              <Package className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Subscription Boxes</h1>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={(open) => {
              setCreateDialogOpen(open);
              if (!open) resetCreateForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Subscription Box - Step {step} of 3</DialogTitle>
                </DialogHeader>
                
                {step === 1 && (
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Subscription Name</Label>
                      <Input
                        placeholder="e.g., Weekly Groceries"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Description (Optional)</Label>
                      <Textarea
                        placeholder="Describe your subscription box..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Delivery Frequency</Label>
                      <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Every Week</SelectItem>
                          <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                          <SelectItem value="monthly">Every Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => setStep(2)} className="w-full">
                      Next: Select Products
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Search Products</Label>
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

                    {selectedProducts.length > 0 && (
                      <div>
                        <Label>Selected Products ({selectedProducts.length})</Label>
                        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                          {selectedProducts.map((product) => (
                            <div key={product._id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex items-center gap-2">
                                <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                                <div>
                                  <p className="text-sm font-medium">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">₹{product.price}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleProduct(product)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults && searchResults.length > 0 && (
                      <div>
                        <Label>Search Results</Label>
                        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                          {searchResults.map((product: any) => {
                            const isSelected = selectedProducts.find(p => p._id === product._id);
                            return (
                              <div
                                key={product._id}
                                className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                                  isSelected ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'
                                }`}
                                onClick={() => handleToggleProduct(product)}
                              >
                                <Checkbox checked={!!isSelected} />
                                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{product.name}</p>
                                  <p className="text-sm text-muted-foreground">₹{product.price}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                        Back
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        className="flex-1"
                        disabled={selectedProducts.length === 0}
                      >
                        Next: Review
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 py-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Subscription Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-muted-foreground">Name</Label>
                          <p className="font-semibold">{name}</p>
                        </div>
                        {description && (
                          <div>
                            <Label className="text-muted-foreground">Description</Label>
                            <p className="text-sm">{description}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-muted-foreground">Frequency</Label>
                          <p className="font-semibold">{getFrequencyLabel(frequency)}</p>
                        </div>
                        <Separator />
                        <div>
                          <Label className="text-muted-foreground">Products ({selectedProducts.length})</Label>
                          <div className="mt-2 space-y-2">
                            {selectedProducts.map((product) => (
                              <div key={product._id} className="flex items-center gap-2">
                                <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">₹{product.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <Label className="text-lg">Total per delivery</Label>
                          <p className="text-2xl font-bold text-primary">₹{calculateTotalPrice()}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                        Back
                      </Button>
                      <Button onClick={handleCreateSubscription} className="flex-1">
                        Create Subscription
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!subscriptions || subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active subscriptions</p>
            <p className="text-sm text-muted-foreground mt-2">Create recurring deliveries for your favorite products!</p>
            <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub: any, index: number) => (
              <motion.div
                key={sub._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{sub.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {sub.products?.length || 0} items • {getFrequencyLabel(sub.frequency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Next delivery: {new Date(sub.nextDelivery).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                        {sub.status}
                      </Badge>
                    </div>

                    {sub.products && sub.products.length > 0 && (
                      <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                        {sub.products.slice(0, 4).map((product: any) => (
                          <img
                            key={product._id}
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ))}
                        {sub.products.length > 4 && (
                          <div className="w-16 h-16 flex items-center justify-center bg-muted rounded border">
                            <span className="text-xs font-semibold">+{sub.products.length - 4}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Total per delivery</span>
                      <span className="font-bold text-lg">₹{sub.price}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {sub.status === "active" ? (
                        <Button size="sm" variant="outline" onClick={() => handlePause(sub._id)}>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      ) : sub.status === "paused" ? (
                        <Button size="sm" variant="outline" onClick={() => handleResume(sub._id)}>
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSubscription(sub);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleCancel(sub._id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Delivery Schedule</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Current Frequency: {getFrequencyLabel(selectedSubscription.frequency)}</Label>
              </div>
              <div>
                <Label>New Frequency</Label>
                <Select
                  defaultValue={selectedSubscription.frequency}
                  onValueChange={(v: any) => handleUpdateFrequency(selectedSubscription._id, v)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Every Week</SelectItem>
                    <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                    <SelectItem value="monthly">Every Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}