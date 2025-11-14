import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Package, MapPin, LogOut, Phone, Mail, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { ProfileCompletionDialog } from "@/components/ProfileCompletionDialog";

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const cartItems = useQuery(api.cart.get);
  const orders = useQuery(api.orders.list);
  const addresses = useQuery(api.addresses.list);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">Profile</h1>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
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
    </div>
  );
}