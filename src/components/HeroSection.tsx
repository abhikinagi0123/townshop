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
    <section 
      className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-secondary/10 to-background"
      aria-labelledby="hero-heading"
    >
      <div className="px-4 py-12 md:py-16">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
              🚀 Fast Delivery • Same Day Available
            </Badge>
            <h1 id="hero-heading" className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
              Your Local Marketplace
              <br />
              <span className="text-primary">All Services & Products in One Place</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed max-w-xl">
              From groceries to home repairs, electronics to beauty services - discover and book everything your town offers. Support local businesses with every purchase and booking.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            <Button 
              size="lg" 
              onClick={() => isAuthenticated ? navigate("/stores") : navigate("/auth")}
              className="gap-2 min-h-[44px] min-w-[44px]"
              aria-label={isAuthenticated ? "Start shopping at stores" : "Login to start shopping"}
            >
              <Star className="h-4 w-4" aria-hidden="true" />
              Start Shopping
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                const storesSection = document.getElementById("nearby-stores");
                storesSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className="min-h-[44px] min-w-[44px]"
              aria-label="Scroll to nearby stores section"
            >
              Explore Stores
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 md:gap-6 mt-6 pt-6 border-t"
            role="list"
            aria-label="Service highlights"
          >
            <div role="listitem">
              <p className="text-2xl md:text-3xl font-bold text-primary" aria-label="10 to 30 minutes delivery">Fast</p>
              <p className="text-xs md:text-sm text-muted-foreground">Quick Delivery</p>
            </div>
            <div role="listitem">
              <p className="text-2xl md:text-3xl font-bold text-primary" aria-label={`${nearbyShopsCount} plus local businesses`}>{nearbyShopsCount}+</p>
              <p className="text-xs md:text-sm text-muted-foreground">Local Businesses</p>
            </div>
            <div role="listitem">
              <p className="text-2xl md:text-3xl font-bold text-primary" aria-label="100 percent local">100%</p>
              <p className="text-xs md:text-sm text-muted-foreground">Local & Trusted</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" aria-hidden="true" />
      <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" aria-hidden="true" />
    </section>
  );
}
