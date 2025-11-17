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
        <h2 className="text-base font-bold">Browse Services & Products</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.03 * index }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 w-28 cursor-pointer"
          >
            <div className={`bg-gradient-to-br ${cat.color} rounded-2xl p-5 text-white text-center h-28 flex flex-col items-center justify-center shadow-lg active:shadow-xl transition-all`}>
              <div className="text-4xl mb-2">{cat.emoji}</div>
              <p className="text-xs font-bold leading-tight">{cat.name}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
