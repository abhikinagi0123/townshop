import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Type assertion to avoid deep type instantiation with React 19
const apiAny: any = api;
import { useNavigate, useSearchParams } from "react-router";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon, Store, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StoreCard } from "@/components/StoreCard";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AdvancedFilters } from "@/components/AdvancedFilters";

const categories = ["Grocery", "Food", "Pharmacy", "Electronics"];

export default function Search() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [productFilters, setProductFilters] = useState<any>({});
  const [storeFilters, setStoreFilters] = useState<any>({});
  
  const stores = useQuery(
    apiAny.stores.search, 
    searchTerm ? { term: searchTerm, filters: storeFilters } : "skip"
  );
  const products = useQuery(
    apiAny.products.search, 
    searchTerm ? { query: searchTerm, filters: productFilters, sortBy: productFilters.sortBy } : "skip"
  );

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchTerm(q);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  const hasResults = (stores && stores.length > 0) || (products && products.length > 0);
  const showResults = searchTerm.trim().length > 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-4"
        >
          <form onSubmit={handleSearch}>
            <div className="relative max-w-2xl">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for stores, products, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base shadow-sm"
                autoFocus
              />
            </div>
          </form>
        </motion.div>

        {!showResults ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">
              Search for stores and products
            </p>
          </motion.div>
        ) : stores === undefined || products === undefined ? (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Searching...</p>
            </div>
          </div>
        ) : !hasResults ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try searching with different keywords
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {stores && stores.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Stores</h2>
                    <Badge variant="secondary">{stores.length}</Badge>
                  </div>
                  <AdvancedFilters
                    filters={storeFilters}
                    onFiltersChange={setStoreFilters}
                    categories={categories}
                    type="stores"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {stores.map((store: any, index: number) => (
                    <motion.div
                      key={store._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <StoreCard store={store} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {products && products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Products</h2>
                    <Badge variant="secondary">{products.length}</Badge>
                  </div>
                  <AdvancedFilters
                    filters={productFilters}
                    onFiltersChange={setProductFilters}
                    categories={categories}
                    type="products"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map((product: any, index: number) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <div className="relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-t-lg"
                            loading="lazy"
                          />
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                              <Badge variant="secondary">Out of Stock</Badge>
                            </div>
                          )}
                          {product.stockQuantity !== undefined && product.stockQuantity <= (product.lowStockThreshold || 10) && product.inStock && (
                            <Badge className="absolute top-2 right-2 bg-orange-500">
                              Only {product.stockQuantity} left
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                            {product.storeName}
                          </p>
                          <p className="text-sm font-bold text-primary">₹{product.price}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}