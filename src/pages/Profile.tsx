import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User as UserIcon, Package, MapPin, LogOut, Phone, Mail, Edit, Award, Gift, MessageSquare, Copy, Trophy, Wallet, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { ProfileCompletionDialog } from "@/components/ProfileCompletionDialog";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated } = useAuth();
  const orders = useQuery(api.orders.list);
  const addresses = useQuery(api.addresses.list);
  const loyaltyData = useQuery(api.loyalty.getPoints);
  const loyaltyTransactions = useQuery(api.loyalty.getTransactions, { limit: 5 });
  const referralStats = useQuery(api.loyalty.getReferralStats);
  const walletData = useQuery(api.wallet.getBalance);
  const walletTransactions = useQuery(api.wallet.getTransactions, { limit: 5 });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [applyReferralCode, setApplyReferralCode] = useState("");
  
  const createReferralCode = useMutation(api.loyalty.createReferralCode);
  const applyReferral = useMutation(api.loyalty.applyReferralCode);
  const createChatSession = useMutation(api.chat.createSession);
  const addMoney = useMutation(api.wallet.addMoney);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleGenerateReferralCode = async () => {
    try {
      const code = await createReferralCode();
      setReferralCode(code);
      toast.success("Referral code generated!");
    } catch (error) {
      toast.error("Failed to generate referral code");
    }
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  const handleApplyReferralCode = async () => {
    if (!applyReferralCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }
    try {
      await applyReferral({ code: applyReferralCode });
      toast.success("Referral code applied successfully!");
      setApplyReferralCode("");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply referral code");
    }
  };

  const handleStartChat = async () => {
    try {
      const sessionId = await createChatSession({});
      navigate(`/chat/${sessionId}`);
    } catch (error) {
      toast.error("Failed to start chat");
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum": return "bg-gradient-to-r from-gray-400 to-gray-600";
      case "gold": return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case "silver": return "bg-gradient-to-r from-gray-300 to-gray-500";
      default: return "bg-gradient-to-r from-orange-400 to-orange-600";
    }
  };

  // Calculate redeemable money from points
  const redeemableMoney = loyaltyData ? Math.floor(loyaltyData.points / 100) : 0;

  const handleAddMoney = async () => {
    const amount = parseFloat(addMoneyAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await addMoney({ amount, transactionId: `TXN${Date.now()}` });
      toast.success(`₹${amount} added to wallet successfully!`);
      setAddMoneyAmount("");
      setShowWalletDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add money");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {user?.name || "Guest User"}
                    </h2>
                    {user?.email && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {user?.phone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Wallet Card */}
          {walletData && (
            <Card className="mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-6 w-6" />
                    <h3 className="text-lg font-bold">My Wallet</h3>
                  </div>
                  <div className="text-3xl font-bold">₹{walletData.balance.toFixed(2)}</div>
                </div>
                <p className="text-sm opacity-90">Available balance for orders</p>
              </div>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <Button 
                    className="w-full" 
                    onClick={() => setShowWalletDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Money
                  </Button>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Recent Transactions</span>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/wallet")}>
                      View All
                    </Button>
                  </div>
                  {walletTransactions && walletTransactions.length > 0 ? (
                    <div className="space-y-2">
                      {walletTransactions.slice(0, 3).map((transaction) => (
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
          )}

          {/* Loyalty Program Card with Redeemable Money */}
          {loyaltyData && (
            <Card className="mb-6 overflow-hidden">
              <div className={`${getTierColor(loyaltyData.tier)} p-6 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6" />
                    <h3 className="text-lg font-bold capitalize">{loyaltyData.tier} Member</h3>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {loyaltyData.points} Points
                  </Badge>
                </div>
                <p className="text-sm opacity-90">Keep earning to unlock more rewards!</p>
              </div>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Redeemable Money Section */}
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
                  {loyaltyTransactions && loyaltyTransactions.length > 0 ? (
                    <div className="space-y-2">
                      {loyaltyTransactions.slice(0, 3).map((transaction) => (
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
          )}

          {/* Referral Program Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Refer & Earn</h3>
                  <p className="text-sm text-muted-foreground">Get 500 points for each referral</p>
                </div>
              </div>
              {referralStats && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
                    <p className="text-xs text-muted-foreground">Successful Referrals</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{referralStats.totalBonus}</p>
                    <p className="text-xs text-muted-foreground">Bonus Points Earned</p>
                  </div>
                </div>
              )}
              <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <Gift className="h-4 w-4 mr-2" />
                    Manage Referrals
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Referral Program</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Your Referral Code</p>
                      {referralCode ? (
                        <div className="flex gap-2">
                          <Input value={referralCode} readOnly />
                          <Button size="sm" onClick={handleCopyReferralCode}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={handleGenerateReferralCode} className="w-full">
                          Generate Code
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate("/orders")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{orders?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate("/addresses")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{addresses?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Saved Addresses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/orders")}
            >
              <Package className="h-4 w-4 mr-2" />
              My Orders
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/stores")}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Browse Stores
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleStartChat}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Customer Support
            </Button>
          </div>
        </motion.div>
      </div>

      <ProfileCompletionDialog
        open={showEditDialog}
        onComplete={() => setShowEditDialog(false)}
        currentName={user?.name}
        currentPhone={user?.phone}
        currentLat={user?.lat}
        currentLng={user?.lng}
      />

      {/* Add Money Dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Money to Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-2">Enter Amount</p>
              <Input
                type="number"
                placeholder="Enter amount in ₹"
                value={addMoneyAmount}
                onChange={(e) => setAddMoneyAmount(e.target.value)}
                min="1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddMoneyAmount("100")}
              >
                ₹100
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddMoneyAmount("500")}
              >
                ₹500
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddMoneyAmount("1000")}
              >
                ₹1000
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddMoneyAmount("2000")}
              >
                ₹2000
              </Button>
            </div>
            <Button onClick={handleAddMoney} className="w-full">
              Add Money
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}