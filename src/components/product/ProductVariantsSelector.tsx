import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Variant {
  name: string;
  options: string[];
}

interface ProductVariantsSelectorProps {
  variants?: Variant[];
  selectedVariants: Record<string, string>;
  onVariantChange: (name: string, value: string) => void;
}

export function ProductVariantsSelector({
  variants,
  selectedVariants,
  onVariantChange,
}: ProductVariantsSelectorProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-3">
      {variants.map((variant) => (
        <div key={variant.name}>
          <Label className="mb-2 block">{variant.name}</Label>
          <Select
            value={selectedVariants[variant.name] || ""}
            onValueChange={(value) => onVariantChange(variant.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${variant.name}`} />
            </SelectTrigger>
            <SelectContent>
              {variant.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
