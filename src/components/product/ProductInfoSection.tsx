import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, Store, Bell } from "lucide-react";
import { useNavigate } from "react-router";

interface ProductInfoSectionProps {
  name: string;
  category: string;
  price: number;
  description: string;
  averageRating?: { average: number; count: number };
  store?: { _id: string; name: string };
  onSetPriceAlert: () => void;
}

export function ProductInfoSection({
  name,
  category,
  price,
  description,
  averageRating,
  store,
  onSetPriceAlert,
}: ProductInfoSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">{name}</h1>
        <div className="flex items-center gap-2 mb-2">
          {averageRating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{averageRating.average.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({averageRating.count} reviews)
              </span>
            </div>
          )}
        </div>
        <Badge variant="secondary">{category}</Badge>
      </div>

      {store && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Store className="h-4 w-4" />
          <span
            className="cursor-pointer hover:underline"
            onClick={() => navigate(`/store/${store._id}`)}
          >
            {store.name}
          </span>
        </div>
      )}

      <Separator />

      <div className="text-3xl font-bold text-primary">₹{price}</div>

      <Button
        variant="outline"
        size="sm"
        onClick={onSetPriceAlert}
        className="w-full"
      >
        <Bell className="h-4 w-4 mr-2" />
        Set Price Alert
      </Button>

      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
