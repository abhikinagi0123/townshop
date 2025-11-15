import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  category?: string;
  inStock?: boolean;
  sortBy?: string;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories?: string[];
  type?: "products" | "stores";
}

export function AdvancedFilters({ filters, onFiltersChange, categories = [], type = "products" }: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key as keyof FilterOptions] !== undefined
  ).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1">
                <X className="h-3 w-3" />
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {type === "products" && (
            <>
              <div className="space-y-3">
                <Label>Price Range</Label>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={5000}
                    step={50}
                    value={[localFilters.minPrice || 0, localFilters.maxPrice || 5000]}
                    onValueChange={([min, max]) => {
                      setLocalFilters({ ...localFilters, minPrice: min, maxPrice: max });
                    }}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹{localFilters.minPrice || 0}</span>
                    <span>₹{localFilters.maxPrice || 5000}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Stock Availability</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Stock Only</span>
                  <Switch
                    checked={localFilters.inStock || false}
                    onCheckedChange={(checked) => {
                      setLocalFilters({ ...localFilters, inStock: checked || undefined });
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-3">
            <Label>Minimum Rating</Label>
            <Select
              value={localFilters.minRating?.toString() || "0"}
              onValueChange={(value) => {
                const rating = parseFloat(value);
                setLocalFilters({ ...localFilters, minRating: rating > 0 ? rating : undefined });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any rating</SelectItem>
                <SelectItem value="3">3+ ⭐</SelectItem>
                <SelectItem value="3.5">3.5+ ⭐</SelectItem>
                <SelectItem value="4">4+ ⭐</SelectItem>
                <SelectItem value="4.5">4.5+ ⭐</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {categories.length > 0 && (
            <div className="space-y-3">
              <Label>Category</Label>
              <Select
                value={localFilters.category || "all"}
                onValueChange={(value) => {
                  setLocalFilters({ ...localFilters, category: value === "all" ? undefined : value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3">
            <Label>Sort By</Label>
            <Select
              value={localFilters.sortBy || "relevance"}
              onValueChange={(value) => {
                setLocalFilters({ ...localFilters, sortBy: value === "relevance" ? undefined : value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Relevance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                {type === "products" ? (
                  <>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="delivery_time">Delivery Time</SelectItem>
                    <SelectItem value="min_order">Minimum Order</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
