import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X, Star, ShoppingCart, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { Id } from "@/convex/_generated/dataModel";

export default function ProductComparison() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const productIds = searchParams.get("products")?.split(",").filter(Boolean) || [];
  const apiAny: any = api;
  
  const comparisonData = useQuery(
    apiAny.productComparison.compareProducts,
    productIds.length >= 2 ? { productIds: productIds as Id<"products">[] } : "skip"
  );

  const removeProduct = (productId: string) => {
    const newIds = productIds.filter(id => id !== productId);
    if (newIds.length > 0) {
      setSearchParams({ products: newIds.join(",") });
    } else {
      navigate("/search");
    }
  };

  const getComparisonRows = () => {
    if (!comparisonData || comparisonData.length === 0) return [];

    return [
      {
        label: "Image",
        type: "image",
        values: comparisonData.map((p: any) => p?.image || "")
      },
      {
        label: "Name",
        type: "text",
        values: comparisonData.map((p: any) => p?.name || "N/A")
      },
      {
        label: "Price",
        type: "price",
        values: comparisonData.map((p: any) => p?.price || 0)
      },
      {
        label: "Store",
        type: "text",
        values: comparisonData.map((p: any) => p?.storeName || "Unknown")
      },
      {
        label: "Category",
        type: "text",
        values: comparisonData.map((p: any) => p?.category || "N/A")
      },
      {
        label: "Rating",
        type: "rating",
        values: comparisonData.map((p: any) => p?.avgRating || 0)
      },
      {
        label: "Reviews",
        type: "number",
        values: comparisonData.map((p: any) => p?.reviewCount || 0)
      },
      {
        label: "Stock",
        type: "stock",
        values: comparisonData.map((p: any) => p?.inStock || false)
      },
      {
        label: "Description",
        type: "text",
        values: comparisonData.map((p: any) => p?.description || "N/A")
      }
    ];
  };

  const getBestValue = (type: string, values: any[]) => {
    if (type === "price") {
      const minPrice = Math.min(...values.filter(v => v > 0));
      return values.map(v => v === minPrice);
    }
    if (type === "rating") {
      const maxRating = Math.max(...values);
      return values.map(v => v === maxRating && v > 0);
    }
    return values.map(() => false);
  };

  if (productIds.length < 2) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Products to Compare</h2>
            <p className="text-muted-foreground mb-6">
              Add at least 2 products to start comparing
            </p>
            <Button onClick={() => navigate("/search")}>
              Browse Products
            </Button>
          </div>
        </div>
        <MobileBottomNav isAuthenticated={isAuthenticated} />
      </div>
    );
  }

  const rows = getComparisonRows();

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Product Comparison ({comparisonData?.length || 0})
              </CardTitle>
            </CardHeader>
          </Card>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-background z-10 p-4 text-left font-semibold border-b">
                    Feature
                  </th>
                  {comparisonData?.map((product: any, idx: number) => (
                    <th key={product?._id || idx} className="p-4 border-b min-w-[250px]">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(product?._id || "")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => {
                  const bestValues = getBestValue(row.type, row.values);
                  
                  return (
                    <tr key={rowIdx} className="border-b hover:bg-muted/50">
                      <td className="sticky left-0 bg-background z-10 p-4 font-medium">
                        {row.label}
                      </td>
                      {row.values.map((value: any, colIdx: number) => (
                        <td key={colIdx} className="p-4 text-center">
                          {row.type === "image" && (
                            <img
                              src={value}
                              alt="Product"
                              className="w-32 h-32 object-cover rounded-lg mx-auto"
                            />
                          )}
                          {row.type === "text" && (
                            <span className={bestValues[colIdx] ? "font-semibold text-primary" : ""}>
                              {value}
                            </span>
                          )}
                          {row.type === "price" && (
                            <span className={`text-lg font-bold ${bestValues[colIdx] ? "text-green-600" : ""}`}>
                              ₹{value}
                              {bestValues[colIdx] && (
                                <Badge variant="default" className="ml-2">Best Price</Badge>
                              )}
                            </span>
                          )}
                          {row.type === "rating" && (
                            <div className="flex items-center justify-center gap-1">
                              <Star className={`h-4 w-4 ${bestValues[colIdx] ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"}`} />
                              <span className={bestValues[colIdx] ? "font-semibold text-primary" : ""}>
                                {value.toFixed(1)}
                              </span>
                            </div>
                          )}
                          {row.type === "number" && (
                            <span>{value}</span>
                          )}
                          {row.type === "stock" && (
                            <Badge variant={value ? "default" : "destructive"}>
                              {value ? "In Stock" : "Out of Stock"}
                            </Badge>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr>
                  <td className="sticky left-0 bg-background z-10 p-4 font-medium">
                    Actions
                  </td>
                  {comparisonData?.map((product: any) => (
                    <td key={product?._id} className="p-4">
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => navigate(`/product/${product?._id}`)}
                          className="w-full"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/product/${product?._id}`)}
                          className="w-full"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}
