import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  label: string;
  emoji: string;
}

interface CategoryPillsProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryPills({ categories, selectedCategory, onCategoryChange }: CategoryPillsProps) {
  return (
    <div className="py-4 -mx-4 px-4">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(cat.id)}
            className="gap-2 rounded-full px-4 h-9 whitespace-nowrap flex-shrink-0 shadow-sm hover:shadow-md transition-all"
          >
            <span className="text-sm">{cat.emoji}</span>
            <span className="text-xs">{cat.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
