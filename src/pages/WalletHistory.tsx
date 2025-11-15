import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, ArrowLeft, TrendingUp, TrendingDown, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WalletRecharge } from "@/components/WalletRecharge";
import { toast } from "sonner";

export default function WalletHistory() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const balance = useQuery(api.wallet.getBalance);
  const transactions = useQuery(api.wallet.getTransactions, { limit: 50 });

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/profile")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Wallet</h1>
              <p className="text-muted-foreground">Manage your wallet balance</p>
            </div>
          </div>

          {/* Balance Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-6 w-6 text-primary" />
                    <span className="text-4xl font-bold">
                      {balance?.balance?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
                
                {user && (
                  <WalletRecharge 
                    userId={user._id} 
                    onSuccess={() => {
                      toast.success("Wallet recharged successfully!");
                    }} 
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-4">Transaction History</h2>

          {transactions && transactions.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                {transactions.map((transaction, index) => (
                  <div key={transaction._id}>
                    <div className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              transaction.type === "credit"
                                ? "bg-green-100 dark:bg-green-900/20"
                                : "bg-red-100 dark:bg-red-900/20"
                            }`}
                          >
                            {transaction.type === "credit" ? (
                              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction._creationTime).toLocaleString()}
                            </p>
                            {transaction.transactionId && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ID: {transaction.transactionId}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              transaction.type === "credit"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {transaction.type === "credit" ? "+" : "-"}₹
                            {Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <Badge
                            variant={transaction.type === "credit" ? "default" : "secondary"}
                            className="mt-1"
                          >
                            {transaction.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {index < transactions.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add money to your wallet to get started
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