"use client";
import { ShoppingCart, Search, Store } from "lucide-react";
import { motion } from "framer-motion";
import { useCart, useDB } from "@/lib/store";

/** Sticky storefront header: brand · search · live status + cart badge. */
export function Header({ query, setQuery, openCart }: {
  query: string; setQuery: (v: string) => void; openCart: () => void;
}) {
  const { settings } = useDB();
  const count = Object.values(useCart(s => s.qty)).reduce((a, b) => a + b, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        {/* Brand */}
        <a href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-black text-white"><Store size={18} /></span>
          <span className="hidden text-lg font-extrabold tracking-tight sm:block">{settings.restaurantName}</span>
        </a>

        {/* Search */}
        <label className="relative mx-auto w-full max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search dishes…"
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-black focus:bg-white"
          />
        </label>

        {/* Status + cart */}
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-1.5 text-xs font-bold md:flex" data-testid="open-dot">
            <span className={`h-2.5 w-2.5 rounded-full ${settings.isOpen ? "bg-green-500" : "bg-red-500"}`} />
            {settings.isOpen ? "OPEN" : "CLOSED"}
          </span>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={openCart}
            aria-label="Open cart"
            data-testid="cart-btn"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-black text-white"
          >
            <ShoppingCart size={18} />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-green-600 px-1 text-[11px] font-bold"
                data-testid="cart-badge"
              >
                {count}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
