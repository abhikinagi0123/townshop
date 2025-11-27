import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndianRupee, Plus, Minus, Bell, BellOff, TrendingDown, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ProductCardProps {
  product: {
    _id: Id<"products">;
    name: string;
    description: string;
    image: string;
    price: number;
    category: string;
    inStock: boolean;
    variants?: Array<{
      name: string;
      options: string[];
    }>;
  };
  quantity?: number;
  onAdd: () => void;
  onIncrease?: () => void;
  onDecrease?: () => void;
  hasStockAlert?: boolean;
  onToggleStockAlert?: () => void;
  showDynamicPrice?: boolean;
}

export function ProductCard({ 
  product, 
  quantity = 0, 
  onAdd, 
  onIncrease, 
  onDecrease,
  hasStockAlert = false,
  onToggleStockAlert,
  showDynamicPrice = false,
}: ProductCardProps) {
  const apiAny: any = api;
  const dynamicPrice = useQuery(
    apiAny.pricing.getDynamicPrice,
    showDynamicPrice ? { productId: product._id, quantity: quantity || 1 } : "skip"
  );

  const displayPrice = dynamicPrice?.finalPrice || product.price;
  const hasSavings = dynamicPrice && dynamicPrice.savings > 0 && dynamicPrice.discounts;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="overflow-hidden active:shadow-lg transition-all border-2 hover:border-primary/20">
        <div className="flex gap-4 p-4">
          <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-muted shadow-sm">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm gap-1">
                <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>
                {onToggleStockAlert && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-6 text-[10px] px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStockAlert();
                    }}
                  >
                    {hasStockAlert ? (
                      <>
                        <BellOff className="h-3 w-3 mr-1" />
                        Remove Alert
                      </>
                    ) : (
                      <>
                        <Bell className="h-3 w-3 mr-1" />
                        Notify Me
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
            {hasSavings && (
              <Badge className="absolute top-1 right-1 bg-green-600 text-[10px] px-1">
                <TrendingDown className="h-3 w-3 mr-0.5" />
                Save ₹{Math.round(dynamicPrice.savings)}
              </Badge>
            )}
          </div>
          <CardContent className="flex-1 p-0 flex flex-col justify-between min-h-[112px]">
            <div>
              <h4 className="font-bold text-base mb-2 line-clamp-2 leading-tight">{product.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                {product.description}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 font-extrabold text-lg text-primary">
                  <IndianRupee className="h-4 w-4" />
                  <span>{displayPrice}</span>
                </div>
                {hasSavings && (
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{product.price}
                  </span>
                )}
              </div>
              {dynamicPrice?.discounts && dynamicPrice.discounts.length > 0 && dynamicPrice.discounts[0] && (
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-green-600" />
                  <span className="text-[10px] text-green-600">
                    {dynamicPrice.discounts[0].type === "bulk" && "Bulk discount"}
                    {dynamicPrice.discounts[0].type === "early_bird" && "Early bird special"}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-3">
              {quantity === 0 ? (
                <Button
                  size="lg"
                  onClick={onAdd}
                  disabled={!product.inStock}
                  className="w-full h-11 font-semibold text-base shadow-sm"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              ) : (
                <div className="flex items-center gap-3 justify-between bg-muted/50 rounded-lg p-2">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={onDecrease}
                    className="h-10 w-10 p-0 rounded-lg"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span className="font-bold text-lg min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={onIncrease}
                    className="h-10 w-10 p-0 rounded-lg"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}