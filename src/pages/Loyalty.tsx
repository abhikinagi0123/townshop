import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";

export default function Loyalty() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const loyaltyData = useQuery(api.loyalty.getPoints);
  const transactions = useQuery(api.loyalty.getTransactions, { limit: 50 });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum": return "from-gray-400 to-gray-600";
      case "gold": return "from-yellow-400 to-yellow-600";
      case "silver": return "from-gray-300 to-gray-500";
      default: return "from-orange-400 to-orange-600";
    }
  };

  const getTierThreshold = (tier: string) => {
    switch (tier) {
      case "platinum": return 10000;
      case "gold": return 5000;
      case "silver": return 1000;
      default: return 0;
    }
  };

  const getNextTier = (currentTier: string) => {
    switch (currentTier) {
      case "bronze": return { name: "silver", threshold: 1000 };
      case "silver": return { name: "gold", threshold: 5000 };
      case "gold": return { name: "platinum", threshold: 10000 };
      default: return null;
    }
  };

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loyaltyData && (
            <>
              <Card className="mb-6 overflow-hidden">
                <div className={`bg-gradient-to-r ${getTierColor(loyaltyData.tier)} p-8 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-10 w-10" />
                      <div>
                        <h1 className="text-2xl font-bold capitalize">{loyaltyData.tier} Member</h1>
                        <p className="text-sm opacity-90">Keep earning to unlock rewards</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                      {loyaltyData.points} Points
                    </Badge>
                  </div>
                  
                  {getNextTier(loyaltyData.tier) && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to {getNextTier(loyaltyData.tier)?.name}</span>
                        <span>{loyaltyData.points} / {getNextTier(loyaltyData.tier)?.threshold}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all"
                          style={{
                            width: `${Math.min(
                              (loyaltyData.points / (getNextTier(loyaltyData.tier)?.threshold || 1)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="font-bold text-lg mb-4">How It Works</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Gift className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Earn Points</p>
                        <p className="text-muted-foreground">Get 1 point for every ₹1 spent</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Trophy className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">Tier Benefits</p>
                        <p className="text-muted-foreground">Bronze (0+), Silver (1000+), Gold (5000+), Platinum (10000+)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-4">Transaction History</h2>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <motion.div
                      key={transaction._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {transaction.points > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-semibold text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction._creationTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={transaction.points > 0 ? "default" : "destructive"}>
                        {transaction.points > 0 ? "+" : ""}{transaction.points}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No transactions yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}
