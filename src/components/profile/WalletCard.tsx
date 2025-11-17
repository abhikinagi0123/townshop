import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router";

interface WalletCardProps {
  balance: number;
  transactions: any[];
  onAddMoney: () => void;
}

export function WalletCard({ balance, transactions, onAddMoney }: WalletCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <h3 className="text-lg font-bold">My Wallet</h3>
          </div>
          <div className="text-3xl font-bold">₹{balance.toFixed(2)}</div>
        </div>
        <p className="text-sm opacity-90">Available balance for orders</p>
      </div>
      <CardContent className="p-4">
        <div className="space-y-4">
          <Button className="w-full" onClick={onAddMoney}>
            <Plus className="h-4 w-4 mr-2" />
            Add Money
          </Button>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Recent Transactions</span>
            <Button variant="ghost" size="sm" onClick={() => navigate("/wallet")}>
              View All
            </Button>
          </div>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 3).map((transaction: any) => (
                <div key={transaction._id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {transaction.type === "credit" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-muted-foreground">{transaction.description}</span>
                  </div>
                  <span className={transaction.type === "credit" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {transaction.type === "credit" ? "+" : ""}₹{Math.abs(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}