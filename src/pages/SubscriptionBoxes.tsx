import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { ArrowLeft, Package, Plus, Pause, Play, Trash2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function SubscriptionBoxes() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const apiAny: any = api;
  const subscriptions = useQuery(apiAny.subscriptionBoxes.listByUser);
  const pauseSubscription = useMutation(apiAny.subscriptionBoxes.pause);
  const resumeSubscription = useMutation(apiAny.subscriptionBoxes.resume);
  const cancelSubscription = useMutation(apiAny.subscriptionBoxes.cancel);

  const [dialogOpen, setDialogOpen] = useState(false);

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
            <Button size="sm" onClick={() => toast.info("Browse products to create subscriptions")}>
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!subscriptions || subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active subscriptions</p>
            <p className="text-sm text-muted-foreground mt-2">Create recurring deliveries for your favorite products!</p>
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
                      <div>
                        <h3 className="font-semibold">Subscription Box</h3>
                        <p className="text-sm text-muted-foreground">
                          {sub.productIds?.length || 0} items • Every {sub.frequency}
                        </p>
                      </div>
                      <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
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

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}
