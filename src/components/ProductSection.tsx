import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { ReactNode } from "react";

interface Product {
  _id: string;
  image: string;
  name: string;
  storeName: string;
  price: number;
  storeRating?: number;
}

interface ProductSectionProps {
  title: string;
  icon: ReactNode;
  badge: string;
  products: Product[];
  showRating?: boolean;
}

export function ProductSection({ title, icon, badge, products, showRating = false }: ProductSectionProps) {
  return (
    <section className="py-4" aria-labelledby={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`} className="text-lg font-bold">{title}</h2>
        </div>
        <Badge variant="secondary" className="text-[10px] shadow-sm">{badge}</Badge>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4" role="list">
        {products.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: Math.min(0.03 * index, 0.3) }}
            className="flex-shrink-0 w-32 cursor-pointer"
            role="listitem"
            onClick={() => window.location.href = `/product/${item._id}`}
          >
            <Card className="overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 hover:border-primary/20">
              <div className="relative">
                <picture>
                  <source 
                    srcSet={item.image.replace(/\.(jpg|jpeg|png)$/i, '.webp')} 
                    type="image/webp" 
                  />
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-28 object-cover" 
                    loading="lazy"
                    decoding="async"
                    width="112"
                    height="96"
                  />
                </picture>
                {showRating && item.storeRating && (
                  <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-background/95 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                    <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    <span className="text-[9px] font-bold" aria-label={`Rating ${item.storeRating}`}>{item.storeRating}</span>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-xs font-bold line-clamp-1 mb-1">{item.name}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1">{item.storeName}</p>
                <p className="text-sm text-primary font-extrabold">₹{item.price}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
