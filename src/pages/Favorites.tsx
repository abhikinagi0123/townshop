import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
// Type assertion to avoid deep type instantiation with React 19
const apiAny: any = api;
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Trash2, Store, Package } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Badge } from "@/components/ui/badge";

export default function Favorites() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const favorites = useQuery(apiAny.favorites.list);
  const removeFavorite = useMutation(apiAny.favorites.remove);

  const handleRemove = async (favoriteId: string) => {
    try {
      await removeFavorite({ favoriteId: favoriteId as any });
      toast.success("Removed from favorites");
    } catch (error) {
      toast.error("Failed to remove from favorites");
    }
  };

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  // Type guard helpers
  const hasStore = (fav: any): fav is { _id: string; storeId: string; store: any } => {
    return fav.store !== undefined && fav.store !== null;
  };

  const hasProduct = (fav: any): fav is { _id: string; productId: string; product: any; storeName?: string } => {
    return fav.product !== undefined && fav.product !== null;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-bold">My Favorites</h1>
        </div>

        {!favorites ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground mb-4">No favorites yet</p>
            <Button onClick={() => navigate("/stores")}>
              Browse Stores
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {favorites.some((f: any) => hasStore(f)) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Store className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Favorite Stores</h2>
                  <Badge variant="secondary">
                    {favorites.filter((f: any) => hasStore(f)).length}
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {favorites
                    .filter((f: any) => hasStore(f))
                    .map((fav: any, index: number) => {
                      if (!hasStore(fav)) return null;
                      return (
                        <motion.div
                          key={fav._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => navigate(`/store/${fav.storeId}`)}
                          >
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                <img
                                  src={fav.store?.image}
                                  alt={fav.store?.name}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <h3 className="font-semibold">{fav.store?.name}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {fav.store?.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      ⭐ {fav.store?.rating}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {fav.store?.deliveryTime}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(fav._id);
                                  }}
                                  className="text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            )}

            {favorites.some((f: any) => hasProduct(f)) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Favorite Products</h2>
                  <Badge variant="secondary">
                    {favorites.filter((f: any) => hasProduct(f)).length}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {favorites
                    .filter((f: any) => hasProduct(f))
                    .map((fav: any, index: number) => {
                      if (!hasProduct(fav)) return null;
                      return (
                        <motion.div
                          key={fav._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => navigate(`/product/${fav.productId}`)}
                          >
                            <div className="relative">
                              <img
                                src={fav.product?.image}
                                alt={fav.product?.name}
                                className="w-full h-32 object-cover rounded-t-lg"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemove(fav._id);
                                }}
                                className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
                              >
                                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                              </Button>
                            </div>
                            <CardContent className="p-3">
                              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                                {fav.product?.name}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                                {fav.storeName}
                              </p>
                              <p className="text-sm font-bold text-primary">
                                ₹{fav.product?.price}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}