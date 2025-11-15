import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
// Type assertion to avoid deep type instantiation with React 19
const apiAny: any = api;
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Bell, 
  BellOff,
  ArrowLeft,
  Plus,
  Minus,
  Store,
  Package,
  Truck
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Id } from "@/convex/_generated/dataModel";
import { ShareButton } from "@/components/ShareButton";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const product = useQuery(apiAny.products.getById, { 
    productId: productId as Id<"products"> 
  });
  const store = product ? useQuery(apiAny.stores.getById, { 
    storeId: product.storeId 
  }) : undefined;
  const reviews = useQuery(apiAny.reviews.listByProduct, { 
    productId: productId as Id<"products"> 
  });
  const averageRating = useQuery(apiAny.reviews.getAverageRating, { 
    productId: productId as Id<"products"> 
  });
  const stockAlert = useQuery(
    apiAny.stockAlerts.checkAlert,
    isAuthenticated && productId ? { productId: productId as Id<"products"> } : "skip"
  );
  const favorites = useQuery(apiAny.favorites.list);
  
  const addToCart = useMutation(apiAny.cart.addItem);
  const toggleFavorite = useMutation(apiAny.favorites.toggle);
  const toggleStockAlert = useMutation(apiAny.stockAlerts.toggle);
  const createReview = useMutation(apiAny.reviews.create);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const isFavorited = favorites?.some((f: any) => f.productId === productId);
  const hasStockAlert = stockAlert?.hasAlert || false;
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    
    if (!product?.inStock) {
      toast.error("Product is out of stock");
      return;
    }
    
    try {
      await addToCart({ 
        productId: productId as Id<"products">, 
        quantity 
      });
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };
  
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    
    try {
      await toggleFavorite({ productId: productId as Id<"products"> });
      toast.success(isFavorited ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };
  
  const handleToggleStockAlert = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    
    try {
      await toggleStockAlert({ productId: productId as Id<"products"> });
      toast.success(hasStockAlert ? "Stock alert removed" : "Stock alert enabled");
    } catch (error) {
      toast.error("Failed to update stock alert");
    }
  };
  
  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    
    if (!reviewComment.trim()) {
      toast.error("Please write a review");
      return;
    }
    
    try {
      // Note: In production, you'd need to verify the user has ordered this product
      // For now, we'll create a placeholder orderId
      toast.error("You can only review products you've ordered");
      setShowReviewForm(false);
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };
  
  if (!product) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Loading...</p>
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
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Product Image and Basic Info */}
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                      <Badge variant="destructive" className="text-lg px-4 py-2">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                    <div className="flex items-center gap-2 mb-2">
                      {averageRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{averageRating.average.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">
                            ({averageRating.count} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="h-4 w-4" />
                    <span 
                      className="cursor-pointer hover:underline"
                      onClick={() => store && navigate(`/store/${store._id}`)}
                    >
                      {store?.name}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-3xl font-bold text-primary">
                    ₹{product.price}
                  </div>
                  
                  <p className="text-muted-foreground">{product.description}</p>
                  
                  {/* Product Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="space-y-3">
                      {product.variants.map((variant: any) => (
                        <div key={variant.name}>
                          <Label className="mb-2 block">{variant.name}</Label>
                          <Select
                            value={selectedVariants[variant.name] || ""}
                            onValueChange={(value) => 
                              setSelectedVariants(prev => ({ ...prev, [variant.name]: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${variant.name}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {variant.options.map((option: any) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Quantity Selector */}
                  {product.inStock && (
                    <div className="flex items-center gap-4">
                      <Label>Quantity:</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold min-w-[30px] text-center">
                          {quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setQuantity(quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {product.inStock ? (
                      <Button 
                        className="flex-1" 
                        size="lg"
                        onClick={handleAddToCart}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" aria-hidden="true" />
                        Add to Cart
                      </Button>
                    ) : (
                      <Button
                        className="flex-1"
                        size="lg"
                        variant={hasStockAlert ? "secondary" : "default"}
                        onClick={handleToggleStockAlert}
                      >
                        {hasStockAlert ? (
                          <>
                            <BellOff className="h-5 w-5 mr-2" />
                            Remove Alert
                          </>
                        ) : (
                          <>
                            <Bell className="h-5 w-5 mr-2" />
                            Notify Me
                          </>
                        )}
                      </Button>
                    )}
                    
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleToggleFavorite}
                      aria-label={isFavorited ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
                    >
                      <Heart 
                        className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`}
                        aria-hidden="true"
                      /><span className="sr-only">{isFavorited ? "Remove from favorites" : "Add to favorites"}</span>
                    </Button>
                    
                    <ShareButton
                      title={product.name}
                      text={`Check out ${product.name} on TownShop!`}
                      url={window.location.href}
                      variant="outline"
                      size="lg"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs for Details, Specs, Reviews */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Reviews {averageRating && `(${averageRating.count})`}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-semibold mb-2">Product Description</h3>
                    <p className="text-muted-foreground">{product.description}</p>
                  </div>
                  
                  {store && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Delivery Information
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Estimated delivery: {store.deliveryTime}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Minimum order: ₹{store.minOrder}
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="specs" className="space-y-4 mt-4">
                  {product.compareSpecs ? (
                    <div className="space-y-3">
                      {product.compareSpecs.brand && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Brand</span>
                          <span className="text-muted-foreground">{product.compareSpecs.brand}</span>
                        </div>
                      )}
                      {product.compareSpecs.weight && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Weight</span>
                          <span className="text-muted-foreground">{product.compareSpecs.weight}</span>
                        </div>
                      )}
                      {product.compareSpecs.dimensions && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Dimensions</span>
                          <span className="text-muted-foreground">{product.compareSpecs.dimensions}</span>
                        </div>
                      )}
                      {product.compareSpecs.features && product.compareSpecs.features.length > 0 && (
                        <div className="py-2">
                          <span className="font-medium block mb-2">Features</span>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {product.compareSpecs.features.map((feature: any, idx: number) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No specifications available</p>
                  )}
                </TabsContent>
                
                <TabsContent value="reviews" className="space-y-4 mt-4">
                  {averageRating && (
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{averageRating.average.toFixed(1)}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(averageRating.average)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {averageRating.count} reviews
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!showReviewForm && isAuthenticated && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowReviewForm(true)}
                    >
                      Write a Review
                    </Button>
                  )}
                  
                  {showReviewForm && (
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div>
                          <Label>Rating</Label>
                          <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Button
                                key={rating}
                                size="sm"
                                variant={reviewRating >= rating ? "default" : "outline"}
                                onClick={() => setReviewRating(rating)}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label>Your Review</Label>
                          <Textarea
                            placeholder="Share your experience with this product..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={4}
                            className="mt-2"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button onClick={handleSubmitReview} className="flex-1">
                            Submit Review
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowReviewForm(false);
                              setReviewComment("");
                              setReviewRating(5);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="space-y-4">
                    {reviews && reviews.length > 0 ? (
                      reviews.map((review: any) => (
                        <Card key={review._id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-semibold">{review.userName}</div>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {review.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No reviews yet. Be the first to review!
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}