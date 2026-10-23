"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import type { Dish } from "@/lib/types";
import { fmt } from "@/lib/utils";
import { useCart, useDB } from "@/lib/store";

/**
 * Menu card — 16:9 hero image, bold name, gray description, large price and a
 * "+" that morphs into a quantity stepper. Unavailable dishes get an overlay
 * and their controls are disabled. When the restaurant is closed every add
 * control is disabled at 50% opacity (business rule from settings.isOpen).
 */
export function DishCard({ dish }: { dish: Dish }) {
  const qty = useCart(s => s.qty[dish.id] ?? 0);
  const inc = useCart(s => s.inc);
  const dec = useCart(s => s.dec);
  const closed = !useDB(s => s.settings.isOpen);
  const disabled = closed || !dish.available;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card"
      data-testid="dish-card"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dish.image} alt={dish.name} loading="lazy" className="h-full w-full object-cover" />
        <AnimatePresence>
          {!dish.available && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm"
            >
              <span className="rounded-full bg-black px-4 py-1.5 text-sm font-bold text-white">Unavailable</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-bold leading-snug">{dish.name}</h3>
        <p className="line-clamp-2 text-sm text-gray-500">{dish.description}</p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="text-xl font-extrabold tracking-tight" data-testid="dish-price">{fmt(dish.price)}</span>

          <AnimatePresence mode="wait" initial={false}>
            {qty === 0 ? (
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                whileTap={{ scale: 0.88 }}
                disabled={disabled}
                onClick={() => inc(dish.id)}
                aria-label={`Add ${dish.name}`}
                data-testid="add-btn"
                className={`grid h-10 w-10 place-items-center rounded-full bg-black text-white shadow-pop ${disabled ? "opacity-50" : ""}`}
              >
                <Plus size={18} />
              </motion.button>
            ) : (
              <motion.div
                key="step"
                initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                className="flex items-center gap-3 rounded-full bg-black px-2 py-1.5 text-white"
                data-testid="qty-step"
              >
                <button onClick={() => dec(dish.id)} aria-label="Decrease" className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/15"><Minus size={14} /></button>
                <span className="min-w-4 text-center text-sm font-bold">{qty}</span>
                <button onClick={() => inc(dish.id)} disabled={closed} aria-label="Increase" className={`grid h-6 w-6 place-items-center rounded-full hover:bg-white/15 ${closed ? "opacity-50" : ""}`}><Plus size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}
