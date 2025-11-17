import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

interface FlashSaleCardProps {
  sale: any;
}

export function FlashSaleCard({ sale }: FlashSaleCardProps) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");

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

  return (
    <Card className="overflow-hidden border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-red-50">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <img
            src={sale.product?.image}
            alt={sale.product?.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-bold text-sm line-clamp-1">{sale.product?.name}</h3>
              <Badge className="bg-orange-500 gap-1">
                <Zap className="h-3 w-3" />
                {sale.discountPercent}% OFF
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{sale.storeName}</p>
            
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3 w-3 text-orange-600" />
              <span className="text-xs font-semibold text-orange-600">{timeLeft}</span>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span>{sale.soldQuantity} sold</span>
                <span>{sale.maxQuantity - sale.soldQuantity} left</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${percentSold}%` }}
                />
              </div>
            </div>
            
            <Button
              size="sm"
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => navigate(`/product/${sale.productId}`)}
            >
              Grab Deal
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
