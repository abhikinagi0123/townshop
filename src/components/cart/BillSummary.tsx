import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndianRupee } from "lucide-react";

interface BillSummaryProps {
  subtotal: number;
  deliveryFee: number;
  deliveryTip: number;
  loyaltyDiscount: number;
  couponDiscount: number;
  appliedCoupon: { code: string; discountAmount: number } | null;
  total: number;
  onCheckout: () => void;
}

export function BillSummary({
  subtotal,
  deliveryFee,
  deliveryTip,
  loyaltyDiscount,
  couponDiscount,
  appliedCoupon,
  total,
  onCheckout,
}: BillSummaryProps) {
  return (
    <Card className="sticky top-20">
      <CardContent className="p-6">
        <h2 className="font-bold text-lg mb-4">Bill Details</h2>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <div className="flex items-center gap-1">
              <IndianRupee className="h-3 w-3" />
              <span>{subtotal}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <div className="flex items-center gap-1">
              <IndianRupee className="h-3 w-3" />
              <span>{deliveryFee}</span>
            </div>
          </div>
          {deliveryTip > 0 && (
            <div className="flex justify-between text-sm">
              <span>Delivery Tip</span>
              <div className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3" />
                <span>{deliveryTip}</span>
              </div>
            </div>
          )}
          {loyaltyDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Loyalty Discount</span>
              <div className="flex items-center gap-1">
                <span>-</span>
                <IndianRupee className="h-3 w-3" />
                <span>{loyaltyDiscount}</span>
              </div>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Coupon Discount ({appliedCoupon?.code})</span>
              <div className="flex items-center gap-1">
                <span>-</span>
                <IndianRupee className="h-3 w-3" />
                <span>{couponDiscount}</span>
              </div>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <div className="flex items-center gap-1">
              <IndianRupee className="h-4 w-4" />
              <span>{total}</span>
            </div>
          </div>
        </div>
        <Button className="w-full" size="lg" onClick={onCheckout}>
          Proceed to Checkout
        </Button>
      </CardContent>
    </Card>
  );
}
