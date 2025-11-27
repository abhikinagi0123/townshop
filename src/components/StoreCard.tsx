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
        className="overflow-hidden cursor-pointer active:shadow-xl active:scale-[0.98] transition-all duration-200 border-2 hover:border-primary/30 bg-card"
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
        <div className="flex gap-4 p-5">
          <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-muted shadow-md">
            <img
              src={store.image}
              alt={store.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold">{store.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-extrabold text-lg leading-tight truncate">
                {store.name}
              </h3>
              {store.isOpen !== undefined && (
                <Badge 
                  variant={store.isOpen ? "default" : "secondary"} 
                  className={`text-xs px-2 py-1 h-6 flex-shrink-0 font-semibold ${
                    store.isOpen 
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-md" 
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {store.isOpen ? "Open" : "Closed"}
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {store.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-semibold">
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