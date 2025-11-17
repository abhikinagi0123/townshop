import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";

export default function Services() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const apiAny: any = api;
  const categories = useQuery(apiAny.services.listCategories);
  const services = useQuery(
    apiAny.services.listByCategory,
    selectedCategory !== "all" ? { category: selectedCategory } : "skip"
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader
        search={search}
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Book Services</h1>
          </div>
          <p className="text-muted-foreground ml-15">
            Find and book local service providers in your area
          </p>
        </motion.div>

        {categories === undefined ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className="whitespace-nowrap"
              >
                All Services
              </Button>
              {categories?.map((cat: any) => (
                <Button
                  key={cat._id}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.name)}
                  className="whitespace-nowrap gap-2"
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </Button>
              ))}
            </div>

            {services === undefined ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : services && services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service: any, index: number) => (
                  <motion.div
                    key={service._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/service/${service._id}`)}
                    >
                      <CardContent className="p-0">
                        <img
                          src={service.images[0]}
                          alt={service.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg">{service.name}</h3>
                            {service.provider.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                ✓ Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {service.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">Starting from</p>
                              <p className="text-lg font-bold">₹{service.basePrice}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="text-sm font-semibold">{service.duration} min</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground mb-1">
                              {service.provider.businessName}
                            </p>
                            {service.provider.rating && (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500">★</span>
                                <span className="text-sm font-semibold">
                                  {service.provider.rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({service.provider.totalReviews} reviews)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No services found in this category</p>
              </div>
            )}
          </>
        )}
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}
