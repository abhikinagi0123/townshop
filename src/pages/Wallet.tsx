import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { ArrowLeft, Wallet as WalletIcon, TrendingUp, TrendingDown, Plus, CreditCard, History, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WalletRecharge } from "@/components/WalletRecharge";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export default function Wallet() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const apiAny: any = api;
  
  const walletData = useQuery(apiAny.wallet.getBalance);
  const transactions = useQuery(apiAny.wallet.getTransactions, { limit: 50 });
  
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);

  const balance = walletData?.balance || 0;

  const handleRechargeSuccess = () => {
    toast.success("Wallet recharged successfully!");
    setRechargeDialogOpen(false);
  };

  const getTransactionIcon = (type: string) => {
    return type === "credit" ? (
      <TrendingUp className="h-5 w-5 text-green-600" />
    ) : (
      <TrendingDown className="h-5 w-5 text-red-600" />
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const groupTransactionsByDate = (transactions: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    transactions?.forEach((transaction) => {
      const date = new Date(transaction._creationTime);
      const dateKey = date.toDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });
    
    return groups;
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const calculateStats = () => {
    if (!transactions) return { totalCredit: 0, totalDebit: 0, transactionCount: 0 };
    
    const totalCredit = transactions
      .filter((t: any) => t.type === "credit")
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const totalDebit = transactions
      .filter((t: any) => t.type === "debit")
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
    
    return {
      totalCredit,
      totalDebit,
      transactionCount: transactions.length
    };
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view your wallet</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const groupedTransactions = groupTransactionsByDate(transactions || []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <WalletIcon className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">My Wallet</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90 mb-1">Available Balance</p>
                  <h2 className="text-4xl font-bold">₹{balance.toFixed(2)}</h2>
                </div>
                <WalletIcon className="h-12 w-12 opacity-80" />
              </div>
              
              <Dialog open={rechargeDialogOpen} onOpenChange={setRechargeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Money
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Recharge Wallet</DialogTitle>
                  </DialogHeader>
                  <WalletRecharge 
                    userId={user?._id || ""} 
                    onSuccess={handleRechargeSuccess}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Total Added</p>
              <p className="font-bold text-green-600">₹{stats.totalCredit.toFixed(2)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingDown className="h-5 w-5 text-red-600 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
              <p className="font-bold text-red-600">₹{stats.totalDebit.toFixed(2)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <History className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Transactions</p>
              <p className="font-bold">{stats.transactionCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!transactions || transactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add money to your wallet to get started
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedTransactions).map(([dateString, dayTransactions]) => (
                  <div key={dateString}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                      {getDateLabel(dateString)}
                    </h3>
                    <div className="space-y-2">
                      {dayTransactions.map((transaction: any) => (
                        <motion.div
                          key={transaction._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
                            }`}>
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(transaction._creationTime)}
                              </p>
                              {transaction.transactionId && (
                                <p className="text-xs text-muted-foreground">
                                  ID: {transaction.transactionId.slice(0, 12)}...
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              transaction.type === "credit" ? "text-green-600" : "text-red-600"
                            }`}>
                              {transaction.type === "credit" ? "+" : "-"}₹{Math.abs(transaction.amount).toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}
