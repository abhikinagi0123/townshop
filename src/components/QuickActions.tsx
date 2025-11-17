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
    <div className="py-3">
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.05 * index }}
            className="text-center"
          >
            <div className="bg-card border rounded-xl p-3 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-1">{action.icon}</div>
              <p className="text-[10px] font-semibold leading-tight">{action.title}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}