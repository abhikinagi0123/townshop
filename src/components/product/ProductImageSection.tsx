import { Badge } from "@/components/ui/badge";

interface ProductImageSectionProps {
  image: string;
  name: string;
  inStock: boolean;
}

export function ProductImageSection({ image, name, inStock }: ProductImageSectionProps) {
  return (
    <div className="relative">
      <img
        src={image}
        alt={name}
        className="w-full h-80 object-cover rounded-lg"
      />
      {!inStock && (
        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
          <Badge variant="destructive" className="text-lg px-4 py-2">
            Out of Stock
          </Badge>
        </div>
      )}
    </div>
  );
}
