import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { ArrowLeft, Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PriceDropAlerts() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const apiAny: any = api;
  const alerts = useQuery(apiAny.priceDropAlerts.listByUser);
  const removeAlert = useMutation(apiAny.priceDropAlerts.remove);

  const handleRemove = async (alertId: string) => {
    try {
      await removeAlert({ alertId: alertId as any });
      toast.success("Alert removed");
    } catch (error) {
      toast.error("Failed to remove alert");
    }
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Bell className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">Price Drop Alerts</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No price alerts set</p>
            <p className="text-sm text-muted-foreground mt-2">Set alerts on product pages!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert: any, index: number) => (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {alert.product?.image && (
                        <img
                          src={alert.product.image}
                          alt={alert.product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{alert.product?.name || "Product"}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground">Current: ₹{alert.product?.price}</span>
                          <span className="text-sm">→</span>
                          <span className="text-sm font-semibold text-green-600">Target: ₹{alert.targetPrice}</span>
                        </div>
                        {alert.isNotified && (
                          <Badge variant="secondary" className="mt-2">Notified</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(alert._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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
