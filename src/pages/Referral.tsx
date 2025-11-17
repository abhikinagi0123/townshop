import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
const apiAny: any = api;
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gift, Copy, Share2, Users, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export default function Referral() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const referralStats = useQuery(apiAny.loyalty.getReferralStats);
  const referrals = useQuery(apiAny.loyalty.getReferralsList);
  
  const createReferralCode = useMutation(apiAny.loyalty.createReferralCode);
  const applyReferral = useMutation(apiAny.loyalty.applyReferralCode);

  const [referralCode, setReferralCode] = useState("");
  const [applyCode, setApplyCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const code = await createReferralCode();
      setReferralCode(code);
      toast.success("Referral code generated!");
    } catch (error) {
      toast.error("Failed to generate referral code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied to clipboard!");
  };

  const handleShareCode = async () => {
    if (!referralCode) return;
    const shareText = `Join TownShop using my referral code ${referralCode} and get 500 bonus points! ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join TownShop",
          text: shareText,
        });
      } catch (error) {
        navigator.clipboard.writeText(shareText);
        toast.success("Share text copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Share text copied to clipboard!");
    }
  };

  const handleApplyCode = async () => {
    if (!applyCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }
    try {
      const result = await applyReferral({ code: applyCode });
      toast.success(`Referral applied! You earned ${result.bonusPoints} points!`);
      setApplyCode("");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply referral code");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view referrals</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Gift className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">Refer & Earn</h1>
                  <p className="text-sm opacity-90">Share the love, earn rewards!</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          {referralStats && (
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{referralStats.totalBonus}</p>
                  <p className="text-xs text-muted-foreground">Points Earned</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{referralStats.pendingReferrals}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Your Referral Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Your Referral Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Share this code with friends</p>
                {referralCode ? (
                  <div className="flex gap-2">
                    <Input
                      value={referralCode}
                      readOnly
                      className="font-mono text-lg font-bold"
                    />
                    <Button size="icon" onClick={handleCopyCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" onClick={handleShareCode}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleGenerateCode} 
                    className="w-full"
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate Referral Code"}
                  </Button>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">How it works:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Share your code with friends</li>
                  <li>• They get 500 bonus points on signup</li>
                  <li>• You get 500 points when they use your code</li>
                  <li>• No limit on referrals!</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Apply Referral Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Have a Referral Code?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter referral code"
                  value={applyCode}
                  onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                  className="font-mono"
                />
                <Button onClick={handleApplyCode}>
                  Apply
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a friend's referral code to earn 500 bonus points!
              </p>
            </CardContent>
          </Card>

          {/* Referred Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!referrals || referrals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No referrals yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start sharing your code to earn rewards!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((referral: any) => (
                    <motion.div
                      key={referral._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          referral.status === "completed" 
                            ? "bg-green-100 dark:bg-green-900" 
                            : "bg-orange-100 dark:bg-orange-900"
                        }`}>
                          {referral.status === "completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {referral.referredUserName || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(referral._creationTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={referral.status === "completed" ? "default" : "secondary"}>
                        {referral.status === "completed" 
                          ? `+${referral.bonusPoints} pts` 
                          : "Pending"}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}
