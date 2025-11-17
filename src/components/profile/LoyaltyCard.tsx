import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award } from "lucide-react";
import { useNavigate } from "react-router";

interface LoyaltyCardProps {
  tier: string;
  points: number;
  transactions: any[];
}

export function LoyaltyCard({ tier, points, transactions }: LoyaltyCardProps) {
  const navigate = useNavigate();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum": return "bg-gradient-to-r from-gray-400 to-gray-600";
      case "gold": return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case "silver": return "bg-gradient-to-r from-gray-300 to-gray-500";
      default: return "bg-gradient-to-r from-orange-400 to-orange-600";
    }
  };

  const redeemableMoney = Math.floor(points / 100);

  return (
    <Card className="mb-6 overflow-hidden">
      <div className={`${getTierColor(tier)} p-6 text-white`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            <h3 className="text-lg font-bold capitalize">{tier} Member</h3>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {points} Points
          </Badge>
        </div>
        <p className="text-sm opacity-90">Keep earning to unlock more rewards!</p>
      </div>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-900 dark:text-green-100">Redeemable Balance</span>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{redeemableMoney}
              </div>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              Use your points at checkout (100 points = ₹1)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Recent Transactions</span>
            <Button variant="ghost" size="sm" onClick={() => navigate("/loyalty")}>
              View All
            </Button>
          </div>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 3).map((transaction: any) => (
                <div key={transaction._id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{transaction.description}</span>
                  <span className={transaction.points > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {transaction.points > 0 ? "+" : ""}{transaction.points}
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
