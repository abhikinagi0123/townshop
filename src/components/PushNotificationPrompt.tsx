import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPushNotifications,
  isPushNotificationSupported,
} from "@/lib/pushNotifications";
import { toast } from "sonner";

export function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const apiAny: any = api;
  const subscribeToPush = useMutation(apiAny.pushNotifications.subscribeToPush);

  useEffect(() => {
    // Check if we should show the prompt
    const hasAsked = localStorage.getItem("push-notification-asked");
    const isSupported = isPushNotificationSupported();
    const permission = Notification.permission;

    if (!hasAsked && isSupported && permission === "default") {
      // Show prompt after 5 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const permission = await requestNotificationPermission();
      
      if (permission === "granted") {
        const registration = await registerServiceWorker();
        
        if (registration) {
          const subscription = await subscribeToPushNotifications(registration);
          
          if (subscription) {
            const subscriptionJSON = subscription.toJSON();
            await subscribeToPush({
              endpoint: subscription.endpoint,
              p256dh: subscriptionJSON.keys?.p256dh || "",
              auth: subscriptionJSON.keys?.auth || "",
              userAgent: navigator.userAgent,
            });
            
            toast.success("Push notifications enabled!");
          }
        }
      } else {
        toast.error("Notification permission denied");
      }
    } catch (error) {
      console.error("Failed to enable push notifications:", error);
      toast.error("Failed to enable notifications");
    } finally {
      setIsLoading(false);
      setShowPrompt(false);
      localStorage.setItem("push-notification-asked", "true");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("push-notification-asked", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <Card className="shadow-lg border-2">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Stay Updated!</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get real-time updates on your orders, delivery status, and exclusive offers.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleEnable}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? "Enabling..." : "Enable Notifications"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismiss}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}