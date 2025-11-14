import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

interface StoreCardProps {
  store: {
    _id: string;
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
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border group bg-card"
        onClick={() => navigate(`/store/${store._id}`)}
      >
        <div className="relative h-44 overflow-hidden bg-muted">
          <motion.img
            src={store.image}
            alt={store.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Category Badge */}
          <Badge className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm text-foreground border-0 shadow-md font-medium">
            {store.category}
          </Badge>
          
          {/* Rating */}
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-background/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-md">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold">{store.rating}</span>
          </div>

          {/* Open/Closed Status */}
          {store.isOpen !== undefined && (
            <div className="absolute bottom-3 left-3">
              <Badge 
                variant={store.isOpen ? "default" : "secondary"} 
                className={`text-xs font-semibold shadow-md ${
                  store.isOpen 
                    ? "bg-green-500 hover:bg-green-600 text-white" 
                    : "bg-gray-500 text-white"
                }`}
              >
                {store.isOpen ? "Open" : "Closed"}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-1.5 tracking-tight group-hover:text-primary transition-colors line-clamp-1">
            {store.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[40px]">
            {store.description}
          </p>
          
          <div className="flex items-center justify-between text-sm pt-3 border-t">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{store.deliveryTime}</span>
            </div>
            {store.distance !== undefined && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{store.distance.toFixed(1)} km</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}