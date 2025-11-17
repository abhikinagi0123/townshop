import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SlidersHorizontal } from "lucide-react";

interface AdvancedFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  categories: string[];
  type: "products" | "stores" | "services";
}

export function AdvancedFilters({ filters, onFiltersChange, categories, type }: AdvancedFiltersProps) {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 py-6">
          {/* Category Filter */}
          <div>
            <Label>Category</Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) => handleFilterChange("category", value === "all" ? undefined : value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range (Products only) */}
          {type === "products" && (
            <>
              <div>
                <Label>Min Price: ₹{filters.minPrice || 0}</Label>
                <Slider
                  value={[filters.minPrice || 0]}
                  onValueChange={([value]) => handleFilterChange("minPrice", value)}
                  max={10000}
                  step={100}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Max Price: ₹{filters.maxPrice || 10000}</Label>
                <Slider
                  value={[filters.maxPrice || 10000]}
                  onValueChange={([value]) => handleFilterChange("maxPrice", value)}
                  max={10000}
                  step={100}
                  className="mt-2"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>In Stock Only</Label>
                <Switch
                  checked={filters.inStock || false}
                  onCheckedChange={(checked) => handleFilterChange("inStock", checked || undefined)}
                />
              </div>
            </>
          )}

          {/* Rating Filter */}
          <div>
            <Label>Minimum Rating</Label>
            <Select
              value={filters.minRating?.toString() || "0"}
              onValueChange={(value) => handleFilterChange("minRating", value === "0" ? undefined : parseFloat(value))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any Rating</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Store-specific filters */}
          {type === "stores" && (
            <>
              <div className="flex items-center justify-between">
                <Label>Open Now</Label>
                <Switch
                  checked={filters.isOpen || false}
                  onCheckedChange={(checked) => handleFilterChange("isOpen", checked || undefined)}
                />
              </div>
              <div>
                <Label>Max Delivery Time (minutes)</Label>
                <Select
                  value={filters.maxDeliveryTime?.toString() || "any"}
                  onValueChange={(value) => handleFilterChange("maxDeliveryTime", value === "any" ? undefined : parseInt(value))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Any Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Time</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Sorting */}
          <div>
            <Label>Sort By</Label>
            <Select
              value={filters.sortBy || "relevance"}
              onValueChange={(value) => handleFilterChange("sortBy", value === "relevance" ? undefined : value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Relevance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                {type === "products" && (
                  <>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                  </>
                )}
                {type === "stores" && (
                  <>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="delivery_time">Delivery Time</SelectItem>
                    <SelectItem value="min_order">Min Order</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </>
                )}
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={clearFilters} variant="outline" className="w-full">
            Clear All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}