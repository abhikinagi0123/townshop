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
    <div className="py-4">
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.05 * index }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-card to-muted/30 border rounded-2xl p-4 hover:shadow-lg hover:scale-105 transition-all duration-200">
              <div className="text-3xl mb-2">{action.icon}</div>
              <p className="text-[11px] font-bold leading-tight">{action.title}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}