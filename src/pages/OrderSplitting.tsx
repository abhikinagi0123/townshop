import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, DollarSign, CheckCircle, Clock, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function OrderSplitting() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated, user } = useAuth();
  const apiAny: any = api;
  
  const order = useQuery(apiAny.orders.getById, orderId ? { orderId: orderId as Id<"orders"> } : "skip");
  const existingSplit = useQuery(apiAny.orderSplitting.getByOrder, orderId ? { orderId: orderId as Id<"orders"> } : "skip");
  
  const createSplit = useMutation(apiAny.orderSplitting.createSplit);
  const markPaid = useMutation(apiAny.orderSplitting.markPaid);

  const [participants, setParticipants] = useState<Array<{ userName: string; amount: string }>>([
    { userName: "", amount: "" }
  ]);

  const addParticipant = () => {
    setParticipants([...participants, { userName: "", amount: "" }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: "userName" | "amount", value: string) => {
    const updated = [...participants];
    if (!updated[index]) return;
    if (field === "userName") {
      updated[index].userName = value;
    } else {
      updated[index].amount = value;
    }
    setParticipants(updated);
  };

  const handleCreateSplit = async () => {
    if (!orderId || !user || !order) {
      toast.error("Please sign in to split orders");
      return;
    }

    const validParticipants = participants.filter(p => p.userName.trim() && parseFloat(p.amount) > 0);
    
    if (validParticipants.length === 0) {
      toast.error("Please add at least one participant with a valid amount");
      return;
    }

    const totalSplit = validParticipants.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const orderTotal = order.totalAmount;
    if (Math.abs(totalSplit - orderTotal) > 0.01) {
      toast.error(`Split amounts must equal order total (₹${orderTotal})`);
      return;
    }

    try {
      await createSplit({
        orderId: orderId as Id<"orders">,
        participants: validParticipants.map(p => ({
          userId: user._id,
          userName: p.userName,
          amount: parseFloat(p.amount)
        }))
      });
      toast.success("Order split created successfully!");
      setParticipants([{ userName: "", amount: "" }]);
    } catch (error: any) {
      toast.error(error.message || "Failed to create split");
    }
  };

  const handleMarkPaid = async (participantUserId: Id<"users">) => {
    if (!existingSplit) return;
    
    try {
      await markPaid({
        splitId: existingSplit._id,
        userId: participantUserId
      });
      toast.success("Payment marked as received!");
    } catch (error: any) {
      toast.error(error.message || "Failed to mark payment");
    }
  };

  const splitEvenly = () => {
    if (!order || participants.length === 0) return;
    
    const totalAmount = order.totalAmount ?? 0;
    const amountPerPerson = (totalAmount / participants.length).toFixed(2);
    setParticipants(participants.map(p => ({ ...p, amount: amountPerPerson })));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to split orders</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Loading order...</p>
        </div>
        <MobileBottomNav isAuthenticated={isAuthenticated} />
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
          onClick={() => navigate(`/order/${orderId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Split Order Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order from:</span>
                  <span className="font-semibold">{order.storeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-bold text-lg">₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge>{order.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {existingSplit ? (
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Split Status:</span>
                    <Badge variant={existingSplit.status === "completed" ? "default" : "secondary"}>
                      {existingSplit.status}
                    </Badge>
                  </div>
                  
                  {existingSplit.participants.map((participant: any, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${participant.isPaid ? "bg-green-100 dark:bg-green-900" : "bg-orange-100 dark:bg-orange-900"}`}>
                          {participant.isPaid ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{participant.userName}</p>
                          <p className="text-sm text-muted-foreground">₹{participant.amount}</p>
                        </div>
                      </div>
                      {!participant.isPaid && user?._id === existingSplit.createdBy && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkPaid(participant.userId)}
                        >
                          Mark Paid
                        </Button>
                      )}
                      {participant.isPaid && (
                        <Badge variant="default">Paid</Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create Split</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={splitEvenly} variant="outline" size="sm">
                    Split Evenly
                  </Button>
                  <Button onClick={addParticipant} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Person
                  </Button>
                </div>

                <div className="space-y-3">
                  {participants.map((participant, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder="Name"
                        value={participant.userName}
                        onChange={(e) => updateParticipant(idx, "userName", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={participant.amount}
                        onChange={(e) => updateParticipant(idx, "amount", e.target.value)}
                        className="w-32"
                      />
                      {participants.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeParticipant(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Total Split:</span>
                    <span className="font-bold">
                      ₹{participants.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <Button onClick={handleCreateSplit} className="w-full">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Create Split
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}