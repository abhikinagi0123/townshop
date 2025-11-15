import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Clock, Store, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Id } from "@/convex/_generated/dataModel";

export default function GroupOrders() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(5);

  const groupOrders = useQuery(api.groupOrders.list, {});
  const myGroupOrders = useQuery(api.groupOrders.listByUser);
  const stores = useQuery(api.stores.list, {});

  const createGroupOrder = useMutation(api.groupOrders.create);
  const joinGroupOrder = useMutation(api.groupOrders.join);

  const handleCreate = async () => {
    if (!storeId) {
      toast.error("Please select a store");
      return;
    }

    try {
      // Set expiration to 7 days from now
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      
      await createGroupOrder({
        storeId: storeId as Id<"stores">,
        productIds: [], // Empty initially, users add products when ordering
        maxParticipants,
        expiresAt,
        description: description || undefined,
      });
      toast.success("Group order created!");
      setShowCreateDialog(false);
      setStoreId("");
      setDescription("");
      setMaxParticipants(5);
    } catch (error: any) {
      toast.error(error.message || "Failed to create group order");
    }
  };

  const handleJoin = async (groupOrderId: Id<"groupOrders">) => {
    try {
      await joinGroupOrder({ groupOrderId });
      toast.success("Joined group order!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join group order");
    }
  };

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Group Orders</h1>
                <p className="text-muted-foreground">Order together, save together</p>
              </div>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Group Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Select Store</Label>
                    <select
                      className="w-full mt-2 p-2 border rounded-md"
                      value={storeId}
                      onChange={(e) => setStoreId(e.target.value)}
                    >
                      <option value="">Choose a store...</option>
                      {stores?.stores?.map((store) => (
                        <option key={store._id} value={store._id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Max Participants</Label>
                    <Input
                      type="number"
                      min={2}
                      max={20}
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Description (Optional)</Label>
                    <Textarea
                      placeholder="e.g., Ordering groceries for the week..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleCreate} className="w-full">
                    Create Group Order
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* My Group Orders */}
        {myGroupOrders && myGroupOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold mb-4">My Group Orders</h2>
            <div className="space-y-4">
              {myGroupOrders.map((order: any) => (
                <Card key={order._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-primary" />
                        <span>{order.storeName}</span>
                      </div>
                      <Badge variant={order.status === "open" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {order.description && (
                      <p className="text-sm text-muted-foreground mb-3">{order.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {order.participants.length}/{order.maxParticipants}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Expires {new Date(order.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/store/${order.storeId}`)}
                      >
                        View Store
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Available Group Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-4">Available Group Orders</h2>
          {groupOrders && groupOrders.length > 0 ? (
            <div className="space-y-4">
              {groupOrders.map((order: any) => {
                const isCreator = order.creatorId === user?._id;
                const isMember = order.participants.some((p: any) => p.userId === user?._id);
                const isFull = order.participants.length >= order.maxParticipants;

                return (
                  <Card key={order._id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Store className="h-5 w-5 text-primary" />
                          <span>{order.storeName}</span>
                        </div>
                        <Badge variant={order.status === "open" ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Created by:</span>
                          <span className="text-muted-foreground">{order.creatorName}</span>
                        </div>

                        {order.description && (
                          <p className="text-sm text-muted-foreground">{order.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>
                                {order.participants.length}/{order.maxParticipants} members
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                Expires {new Date(order.expiresAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {!isMember && !isCreator && order.status === "open" && (
                            <Button
                              size="sm"
                              onClick={() => handleJoin(order._id)}
                              disabled={isFull}
                            >
                              {isFull ? "Full" : "Join Group"}
                            </Button>
                          )}

                          {(isMember || isCreator) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/store/${order.storeId}`)}
                            >
                              View Store
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No group orders available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create one to start ordering with others!
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}