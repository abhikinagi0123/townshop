import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Clock, ShoppingCart, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface FlashSaleCardProps {
  sale: any;
}

export function FlashSaleCard({ sale }: FlashSaleCardProps) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");
  
  const apiAny: any = api;
  const cartItems = useQuery(apiAny.cart.get);
  const addToCart = useMutation(apiAny.cart.addItem);
  const updateQuantity = useMutation(apiAny.cart.updateQuantity);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = sale.endTime - now;
      
      if (remaining <= 0) {
        setTimeLeft("ENDED");
        clearInterval(interval);
        return;
      }
      
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [sale.endTime]);

  const percentSold = (sale.soldQuantity / sale.maxQuantity) * 100;
  const remainingStock = sale.maxQuantity - sale.soldQuantity;
  const isSoldOut = remainingStock <= 0;
  const isLowStock = remainingStock > 0 && remainingStock <= 5;

  const getProductQuantity = () => {
    const item = cartItems?.find((item: any) => item.productId === sale.productId);
    return item?.quantity || 0;
  };

  const getCartItemId = () => {
    return cartItems?.find((item: any) => item.productId === sale.productId)?._id;
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) {
      toast.error("This flash sale is sold out!");
      return;
    }
    
    try {
      await addToCart({ productId: sale.productId, quantity: 1 });
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const cartItemId = getCartItemId();
    if (!cartItemId) return;
    
    const currentQty = getProductQuantity();
    if (currentQty >= remainingStock) {
      toast.error(`Only ${remainingStock} items available!`);
      return;
    }
    
    try {
      await updateQuantity({
        cartItemId,
        quantity: currentQty + 1,
      });
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleDecrease = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const cartItemId = getCartItemId();
    if (!cartItemId) return;
    
    try {
      await updateQuantity({
        cartItemId,
        quantity: getProductQuantity() - 1,
      });
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const quantity = getProductQuantity();

  return (
    <Card 
      className={`overflow-hidden border-2 ${isSoldOut ? 'border-gray-300 bg-gray-50 opacity-75' : 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50'} cursor-pointer transition-all active:shadow-xl active:scale-[0.98]`}
      onClick={() => navigate(`/product/${sale.productId}`)}
    >
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className="relative">
            <img
              src={sale.product?.image}
              alt={sale.product?.name}
              className={`w-28 h-28 object-cover rounded-xl shadow-sm ${isSoldOut ? 'grayscale' : ''}`}
            />
            {isSoldOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <span className="text-white font-bold text-xs">SOLD OUT</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-base line-clamp-2 leading-tight flex-1 mr-2">{sale.product?.name}</h3>
              <Badge className={`gap-1 px-2 py-1 font-bold text-xs ${isSoldOut ? 'bg-gray-500' : 'bg-orange-500'}`}>
                <Zap className="h-3 w-3" />
                {sale.discountPercent}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{sale.storeName}</p>
            
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`h-3 w-3 ${isSoldOut ? 'text-gray-500' : 'text-orange-600'}`} />
              <span className={`text-xs font-semibold ${isSoldOut ? 'text-gray-500' : 'text-orange-600'}`}>
                {timeLeft}
              </span>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold">{sale.soldQuantity} sold</span>
                <span className={`font-semibold ${isLowStock && !isSoldOut ? 'text-red-600' : ''}`}>
                  {remainingStock} left {isLowStock && !isSoldOut && '🔥'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${isSoldOut ? 'bg-gray-400' : 'bg-orange-500'}`}
                  style={{ width: `${percentSold}%` }}
                />
              </div>
            </div>
            
            {quantity === 0 ? (
              <Button
                size="lg"
                className={`w-full h-11 font-semibold text-base shadow-sm ${isSoldOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                onClick={handleAddToCart}
                disabled={isSoldOut}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isSoldOut ? 'Sold Out' : 'Add to Cart'}
              </Button>
            ) : (
              <div className="flex items-center gap-3 bg-white/50 rounded-lg p-2">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleDecrease}
                  className="h-10 w-10 p-0 rounded-lg"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="flex-1 text-center font-bold text-lg">{quantity}</span>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleIncrease}
                  className="h-10 w-10 p-0 rounded-lg"
                  disabled={quantity >= remainingStock}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}