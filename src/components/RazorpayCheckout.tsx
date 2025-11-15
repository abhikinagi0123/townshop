import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface RazorpayCheckoutProps {
  amount: number;
  orderId: Id<"orders">;
  userId: string;
  onSuccess: () => void;
  onFailure: () => void;
  children: React.ReactNode;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayCheckout({
  amount,
  orderId,
  userId,
  onSuccess,
  onFailure,
  children,
}: RazorpayCheckoutProps) {
  const createOrder = useAction(api.razorpay.createPaymentOrder);
  const verifyPayment = useAction(api.razorpay.verifyPaymentSignature);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      const order = await createOrder({
        amount,
        orderId: orderId as string,
        userId,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "TownShop",
        description: "Order Payment",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const result = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId,
            });

            if (result.verified) {
              toast.success("Payment successful!");
              onSuccess();
            } else {
              toast.error("Payment verification failed");
              onFailure();
            }
          } catch (error) {
            toast.error("Payment verification failed");
            onFailure();
          }
        },
        prefill: {
          contact: "",
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            onFailure();
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Failed to initiate payment");
      onFailure();
    }
  };

  return <div onClick={handlePayment}>{children}</div>;
}
