import { motion } from "framer-motion";

interface QuickAction {
  title: string;
  icon: string;
  desc: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="py-6">
      <div className="grid grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            className="text-center cursor-pointer"
          >
            <div className="bg-gradient-to-br from-card via-card to-primary/5 border-2 border-border/50 rounded-2xl p-6 shadow-md active:shadow-xl active:border-primary/30 active:scale-[0.98] transition-all duration-200 min-h-[120px] flex flex-col items-center justify-center">
              <div className="text-5xl mb-3">{action.icon}</div>
              <p className="text-sm font-bold leading-tight text-foreground">{action.title}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}