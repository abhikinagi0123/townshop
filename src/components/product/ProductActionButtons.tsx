import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Bell, BellOff } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";

interface ProductActionButtonsProps {
  inStock: boolean;
  isFavorited: boolean;
  hasStockAlert: boolean;
  productName: string;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  onToggleStockAlert: () => void;
}

export function ProductActionButtons({
  inStock,
  isFavorited,
  hasStockAlert,
  productName,
  onAddToCart,
  onToggleFavorite,
  onToggleStockAlert,
}: ProductActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {inStock ? (
        <Button
          className="flex-1"
          size="lg"
          onClick={onAddToCart}
          aria-label={`Add ${productName} to cart`}
        >
          <ShoppingCart className="h-5 w-5 mr-2" aria-hidden="true" />
          Add to Cart
        </Button>
      ) : (
        <Button
          className="flex-1"
          size="lg"
          variant={hasStockAlert ? "secondary" : "default"}
          onClick={onToggleStockAlert}
        >
          {hasStockAlert ? (
            <>
              <BellOff className="h-5 w-5 mr-2" />
              Remove Alert
            </>
          ) : (
            <>
              <Bell className="h-5 w-5 mr-2" />
              Notify Me
            </>
          )}
        </Button>
      )}

      <Button
        size="lg"
        variant="outline"
        onClick={onToggleFavorite}
        aria-label={
          isFavorited
            ? `Remove ${productName} from favorites`
            : `Add ${productName} to favorites`
        }
      >
        <Heart
          className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
          aria-hidden="true"
        />
        <span className="sr-only">
          {isFavorited ? "Remove from favorites" : "Add to favorites"}
        </span>
      </Button>

      <ShareButton
        title={productName}
        text={`Check out ${productName} on TownShop!`}
        url={window.location.href}
        variant="outline"
        size="lg"
      />
    </div>
  );
}
