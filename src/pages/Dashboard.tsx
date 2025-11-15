import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Package,
  BarChart3,
  MapPin,
  PieChart,
  Calendar,
  Tag
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const stats = useQuery(api.analytics.getUserStats);
  const categorySpending = useQuery(api.analytics.getSpendingByCategory);
  const orderFrequency = useQuery(api.analytics.getOrderFrequency);
  const savings = useQuery(api.analytics.getSavingsFromOffers);
  const trendingProducts = useQuery(
    api.analytics.getTrendingInArea,
    user?.lat && user?.lng
      ? { lat: user.lat, lng: user.lng, radius: 10 }
      : "skip"
  );

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
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
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
          </div>

          {/* Stats Overview */}
          {stats && stats.monthlySpending && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalOrders}</p>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">₹{stats.totalSpent.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">₹{stats.avgOrderValue.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">Avg Order</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Tag className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">₹{savings || 0}</p>
                      <p className="text-xs text-muted-foreground">Saved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Category Spending & Order Frequency */}
          <div className="grid md:grid-cols-2 gap-6">
            {categorySpending && categorySpending.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Spending by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categorySpending.slice(0, 5).map((cat, index) => {
                      const maxAmount = categorySpending[0].amount;
                      const percentage = (cat.amount / maxAmount) * 100;
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{cat.category}</span>
                            <span className="text-sm font-bold">₹{cat.amount.toFixed(0)}</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {orderFrequency && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Order Frequency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold text-primary">{orderFrequency.avgDaysBetweenOrders}</p>
                      <p className="text-sm text-muted-foreground mt-1">Days Between Orders</p>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      You order approximately every {orderFrequency.avgDaysBetweenOrders} days
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Spending Trend */}
          {stats && Array.isArray(stats.monthlySpending) && stats.monthlySpending.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Spending Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.monthlySpending.map((month: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{month.month}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ 
                              width: `${Math.min(100, (month.amount / Math.max(...stats.monthlySpending.map((m: any) => m.amount))) * 100)}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold min-w-[60px] text-right">
                          ₹{month.amount.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trending in Your Area */}
          {trendingProducts && trendingProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Trending in Your Area
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingProducts.map((product, index) => 
                    'image' in product && 'name' in product && 'price' in product ? (
                      <div 
                        key={product._id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.storeName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">₹{product.price}</p>
                          <p className="text-xs text-muted-foreground">{product.orderCount} orders</p>
                        </div>
                      </div>
                    ) : null
                  )}
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