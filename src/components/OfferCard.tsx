import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Percent, Truck, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Id } from "@/convex/_generated/dataModel";

interface OfferCardProps {
  offer: {
    _id: Id<"offers">;
    title: string;
    description: string;
    code?: string;
    discountPercent?: number;
    discountAmount?: number;
    type: "shop_discount" | "delivery_deal" | "site_wide";
    minOrderAmount?: number;
  };
  compact?: boolean;
}

export function OfferCard({ offer, compact = false }: OfferCardProps) {
  const getIcon = () => {
    switch (offer.type) {
      case "shop_discount":
        return <Tag className="h-4 w-4" />;
      case "delivery_deal":
        return <Truck className="h-4 w-4" />;
      case "site_wide":
        return <Percent className="h-4 w-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (offer.type) {
      case "shop_discount":
        return "Shop Offer";
      case "delivery_deal":
        return "Delivery Deal";
      case "site_wide":
        return "Site-wide";
    }
  };

  const getGradient = () => {
    switch (offer.type) {
      case "shop_discount":
        return "from-primary to-secondary";
      case "delivery_deal":
        return "from-secondary to-primary";
      case "site_wide":
        return "from-primary to-accent";
    }
  };

  const handleCopyCode = () => {
    if (offer.code) {
      navigator.clipboard.writeText(offer.code);
      toast.success("Coupon code copied!");
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-shrink-0"
      >
        <div className={`bg-gradient-to-r ${getGradient()} text-white rounded-lg px-4 py-2 flex items-center gap-3 min-w-[280px] shadow-sm`}>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm leading-tight mb-0.5">{offer.title}</h3>
              <p className="text-[10px] opacity-90 line-clamp-1">{offer.description}</p>
            </div>
          </div>
          {offer.code && (
            <div 
              className="bg-white/20 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1.5 cursor-pointer hover:bg-white/30 transition-colors flex-shrink-0"
              onClick={handleCopyCode}
            >
              <span className="font-mono font-bold text-xs">{offer.code}</span>
              <Copy className="h-3 w-3" />
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getGradient()} flex items-center justify-center text-white`}>
                {getIcon()}
              </div>
              <div>
                <h3 className="font-bold text-lg">{offer.title}</h3>
                <Badge variant="secondary" className="text-xs mt-1">
                  {getTypeLabel()}
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{offer.description}</p>
          {offer.code && (
            <div 
              className="bg-muted rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={handleCopyCode}
            >
              <div>
                <p className="text-xs text-muted-foreground mb-1">Coupon Code</p>
                <span className="font-mono font-bold">{offer.code}</span>
              </div>
              <Copy className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          {offer.minOrderAmount && (
            <p className="text-xs text-muted-foreground mt-3">
              Min. order: ₹{offer.minOrderAmount}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
