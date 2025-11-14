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
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate(`/store/${store._id}`)}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={store.image}
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-2 right-2 bg-white text-black">
            {store.category}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-1">{store.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
            {store.description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{store.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{store.deliveryTime}</span>
            </div>
            {store.minOrder > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <IndianRupee className="h-3 w-3" />
                <span>{store.minOrder} min</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
