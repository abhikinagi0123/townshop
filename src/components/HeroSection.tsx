import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useNavigate } from "react-router";

interface HeroSectionProps {
  isAuthenticated?: boolean;
  nearbyShopsCount?: number;
}

export function HeroSection({ isAuthenticated, nearbyShopsCount = 0 }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background"
    >
      <div className="px-4 py-8">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge className="mb-3 bg-primary text-primary-foreground">
              🚀 Fast Delivery
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              Get Everything
              <br />
              <span className="text-primary">Delivered in Minutes</span>
            </h1>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Order from local stores and get your favorites delivered to your doorstep in 10-30 minutes. Fresh, fast, and reliable.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            <Button 
              size="lg" 
              onClick={() => isAuthenticated ? navigate("/stores") : navigate("/auth")}
              className="gap-2"
            >
              <Star className="h-4 w-4" />
              Start Shopping
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                const storesSection = document.getElementById("nearby-stores");
                storesSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore Stores
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex gap-6 mt-6 pt-6 border-t"
          >
            <div>
              <p className="text-2xl font-bold text-primary">10-30</p>
              <p className="text-xs text-muted-foreground">Min Delivery</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{nearbyShopsCount}+</p>
              <p className="text-xs text-muted-foreground">Local Stores</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">100%</p>
              <p className="text-xs text-muted-foreground">Fresh Products</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
    </motion.div>
  );
}
