import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Check, X } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useNavigate } from "react-router";

interface ProductComparisonProps {
  productIds: Id<"products">[];
  onClose?: () => void;
}

export function ProductComparison({ productIds, onClose }: ProductComparisonProps) {
  const navigate = useNavigate();
  const products = useQuery(api.productComparison.compareProducts, { productIds });

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading comparison...</p>
        </CardContent>
      </Card>
    );
  }

  const allSpecs = new Set<string>();
  products.forEach((p) => {
    if (p.compareSpecs) {
      Object.keys(p.compareSpecs).forEach((key) => allSpecs.add(key));
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Product Comparison</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left bg-muted">Feature</th>
                {products.map((product) => (
                  <th key={product._id} className="border p-2 text-center min-w-[200px]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <p className="font-semibold text-sm">{product.name}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-medium">Price</td>
                {products.map((product) => (
                  <td key={product._id} className="border p-2 text-center">
                    <span className="text-lg font-bold text-primary">₹{product.price}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border p-2 font-medium">Store</td>
                {products.map((product) => (
                  <td key={product._id} className="border p-2 text-center">
                    <span className="text-sm text-muted-foreground">{product.storeName}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border p-2 font-medium">Rating</td>
                {products.map((product) => (
                  <td key={product._id} className="border p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{product.avgRating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border p-2 font-medium">Stock</td>
                {products.map((product) => (
                  <td key={product._id} className="border p-2 text-center">
                    {product.inStock ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        In Stock
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        <X className="h-3 w-3 mr-1" />
                        Out of Stock
                      </Badge>
                    )}
                  </td>
                ))}
              </tr>
              {Array.from(allSpecs).map((spec) => (
                <tr key={spec}>
                  <td className="border p-2 font-medium capitalize">{spec}</td>
                  {products.map((product) => (
                    <td key={product._id} className="border p-2 text-center text-sm">
                      {product.compareSpecs?.[spec as keyof typeof product.compareSpecs]
                        ? String(product.compareSpecs[spec as keyof typeof product.compareSpecs])
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="border p-2 font-medium">Action</td>
                {products.map((product) => (
                  <td key={product._id} className="border p-2 text-center">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
