"use client";
import { motion } from "framer-motion";

/** Horizontal scroll rail of category pills (active = black/white). */
export function CategoryPills({ cats, active, pick }: {
  cats: string[]; active: string; pick: (c: string) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" data-testid="cat-rail">
      {cats.map(c => (
        <motion.button
          key={c}
          whileTap={{ scale: 0.94 }}
          onClick={() => pick(c)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            active === c ? "bg-black text-white" : "bg-white text-gray-700 shadow-card hover:bg-gray-100"}`}
        >
          {c}
        </motion.button>
      ))}
    </div>
  );
}
