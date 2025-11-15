import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
// Type assertion to avoid deep type instantiation with React 19
const apiAny: any = api;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

interface WalletRechargeProps {
  userId: string;
  onSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function WalletRecharge({ userId, onSuccess }: WalletRechargeProps) {
  const [amount, setAmount] = useState("");
  const createOrder = useAction(apiAny.razorpay.createWalletRechargeOrder);
  const verifyRecharge = useAction(apiAny.razorpay.verifyWalletRecharge);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRecharge = async () => {
    const rechargeAmount = parseFloat(amount);
    if (!rechargeAmount || rechargeAmount < 10) {
      toast.error("Minimum recharge amount is ₹10");
      return;
    }

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      const order = await createOrder({
        amount: rechargeAmount,
        userId,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "TownShop",
        description: "Wallet Recharge",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const result = await verifyRecharge({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount: rechargeAmount,
            });

            if (result.verified) {
              toast.success(`₹${rechargeAmount} added to wallet!`);
              setAmount("");
              onSuccess();
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          contact: "",
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Failed to initiate payment");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Recharge Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="number"
            placeholder="Enter amount (min ₹10)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={10}
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[100, 500, 1000, 2000].map((preset) => (
            <Button
              key={preset}
              variant="outline"
              size="sm"
              onClick={() => setAmount(preset.toString())}
            >
              ₹{preset}
            </Button>
          ))}
        </div>
        <Button className="w-full" onClick={handleRecharge}>
          Recharge Wallet
        </Button>
      </CardContent>
    </Card>
  );
}