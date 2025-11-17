import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { ArrowLeft, Users, Clock, Plus, Search, ShoppingBag, CheckCircle, XCircle, MessageCircle, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function GroupBuying() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const apiAny: any = api;
  const groupOrders = useQuery(apiAny.groupOrders.list);
  const myGroupOrders = useQuery(apiAny.groupOrders.listByUser);
  
  const createGroupOrder = useMutation(apiAny.groupOrders.create);
  const joinGroupOrder = useMutation(apiAny.groupOrders.join);
  const leaveGroupOrder = useMutation(apiAny.groupOrders.leave);
  const markPaid = useMutation(apiAny.groupOrders.markPaid);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [maxParticipants, setMaxParticipants] = useState("5");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [expiryHours, setExpiryHours] = useState("48");
  const [description, setDescription] = useState("");

  const searchResults = useQuery(
    apiAny.products.search,
    searchQuery.trim() ? { term: searchQuery } : "skip"
  );

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

  const handleCreateGroup = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    const minPart = parseInt(maxParticipants);
    const discount = parseFloat(discountPercent);
    const expiry = parseInt(expiryHours);

    if (minPart < 2 || discount <= 0 || expiry <= 0) {
      toast.error("Please enter valid values");
      return;
    }

    try {
      const storeId = selectedProducts[0].storeId;
      await createGroupOrder({
        productIds: selectedProducts.map(p => p._id),
        storeId,
        maxParticipants: minPart,
        discountPercent: discount,
        expiresAt: Date.now() + (expiry * 60 * 60 * 1000),
        description: description || `Group order for ${selectedProducts.length} products`,
      });
      toast.success("Group order created!");
      resetCreateForm();
      setCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create group order");
    }
  };

  const resetCreateForm = () => {
    setStep(1);
    setSearchQuery("");
    setSelectedProducts([]);
    setMaxParticipants("5");
    setDiscountPercent("10");
    setExpiryHours("48");
    setDescription("");
  };

  const handleJoinGroup = async (groupOrderId: string) => {
    try {
      await joinGroupOrder({ groupOrderId: groupOrderId as any });
      toast.success("Joined group order!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join group");
    }
  };

  const handleLeaveGroup = async (groupOrderId: string) => {
    try {
      await leaveGroupOrder({ groupOrderId: groupOrderId as any });
      toast.success("Left group order");
    } catch (error: any) {
      toast.error(error.message || "Failed to leave group");
    }
  };

  const handleMarkPaid = async (groupOrderId: string) => {
    try {
      await markPaid({ groupOrderId: groupOrderId as any });
      toast.success("Payment status updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update payment");
    }
  };

  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const remaining = expiresAt - now;
    if (remaining <= 0) return "Expired";
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view group buying</p>
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
              <Users className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Group Buying</h1>
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
                  <DialogTitle>Create Group Order - Step {step} of 3</DialogTitle>
                </DialogHeader>
                
                {step === 1 && (
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Maximum Participants</Label>
                      <Input
                        type="number"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(e.target.value)}
                        className="mt-2"
                        min="2"
                      />
                    </div>
                    <div>
                      <Label>Group Discount (%)</Label>
                      <Input
                        type="number"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        className="mt-2"
                        min="1"
                        max="50"
                      />
                    </div>
                    <div>
                      <Label>Expires In (Hours)</Label>
                      <Input
                        type="number"
                        value={expiryHours}
                        onChange={(e) => setExpiryHours(e.target.value)}
                        className="mt-2"
                        min="1"
                      />
                    </div>
                    <div>
                      <Label>Description (Optional)</Label>
                      <Textarea
                        placeholder="Describe your group order..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="mt-2"
                      />
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
                        <CardTitle>Group Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Max Participants</Label>
                            <p className="font-semibold">{maxParticipants} people</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Group Discount</Label>
                            <p className="font-semibold text-green-600">{discountPercent}% OFF</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Expires In</Label>
                            <p className="font-semibold">{expiryHours} hours</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Products</Label>
                            <p className="font-semibold">{selectedProducts.length} items</p>
                          </div>
                        </div>
                        
                        {description && (
                          <div>
                            <Label className="text-muted-foreground">Description</Label>
                            <p className="text-sm">{description}</p>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div>
                          <Label className="text-muted-foreground">Products</Label>
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
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Original Total</span>
                            <span className="line-through">₹{calculateTotalPrice()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <Label className="text-lg">Group Price</Label>
                            <p className="text-2xl font-bold text-primary">
                              ₹{(calculateTotalPrice() * (1 - parseFloat(discountPercent) / 100)).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            You save ₹{(calculateTotalPrice() * parseFloat(discountPercent) / 100).toFixed(2)} per person!
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                        Back
                      </Button>
                      <Button onClick={handleCreateGroup} className="flex-1">
                        Create Group Order
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
        {myGroupOrders && myGroupOrders.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">My Group Orders</h2>
            <div className="space-y-3">
              {myGroupOrders.map((group: any, index: number) => (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                    setSelectedGroup(group);
                    setDetailDialogOpen(true);
                  }}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{group.storeName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {group.currentParticipants} / {group.maxParticipants} participants
                          </p>
                        </div>
                        <Badge variant={group.status === "open" ? "default" : "secondary"}>
                          {group.status}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2 mb-3 overflow-x-auto">
                        {group.products?.slice(0, 3).map((product: any) => (
                          <img
                            key={product._id}
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ))}
                        {group.products?.length > 3 && (
                          <div className="w-16 h-16 flex items-center justify-center bg-muted rounded">
                            <span className="text-xs font-semibold">+{group.products.length - 3}</span>
                          </div>
                        )}
                      </div>
                      
                      <Progress 
                        value={(group.currentParticipants / group.maxParticipants) * 100} 
                        className="mb-3"
                      />
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-green-600">
                          <span className="font-semibold">{group.discountPercent}% OFF</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{getTimeRemaining(group.expiresAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold mb-3">Active Group Orders</h2>
        {!groupOrders || groupOrders.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active group orders</p>
            <p className="text-sm text-muted-foreground mt-2">Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupOrders.map((group: any, index: number) => (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex gap-2">
                        {group.products?.slice(0, 2).map((product: any) => (
                          <img
                            key={product._id}
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{group.storeName}</h3>
                            <p className="text-xs text-muted-foreground">
                              {group.products?.length} products
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {group.discountPercent}% OFF
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{group.totalPrice}
                          </span>
                          <span className="font-bold text-green-600">
                            ₹{group.discountedPrice?.toFixed(2)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {group.currentParticipants} / {group.maxParticipants} joined
                        </p>
                        
                        <Progress 
                          value={(group.currentParticipants / group.maxParticipants) * 100} 
                          className="mb-3"
                        />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{getTimeRemaining(group.expiresAt)}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedGroup(group);
                                setDetailDialogOpen(true);
                              }}
                            >
                              Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleJoinGroup(group._id)}
                              disabled={group.hasJoined}
                            >
                              {group.hasJoined ? "Joined" : "Join"}
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
        )}
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Group Order Details</DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedGroup.storeName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Participants</Label>
                      <p className="font-semibold">
                        {selectedGroup.currentParticipants} / {selectedGroup.maxParticipants}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Discount</Label>
                      <p className="font-semibold text-green-600">{selectedGroup.discountPercent}% OFF</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge variant={selectedGroup.status === "open" ? "default" : "secondary"}>
                        {selectedGroup.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Time Left</Label>
                      <p className="font-semibold">{getTimeRemaining(selectedGroup.expiresAt)}</p>
                    </div>
                  </div>
                  
                  {selectedGroup.description && (
                    <div>
                      <Label className="text-muted-foreground">Description</Label>
                      <p className="text-sm">{selectedGroup.description}</p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-muted-foreground mb-2 block">Products</Label>
                    <div className="space-y-2">
                      {selectedGroup.products?.map((product: any) => (
                        <div key={product._id} className="flex items-center gap-3 p-2 bg-muted rounded">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">₹{product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-muted-foreground mb-2 block">
                      Participants ({selectedGroup.participants?.length})
                    </Label>
                    <div className="space-y-2">
                      {selectedGroup.participants?.map((participant: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{getInitials(participant.userName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{participant.userName}</p>
                              <p className="text-xs text-muted-foreground">
                                Joined {new Date(participant.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {participant.hasPaid ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original Price</span>
                      <span className="line-through">₹{selectedGroup.totalPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Label className="text-lg">Group Price</Label>
                      <p className="text-2xl font-bold text-primary">
                        ₹{selectedGroup.discountedPrice?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedGroup.hasJoined && (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleMarkPaid(selectedGroup._id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Paid
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/chat?groupOrderId=${selectedGroup._id}`)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Group Chat
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}