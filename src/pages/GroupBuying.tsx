import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { ArrowLeft, Users, Clock, IndianRupee, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function GroupBuying() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const apiAny: any = api;
  const groupOrders = useQuery(apiAny.groupOrders.listActive);
  const myGroupOrders = useQuery(apiAny.groupOrders.listByUser);
  
  const createGroupOrder = useMutation(apiAny.groupOrders.create);
  const joinGroupOrder = useMutation(apiAny.groupOrders.join);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [minParticipants, setMinParticipants] = useState("5");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [expiryHours, setExpiryHours] = useState("24");

  const handleCreateGroup = async () => {
    if (!productId.trim()) {
      toast.error("Please enter a product ID");
      return;
    }

    const minPart = parseInt(minParticipants);
    const discount = parseFloat(discountPercent);
    const expiry = parseInt(expiryHours);

    if (minPart < 2 || discount <= 0 || expiry <= 0) {
      toast.error("Please enter valid values");
      return;
    }

    try {
      await createGroupOrder({
        productId: productId as Id<"products">,
        minParticipants: minPart,
        discountPercent: discount,
        expiryHours: expiry,
      });
      toast.success("Group order created!");
      setProductId("");
      setMinParticipants("5");
      setDiscountPercent("10");
      setExpiryHours("24");
      setCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create group order");
    }
  };

  const handleJoinGroup = async (groupOrderId: string) => {
    try {
      await joinGroupOrder({ groupOrderId: groupOrderId as any });
      toast.success("Joined group order!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join group");
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
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Group Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Product ID</Label>
                    <Input
                      placeholder="Enter product ID"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Minimum Participants</Label>
                    <Input
                      type="number"
                      value={minParticipants}
                      onChange={(e) => setMinParticipants(e.target.value)}
                      className="mt-2"
                      min="2"
                    />
                  </div>
                  <div>
                    <Label>Discount Percentage</Label>
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
                  <Button onClick={handleCreateGroup} className="w-full">
                    Create Group Order
                  </Button>
                </div>
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
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{group.productName || "Product"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {group.currentParticipants} / {group.minParticipants} participants
                          </p>
                        </div>
                        <Badge variant={group.status === "active" ? "default" : "secondary"}>
                          {group.status}
                        </Badge>
                      </div>
                      <Progress 
                        value={(group.currentParticipants / group.minParticipants) * 100} 
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
                      {group.product?.image && (
                        <img
                          src={group.product.image}
                          alt={group.product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{group.product?.name || "Product"}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{group.product?.price}
                          </span>
                          <span className="font-bold text-green-600">
                            ₹{(group.product?.price * (1 - group.discountPercent / 100)).toFixed(2)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {group.discountPercent}% OFF
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {group.currentParticipants} / {group.minParticipants} joined
                        </p>
                        <Progress 
                          value={(group.currentParticipants / group.minParticipants) * 100} 
                          className="mb-3"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{getTimeRemaining(group.expiresAt)}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleJoinGroup(group._id)}
                            disabled={group.hasJoined}
                          >
                            {group.hasJoined ? "Joined" : "Join Group"}
                          </Button>
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

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}
