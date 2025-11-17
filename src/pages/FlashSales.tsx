import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { ArrowLeft, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashSaleCard } from "@/components/FlashSaleCard";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export default function FlashSales() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const apiAny: any = api;
  const flashSales = useQuery(apiAny.flashSales.list);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Flame className="h-5 w-5 text-orange-500" />
            <h1 className="text-xl font-bold">Flash Sales</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!flashSales || flashSales.length === 0 ? (
          <div className="text-center py-12">
            <Flame className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active flash sales at the moment</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon for amazing deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashSales.map((sale: any, index: number) => (
              <motion.div
                key={sale._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <FlashSaleCard sale={sale} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}
