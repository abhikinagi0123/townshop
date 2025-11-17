import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
const apiAny: any = api;
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Truck, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductImageSection } from "@/components/product/ProductImageSection";
import { ProductInfoSection } from "@/components/product/ProductInfoSection";
import { ProductVariantsSelector } from "@/components/product/ProductVariantsSelector";
import { ProductQuantitySelector } from "@/components/product/ProductQuantitySelector";
import { ProductActionButtons } from "@/components/product/ProductActionButtons";
import { ProductReviewsTab } from "@/components/product/ProductReviewsTab";
import { ProductQATab } from "@/components/product/ProductQATab";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const product = useQuery(apiAny.products.getById, {
    productId: productId as Id<"products">,
  });
  const store = product
    ? useQuery(apiAny.stores.getById, { storeId: product.storeId })
    : undefined;
  const reviews = useQuery(apiAny.reviews.listByProduct, {
    productId: productId as Id<"products">,
  });
  const averageRating = useQuery(apiAny.reviews.getAverageRating, {
    productId: productId as Id<"products">,
  });
  const stockAlert = useQuery(
    apiAny.stockAlerts.checkAlert,
    isAuthenticated && productId
      ? { productId: productId as Id<"products"> }
      : "skip"
  );
  const favorites = useQuery(apiAny.favorites.list);
  const productQuestions = useQuery(apiAny.productQA.listByProduct, {
    productId: productId as Id<"products">,
  });

  const addToCart = useMutation(apiAny.cart.addItem);
  const toggleFavorite = useMutation(apiAny.favorites.toggle);
  const toggleStockAlert = useMutation(apiAny.stockAlerts.toggle);
  const askQuestion = useMutation(apiAny.productQA.askQuestion);
  const createPriceAlert = useMutation(apiAny.priceDropAlerts.create);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [targetPrice, setTargetPrice] = useState("");
  const [showPriceAlert, setShowPriceAlert] = useState(false);

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
        quantity,
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

  const handleSubmitReview = async (rating: number, comment: string, orderId?: string) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }
    if (!orderId) {
      toast.error("You can only review products you've ordered");
      return;
    }
    // This would be called from the orders page with a valid orderId
    toast.error("You can only review products you've ordered");
  };

  const handleAskQuestion = async (question: string) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    try {
      await askQuestion({
        productId: productId as Id<"products">,
        question,
      });
      toast.success("Question posted!");
    } catch (error) {
      toast.error("Failed to post question");
    }
  };

  const handleSetPriceAlert = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    const price = parseFloat(targetPrice);
    if (!price || price <= 0 || price >= (product?.price || 0)) {
      toast.error("Please enter a valid target price below current price");
      return;
    }
    try {
      await createPriceAlert({
        productId: productId as Id<"products">,
        targetPrice: price,
      });
      toast.success("Price alert set!");
      setTargetPrice("");
      setShowPriceAlert(false);
    } catch (error) {
      toast.error("Failed to set price alert");
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

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const currentParams = new URLSearchParams(window.location.search);
            const existingProducts = currentParams.get("products")?.split(",") || [];
            if (productId && !existingProducts.includes(productId)) {
              existingProducts.push(productId);
            }
            navigate(`/compare?products=${existingProducts.join(",")}`);
          }}
          className="mb-4"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compare
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <ProductImageSection
                  image={product.image}
                  name={product.name}
                  inStock={product.inStock}
                />

                <div className="space-y-4">
                  <ProductInfoSection
                    name={product.name}
                    category={product.category}
                    price={product.price}
                    description={product.description}
                    averageRating={averageRating}
                    store={store}
                    onSetPriceAlert={() => setShowPriceAlert(true)}
                  />

                  <ProductVariantsSelector
                    variants={product.variants}
                    selectedVariants={selectedVariants}
                    onVariantChange={(name, value) =>
                      setSelectedVariants((prev) => ({ ...prev, [name]: value }))
                    }
                  />

                  {product.inStock && (
                    <ProductQuantitySelector
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                    />
                  )}

                  <ProductActionButtons
                    inStock={product.inStock}
                    isFavorited={isFavorited}
                    hasStockAlert={hasStockAlert}
                    productName={product.name}
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleStockAlert={handleToggleStockAlert}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Reviews {averageRating && `(${averageRating.count})`}
                  </TabsTrigger>
                  <TabsTrigger value="qa">
                    Q&A {productQuestions && `(${productQuestions.length})`}
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
                          <span className="text-muted-foreground">
                            {product.compareSpecs.brand}
                          </span>
                        </div>
                      )}
                      {product.compareSpecs.weight && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Weight</span>
                          <span className="text-muted-foreground">
                            {product.compareSpecs.weight}
                          </span>
                        </div>
                      )}
                      {product.compareSpecs.dimensions && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Dimensions</span>
                          <span className="text-muted-foreground">
                            {product.compareSpecs.dimensions}
                          </span>
                        </div>
                      )}
                      {product.compareSpecs.features &&
                        product.compareSpecs.features.length > 0 && (
                          <div className="py-2">
                            <span className="font-medium block mb-2">Features</span>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              {product.compareSpecs.features.map(
                                (feature: any, idx: number) => (
                                  <li key={idx}>{feature}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No specifications available</p>
                  )}
                </TabsContent>

                <TabsContent value="reviews">
                  <ProductReviewsTab
                    reviews={reviews}
                    averageRating={averageRating}
                    isAuthenticated={isAuthenticated}
                    onSubmitReview={handleSubmitReview}
                  />
                </TabsContent>

                <TabsContent value="qa">
                  <ProductQATab
                    questions={productQuestions}
                    isAuthenticated={isAuthenticated}
                    onAskQuestion={handleAskQuestion}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={showPriceAlert} onOpenChange={setShowPriceAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Price Drop Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Current Price: ₹{product.price}</Label>
              <Input
                type="number"
                placeholder="Enter target price"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You'll be notified when the price drops to or below this amount
              </p>
            </div>
            <Button onClick={handleSetPriceAlert} className="w-full">
              Set Alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}