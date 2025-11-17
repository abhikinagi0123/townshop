import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";

interface ProductQuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export function ProductQuantitySelector({
  quantity,
  onQuantityChange,
}: ProductQuantitySelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <Label>Quantity:</Label>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="font-semibold min-w-[30px] text-center">
          {quantity}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onQuantityChange(quantity + 1)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
