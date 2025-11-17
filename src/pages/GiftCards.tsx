import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Gift, Plus, CreditCard, History, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function GiftCards() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const apiAny: any = api;
  const giftCards = useQuery(apiAny.giftCards.listByUser);
  const createGiftCard = useMutation(apiAny.giftCards.create);
  const redeemGiftCard = useMutation(apiAny.giftCards.redeem);
  
  const [searchParams] = useSearchParams();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  const [amount, setAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  
  const [redeemCode, setRedeemCode] = useState(searchParams.get("redeem") || "");
  const [redeemAmount, setRedeemAmount] = useState("");
  
  const [balanceCheckCode, setBalanceCheckCode] = useState("");
  const [balanceSearchInput, setBalanceSearchInput] = useState("");
  
  const [selectedCardForHistory, setSelectedCardForHistory] = useState<any>(null);

  const checkBalance = useQuery(apiAny.giftCards.checkBalance, 
    balanceCheckCode ? { code: balanceCheckCode } : "skip"
  );

  const handleCreate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const cardId = await createGiftCard({
        amount: parseFloat(amount),
        recipientEmail: recipientEmail || undefined,
        recipientName: recipientName || undefined,
        message: message || undefined,
      });
      toast.success("Gift card created successfully!");
      setCreateDialogOpen(false);
      setAmount("");
      setRecipientEmail("");
      setRecipientName("");
      setMessage("");
    } catch (error) {
      toast.error("Failed to create gift card");
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      toast.error("Please enter a gift card code");
      return;
    }

    try {
      const result = await redeemGiftCard({
        code: redeemCode.toUpperCase(),
        amount: redeemAmount ? parseFloat(redeemAmount) : undefined,
      });
      toast.success(`Redeemed ₹${result.redeemedAmount} to your wallet!`);
      if (result.remainingBalance > 0) {
        toast.info(`Remaining balance: ₹${result.remainingBalance}`);
      }
      setRedeemDialogOpen(false);
      setRedeemCode("");
      setRedeemAmount("");
    } catch (error: any) {
      toast.error(error.message || "Failed to redeem gift card");
    }
  };

  const handleCheckBalance = () => {
    if (!balanceSearchInput.trim()) {
      toast.error("Please enter a gift card code");
      return;
    }
    setBalanceCheckCode(balanceSearchInput.toUpperCase());
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  // Auto-open redeem dialog if code is in URL
  useEffect(() => {
    const redeemParam = searchParams.get("redeem");
    if (redeemParam) {
      setRedeemCode(redeemParam.toUpperCase());
      setRedeemDialogOpen(true);
    }
  }, [searchParams]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view gift cards</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Gift Cards</h1>
            </div>
            <div className="flex gap-2">
              <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Redeem
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Redeem Gift Card</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Gift Card Code</Label>
                      <Input
                        placeholder="GIFTXXXXXXXX"
                        value={redeemCode}
                        onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                        className="mt-2 uppercase"
                      />
                    </div>
                    <div>
                      <Label>Amount (Optional - Leave empty for full balance)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount or leave empty"
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(e.target.value)}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to redeem full balance to wallet
                      </p>
                    </div>
                    <Button onClick={handleRedeem} className="w-full">
                      Redeem to Wallet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Gift Card</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Amount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <Separator />
                    <p className="text-sm font-semibold">Send to Recipient (Optional)</p>
                    <div>
                      <Label>Recipient Email</Label>
                      <Input
                        type="email"
                        placeholder="recipient@example.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Recipient Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Message</Label>
                      <Textarea
                        placeholder="Happy Birthday!"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                    <Button onClick={handleCreate} className="w-full">
                      Create Gift Card
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="my-cards" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="my-cards">My Cards</TabsTrigger>
            <TabsTrigger value="check-balance">Check Balance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-cards">
            {!giftCards || giftCards.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No gift cards yet</p>
                <p className="text-sm text-muted-foreground mt-2">Create your first gift card!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {giftCards.map((card: any) => (
                  <Card key={card._id} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Gift className="h-8 w-8 text-primary" />
                        <Badge variant={card.status === "active" ? "default" : "secondary"}>
                          {card.status}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold mb-2">₹{card.balance}</p>
                      <div className="flex items-center gap-2 mb-4">
                        <p className="text-sm text-muted-foreground">Code: {card.code}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyCode(card.code)}
                          className="h-6 px-2"
                        >
                          Copy
                        </Button>
                      </div>
                      {card.balance < card.amount && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Original: ₹{card.amount}
                        </p>
                      )}
                      {card.recipientName && (
                        <p className="text-sm">To: {card.recipientName}</p>
                      )}
                      {card.recipientEmail && (
                        <p className="text-xs text-muted-foreground">{card.recipientEmail}</p>
                      )}
                      {card.message && (
                        <p className="text-sm italic mt-2">"{card.message}"</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-4">
                        Expires: {new Date(card.expiresAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="check-balance">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label>Enter Gift Card Code</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="GIFTXXXXXXXX"
                        value={balanceSearchInput}
                        onChange={(e) => setBalanceSearchInput(e.target.value.toUpperCase())}
                        className="uppercase"
                      />
                      <Button onClick={handleCheckBalance}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {checkBalance && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Balance Details</h3>
                        <Badge variant={checkBalance.status === "active" ? "default" : "secondary"}>
                          {checkBalance.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Code:</span>
                          <span className="font-mono">{checkBalance.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Current Balance:</span>
                          <span className="font-bold text-lg">₹{checkBalance.balance}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Original Amount:</span>
                          <span>₹{checkBalance.originalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Expires:</span>
                          <span className={checkBalance.isExpired ? "text-red-500" : ""}>
                            {new Date(checkBalance.expiresAt).toLocaleDateString()}
                            {checkBalance.isExpired && " (Expired)"}
                          </span>
                        </div>
                      </div>
                      {checkBalance.status === "active" && !checkBalance.isExpired && (
                        <Button 
                          className="w-full mt-4"
                          onClick={() => {
                            setRedeemCode(checkBalance.code);
                            setRedeemDialogOpen(true);
                          }}
                        >
                          Redeem This Card
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {balanceCheckCode && !checkBalance && (
                    <div className="text-center py-8 text-muted-foreground">
                      Gift card not found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}