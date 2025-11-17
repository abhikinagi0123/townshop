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
      className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/5"
      aria-labelledby="hero-heading"
    >
      <div className="px-4 py-16 md:py-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-primary to-secondary text-white shadow-lg px-4 py-2 text-sm font-semibold">
              🚀 Fast Delivery • Same Day Available
            </Badge>
            <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Your Local Marketplace
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                All in One Place
              </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-10 leading-relaxed max-w-2xl font-medium">
              From groceries to home repairs, electronics to beauty services - discover and book everything your town offers. Support local businesses with every purchase.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <Button 
              size="lg" 
              onClick={() => isAuthenticated ? navigate("/stores") : navigate("/auth")}
              className="gap-2 min-h-[52px] min-w-[52px] px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              aria-label={isAuthenticated ? "Start shopping at stores" : "Login to start shopping"}
            >
              <Star className="h-5 w-5" aria-hidden="true" />
              Start Shopping
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                const storesSection = document.getElementById("nearby-stores");
                storesSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className="min-h-[52px] min-w-[52px] px-8 text-base font-semibold border-2 hover:bg-accent/10"
              aria-label="Scroll to nearby stores section"
            >
              Explore Stores
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-6 md:gap-8 mt-10 pt-8 border-t border-border/50"
            role="list"
            aria-label="Service highlights"
          >
            <div role="listitem" className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent mb-2" aria-label="10 to 30 minutes delivery">Fast</p>
              <p className="text-sm md:text-base text-muted-foreground font-medium">Quick Delivery</p>
            </div>
            <div role="listitem" className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent mb-2" aria-label={`${nearbyShopsCount} plus local businesses`}>{nearbyShopsCount}+</p>
              <p className="text-sm md:text-base text-muted-foreground font-medium">Local Businesses</p>
            </div>
            <div role="listitem" className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent mb-2" aria-label="100 percent local">100%</p>
              <p className="text-sm md:text-base text-muted-foreground font-medium">Local & Trusted</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" aria-hidden="true" />
      <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" aria-hidden="true" />
    </section>
  );
}
