import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, IndianRupee } from "lucide-react";
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
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 group"
        onClick={() => navigate(`/store/${store._id}`)}
      >
        <div className="relative h-48 overflow-hidden bg-muted">
          <motion.img
            src={store.image}
            alt={store.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground border shadow-sm">
            {store.category}
          </Badge>
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold">{store.rating}</span>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-1 tracking-tight group-hover:text-primary transition-colors">
            {store.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[40px]">
            {store.description}
          </p>
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{store.deliveryTime}</span>
            </div>
            {store.distance !== undefined && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="font-medium">{store.distance.toFixed(1)} km</span>
              </div>
            )}
          </div>
          {store.isOpen !== undefined && (
            <div className="mt-2 text-center">
              <Badge variant={store.isOpen ? "default" : "secondary"} className="text-xs">
                {store.isOpen ? "Open" : "Closed"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}