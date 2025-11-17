import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User as UserIcon, Package, MapPin, LogOut, Phone, Mail, Edit, Gift, MessageSquare, Copy, BarChart3, Bell, Heart, Users } from "lucide-react";
import { UserDashboard } from "@/components/UserDashboard";
import { motion } from "framer-motion";
import { useState } from "react";
import { ProfileCompletionDialog } from "@/components/ProfileCompletionDialog";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { WalletCard } from "@/components/profile/WalletCard";
import { LoyaltyCard } from "@/components/profile/LoyaltyCard";

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated } = useAuth();
  const apiAny: any = api;
  const orders = useQuery(apiAny.orders.list);
  const addresses = useQuery(apiAny.addresses.list);
  const loyaltyData = useQuery(apiAny.loyalty.getPoints);
  const loyaltyTransactions = useQuery(apiAny.loyalty.getTransactions, { limit: 5 });
  const referralStats = useQuery(apiAny.loyalty.getReferralStats);
  const walletData = useQuery(apiAny.wallet.getBalance);
  const walletTransactions = useQuery(apiAny.wallet.getTransactions, { limit: 5 });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [applyReferralCode, setApplyReferralCode] = useState("");
  
  const createReferralCode = useMutation(apiAny.loyalty.createReferralCode);
  const applyReferral = useMutation(apiAny.loyalty.applyReferralCode);
  const createChatSession = useMutation(apiAny.chat.createSession);
  const addMoney = useMutation(apiAny.wallet.addMoney);

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

          {/* Analytics Dashboard */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Your Insights</h3>
                  <p className="text-sm text-muted-foreground">Order statistics & spending</p>
                </div>
              </div>
              <UserDashboard />
            </CardContent>
          </Card>

          {/* Wallet Card */}
          {walletData && (
            <WalletCard
              balance={walletData.balance}
              transactions={walletTransactions || []}
              onAddMoney={() => setShowWalletDialog(true)}
            />
          )}

          {/* Loyalty Program Card */}
          {loyaltyData && (
            <LoyaltyCard
              tier={loyaltyData.tier}
              points={loyaltyData.points}
              transactions={loyaltyTransactions || []}
            />
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
              My Orders & Bookings
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/services")}
            >
              <Users className="h-4 w-4 mr-2" />
              Browse Services
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/favorites")}
            >
              <Heart className="h-4 w-4 mr-2" />
              My Favorites
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/group-buying")}
            >
              <Users className="h-4 w-4 mr-2" />
              Group Buying
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/price-alerts")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Price Drop Alerts
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/subscriptions")}
            >
              <Package className="h-4 w-4 mr-2" />
              Subscription Boxes
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
              onClick={() => navigate("/help")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Help Center
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