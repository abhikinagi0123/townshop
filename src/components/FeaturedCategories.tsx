import { motion } from "framer-motion";

interface FeaturedCategory {
  name: string;
  emoji: string;
  color: string;
}

interface FeaturedCategoriesProps {
  categories: FeaturedCategory[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold">Shop by Category</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.03 * index }}
            className="flex-shrink-0 w-24"
          >
            <div className={`bg-gradient-to-br ${cat.color} rounded-2xl p-4 text-white text-center h-24 flex flex-col items-center justify-center shadow-md`}>
              <div className="text-3xl mb-1">{cat.emoji}</div>
              <p className="text-[10px] font-semibold leading-tight">{cat.name}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
