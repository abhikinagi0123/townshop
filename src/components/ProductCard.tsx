import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndianRupee, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
  };
  quantity?: number;
  onAdd: () => void;
  onIncrease?: () => void;
  onDecrease?: () => void;
}

export function ProductCard({ 
  product, 
  quantity = 0, 
  onAdd, 
  onIncrease, 
  onDecrease 
}: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex gap-3 p-3">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>
              </div>
            )}
          </div>
          <CardContent className="flex-1 p-0 flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {product.description}
              </p>
              <div className="flex items-center gap-1 font-bold text-primary">
                <IndianRupee className="h-3 w-3" />
                <span>{product.price}</span>
              </div>
            </div>
            <div className="mt-2">
              {quantity === 0 ? (
                <Button
                  size="sm"
                  onClick={onAdd}
                  disabled={!product.inStock}
                  className="w-full h-8"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              ) : (
                <div className="flex items-center gap-2 justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onDecrease}
                    className="h-8 w-8 p-0"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold min-w-[24px] text-center">
                    {quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onIncrease}
                    className="h-8 w-8 p-0"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
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