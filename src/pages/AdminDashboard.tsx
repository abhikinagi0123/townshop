import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { 
  Store, 
  Package, 
  Users, 
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Activity,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const apiAny: any = api;

  const platformStats = useQuery(apiAny.platform.getPlatformStats);
  const recentActivity = useQuery(apiAny.platform.getRecentActivity, { limit: 10 });

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Platform Overview</p>
            </div>
          </div>

          {/* Platform Stats */}
          {platformStats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Store className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{platformStats.totalStores}</p>
                        <p className="text-xs text-muted-foreground">Total Stores</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{platformStats.totalProducts}</p>
                        <p className="text-xs text-muted-foreground">Products</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{platformStats.totalUsers}</p>
                        <p className="text-xs text-muted-foreground">Users</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">₹{platformStats.totalRevenue.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Order Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Orders</span>
                        <span className="text-2xl font-bold">{platformStats.totalOrders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Pending Orders</span>
                        <Badge variant="outline">{platformStats.pendingOrders}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Active Stores</span>
                        <Badge className="bg-green-500">{platformStats.activeStores}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Platform Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Store Utilization</span>
                        <span className="font-semibold">
                          {((platformStats.activeStores / platformStats.totalStores) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avg Products/Store</span>
                        <span className="font-semibold">
                          {(platformStats.totalProducts / platformStats.totalStores).toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avg Order Value</span>
                        <span className="font-semibold">
                          ₹{(platformStats.totalRevenue / platformStats.totalOrders).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Recent Activity */}
          {recentActivity && recentActivity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((order: any) => (
                    <div
                      key={order._id}
                      className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => navigate(`/order/${order._id}`)}
                    >
                      <div>
                        <p className="font-semibold text-sm">{order.storeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order._creationTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{order.totalAmount}</p>
                        <Badge className={
                          order.status === "delivered" ? "bg-green-500" :
                          order.status === "cancelled" ? "bg-red-500" :
                          "bg-yellow-500"
                        }>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
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
