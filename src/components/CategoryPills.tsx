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
    <div className="py-6 -mx-4 px-4">
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(cat.id)}
            className={`gap-2 rounded-full px-5 h-10 whitespace-nowrap flex-shrink-0 font-semibold transition-all duration-200 ${
              selectedCategory === cat.id 
                ? "shadow-lg scale-105" 
                : "shadow-sm hover:shadow-md hover:scale-102 border-2"
            }`}
          >
            <span className="text-base">{cat.emoji}</span>
            <span className="text-sm">{cat.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
