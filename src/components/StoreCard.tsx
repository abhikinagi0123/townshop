import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Id } from "@/convex/_generated/dataModel";

interface StoreCardProps {
  store: {
    _id: Id<"stores">;
    name: string;
    description: string;
    image: string;
    category: string;
    rating: number;
    deliveryTime: string;
    minOrder: number;
    distance?: number;
    isOpen?: boolean;
  };
}

export function StoreCard({ store }: StoreCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border bg-card"
        onClick={() => navigate(`/store/${store._id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(`/store/${store._id}`);
          }
        }}
        aria-label={`View ${store.name} store details`}
      >
        <div className="flex gap-3 p-3">
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            <img
              src={store.image}
              alt={store.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-background/95 backdrop-blur-sm px-1.5 py-0.5 rounded-md shadow-sm">
              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-bold">{store.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-sm leading-tight truncate">
                {store.name}
              </h3>
              {store.isOpen !== undefined && (
                <Badge 
                  variant={store.isOpen ? "default" : "secondary"} 
                  className={`text-[9px] px-1.5 py-0 h-4 flex-shrink-0 ${
                    store.isOpen 
                      ? "bg-green-500 hover:bg-green-600 text-white" 
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {store.isOpen ? "Open" : "Closed"}
                </Badge>
              )}
            </div>
            
            <p className="text-[11px] text-muted-foreground line-clamp-1 mb-2">
              {store.description}
            </p>
            
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{store.deliveryTime}</span>
              </div>
              {store.distance !== undefined && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{store.distance.toFixed(1)} km</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}