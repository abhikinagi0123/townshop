import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useNavigate } from "react-router";
import { ShoppingBag, Search, Star, MapPin, ArrowLeft, Clock, IndianRupee, Loader2, Info } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { OfferCard } from "@/components/OfferCard";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function StoreDetail() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [productCategory, setProductCategory] = useState("all");

  const apiAny: any = api;
  const store = useQuery(apiAny.stores.getById, { 
    storeId: storeId as Id<"stores"> 
  });
  const products = useQuery(apiAny.products.listByStore, {
    storeId: storeId as Id<"stores">,
    category: productCategory,
  });
  const cartItems = useQuery(apiAny.cart.get);
  const storeOffers = useQuery(apiAny.offers.list, {
    storeId: storeId as Id<"stores">,
  });
  const storeReviews = useQuery(apiAny.reviews.listByStore, {
    storeId: storeId as Id<"stores">,
  });
  const averageRating = useQuery(apiAny.reviews.getAverageRating, {
    storeId: storeId as Id<"stores">,
  });
  
  const addToCart = useMutation(apiAny.cart.addItem);
  const updateQuantity = useMutation(apiAny.cart.updateQuantity);
  const createStockAlert = useMutation(apiAny.stockAlerts.create);
  const removeStockAlert = useMutation(apiAny.stockAlerts.remove);
  const stockAlerts = useQuery(apiAny.stockAlerts.listByUser);

  const cartCount = cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  const getProductQuantity = (productId: string) => {
    const item = cartItems?.find((item: any) => item.productId === productId);
    return item?.quantity || 0;
  };

  const getCartItemId = (productId: string) => {
    return cartItems?.find((item: any) => item.productId === productId)?._id;
  };

  const handleAddToCart = async (productId: Id<"products">) => {
    try {
      await addToCart({ productId, quantity: 1 });
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleIncrease = async (productId: Id<"products">) => {
    const cartItemId = getCartItemId(productId);
    if (!cartItemId) return;
    
    try {
      await updateQuantity({
        cartItemId,
        quantity: getProductQuantity(productId) + 1,
      });
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleDecrease = async (productId: Id<"products">) => {
    const cartItemId = getCartItemId(productId);
    if (!cartItemId) return;
    
    try {
      await updateQuantity({
        cartItemId,
        quantity: getProductQuantity(productId) - 1,
      });
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const hasStockAlert = (productId: Id<"products">) => {
    return stockAlerts?.some((alert: any) => alert.productId === productId) || false;
  };

  const handleToggleStockAlert = async (productId: Id<"products">) => {
    try {
      const existingAlert = stockAlerts?.find((alert: any) => alert.productId === productId);
      if (existingAlert) {
        await removeStockAlert({ alertId: existingAlert._id });
        toast.success("Stock alert removed");
      } else {
        await createStockAlert({ productId });
        toast.success("You'll be notified when this item is back in stock");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update stock alert");
    }
  };

  if (!store || !products) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                <span className="font-bold text-xl tracking-tight">QuickDeliver</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading store details...</p>
        </div>
      </div>
    );
  }

  const productCategories = ["all", ...new Set(products?.map((p: any) => p.category) || [])];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
              <span className="font-bold text-xl tracking-tight">QuickDeliver</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/stores")}
          className="mb-4"
          aria-label="Back to stores"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stores
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <img
              src={store.image}
              alt={store.name}
              className="w-full md:w-48 h-48 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
              <p className="text-muted-foreground mb-4">{store.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {averageRating ? averageRating.average.toFixed(1) : store.rating.toFixed(1)}
                  </span>
                  {averageRating && (
                    <span className="text-muted-foreground">
                      ({averageRating.count} {averageRating.count === 1 ? "review" : "reviews"})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{store.deliveryTime}</span>
                </div>
                {store.minOrder > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <IndianRupee className="h-3 w-3" />
                    <span>{store.minOrder} minimum order</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {storeOffers && storeOffers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Available Offers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storeOffers.map((offer: any) => (
                  <OfferCard key={offer._id} offer={offer} />
                ))}
              </div>
            </div>
          )}

          {/* Store Hours & Policies */}
          {(store?.hours || store?.policies) && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Store Information
              </h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  {store.hours && (
                    <div>
                      <h3 className="font-semibold mb-2">Operating Hours</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(store.hours).map(([day, hours]: [string, any]) => (
                          hours && (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize text-muted-foreground">{day}:</span>
                              <span className="font-medium">{hours}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                  {store.policies && (
                    <div>
                      <h3 className="font-semibold mb-2">Store Policies</h3>
                      <div className="space-y-2 text-sm">
                        {store.policies.returnPolicy && (
                          <div>
                            <span className="text-muted-foreground">Return Policy: </span>
                            <span>{store.policies.returnPolicy}</span>
                          </div>
                        )}
                        {store.policies.refundPolicy && (
                          <div>
                            <span className="text-muted-foreground">Refund Policy: </span>
                            <span>{store.policies.refundPolicy}</span>
                          </div>
                        )}
                        {store.policies.deliveryAreas && store.policies.deliveryAreas.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Delivery Areas: </span>
                            <span>{store.policies.deliveryAreas.join(", ")}</span>
                          </div>
                        )}
                        {store.policies.deliveryRadius && (
                          <div>
                            <span className="text-muted-foreground">Delivery Radius: </span>
                            <span>{store.policies.deliveryRadius} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reviews Section */}
          {storeReviews && storeReviews.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Customer Reviews</h2>
              <div className="space-y-3">
                {storeReviews.slice(0, 5).map((review: any) => (
                  <Card key={review._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{review.userName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-6" />

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {productCategories.map((cat: any) => (
              <Button
                key={cat}
                variant={productCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setProductCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat === "all" ? "All" : cat}
              </Button>
            ))}
          </div>
        </motion.div>

        {products && products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products?.map((product: any) => (
              <ProductCard
                key={product._id}
                product={product}
                quantity={getProductQuantity(product._id)}
                onAdd={() => handleAddToCart(product._id)}
                onIncrease={() => handleIncrease(product._id)}
                onDecrease={() => handleDecrease(product._id)}
                hasStockAlert={hasStockAlert(product._id)}
                onToggleStockAlert={() => handleToggleStockAlert(product._id)}
              />
            ))}
          </div>
        )}

        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40"
          >
            <Button
              size="lg"
              className="w-full shadow-lg"
              onClick={() => navigate("/cart")}
            >
              View Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </Button>
          </motion.div>
        )}
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}