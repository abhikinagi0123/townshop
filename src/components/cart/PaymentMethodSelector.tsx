import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Smartphone, Wallet, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

interface PaymentMethodSelectorProps {
  paymentMethod: "card" | "upi" | "wallet" | "cod" | "app_wallet";
  onPaymentMethodChange: (method: "card" | "upi" | "wallet" | "cod" | "app_wallet") => void;
  cardNumber: string;
  onCardNumberChange: (value: string) => void;
  upiId: string;
  onUpiIdChange: (value: string) => void;
  walletProvider: string;
  onWalletProviderChange: (value: string) => void;
  walletBalance: number;
  savedPaymentMethods?: any[];
  savePaymentMethod: boolean;
  onSavePaymentMethodChange: (value: boolean) => void;
}

export function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
  cardNumber,
  onCardNumberChange,
  upiId,
  onUpiIdChange,
  walletProvider,
  onWalletProviderChange,
  walletBalance,
  savedPaymentMethods,
  savePaymentMethod,
  onSavePaymentMethodChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="border-t pt-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        Payment Method
      </h3>
      
      <RadioGroup value={paymentMethod} onValueChange={(value: any) => onPaymentMethodChange(value)}>
        <div className="space-y-3">
          {savedPaymentMethods && savedPaymentMethods.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Saved Methods</p>
              {savedPaymentMethods.map((method: any) => (
                <Card key={method._id} className="mb-2 cursor-pointer hover:border-primary">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={method.type} id={method._id} />
                      <Label htmlFor={method._id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          {method.type === "card" && <CreditCard className="h-4 w-4" />}
                          {method.type === "upi" && <Smartphone className="h-4 w-4" />}
                          {method.type === "wallet" && <Wallet className="h-4 w-4" />}
                          <span className="text-sm">
                            {method.type === "card" && `${method.cardBrand} •••• ${method.cardLast4}`}
                            {method.type === "upi" && method.upiId}
                            {method.type === "wallet" && method.walletProvider}
                          </span>
                        </div>
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Separator className="my-3" />
            </div>
          )}

          {/* Card Payment */}
          <Card className={paymentMethod === "card" ? "border-primary" : ""}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Credit/Debit Card</span>
                  </div>
                </Label>
              </div>
              {paymentMethod === "card" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 space-y-2"
                >
                  <Input
                    placeholder="Card Number"
                    value={cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 16);
                      onCardNumberChange(value);
                    }}
                    maxLength={16}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="MM/YY" maxLength={5} />
                    <Input placeholder="CVV" maxLength={3} type="password" />
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* UPI Payment */}
          <Card className={paymentMethod === "upi" ? "border-primary" : ""}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>UPI</span>
                  </div>
                </Label>
              </div>
              {paymentMethod === "upi" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3"
                >
                  <Input
                    placeholder="UPI ID (e.g., user@paytm)"
                    value={upiId}
                    onChange={(e) => onUpiIdChange(e.target.value)}
                  />
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Wallet Payment */}
          <Card className={paymentMethod === "wallet" ? "border-primary" : ""}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span>Wallet</span>
                  </div>
                </Label>
              </div>
              {paymentMethod === "wallet" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3"
                >
                  <Select value={walletProvider} onValueChange={onWalletProviderChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paytm">Paytm</SelectItem>
                      <SelectItem value="phonepe">PhonePe</SelectItem>
                      <SelectItem value="googlepay">Google Pay</SelectItem>
                      <SelectItem value="amazonpay">Amazon Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* App Wallet */}
          <Card className={paymentMethod === "app_wallet" ? "border-primary" : ""}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="app_wallet" id="app_wallet" />
                <Label htmlFor="app_wallet" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span>App Wallet</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Balance: ₹{walletBalance.toFixed(2)}
                    </span>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Cash on Delivery */}
          <Card className={paymentMethod === "cod" ? "border-primary" : ""}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    <span>Cash on Delivery</span>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </RadioGroup>

      {paymentMethod !== "cod" && paymentMethod !== "app_wallet" && (
        <div className="flex items-center justify-between mt-3 p-3 bg-muted rounded-lg">
          <span className="text-sm">Save this payment method</span>
          <Switch
            checked={savePaymentMethod}
            onCheckedChange={onSavePaymentMethodChange}
          />
        </div>
      )}
    </div>
  );
}
