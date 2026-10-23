"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDB } from "@/lib/store";
import { Header } from "@/components/client/Header";
import { CategoryPills } from "@/components/client/CategoryPills";
import { DishCard } from "@/components/client/DishCard";
import { CartDrawer } from "@/components/client/CartDrawer";
import { InstallButton } from "@/components/client/InstallButton";
import { NoResults, SkeletonGrid } from "@/components/client/States";

/** Client storefront — menu-first, WhatsApp checkout, zero admin surface. */
export default function Storefront() {
  const { dishes, settings } = useDB();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);

  /* Brief skeleton pass so first paint never jumps (perceived performance). */
  useEffect(() => { const t = setTimeout(() => setLoading(false), 450); return () => clearTimeout(t); }, []);

  /* Offline-first PWA: register the worker as soon as the store mounts.
     (sw.js is ~1 KB; fetching it never competes with the LCP image.) */
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !location.protocol.startsWith("http")) return;
    navigator.serviceWorker.register("./sw.js").catch(() => undefined);
  }, []);

  const cats = useMemo(() => ["All", ...Array.from(new Set(dishes.map(d => d.category)))], [dishes]);
  const visible = useMemo(() => dishes.filter(d =>
    (cat === "All" || d.category === cat) &&
    (query.trim() === "" || d.name.toLowerCase().includes(query.trim().toLowerCase())),
  ), [dishes, cat, query]);

  return (
    <div className="min-h-screen bg-white">
      <Header query={query} setQuery={setQuery} openCart={() => setCartOpen(true)} />

      {/* Closed banner — business rule driven by settings.isOpen */}
      {!settings.isOpen && (
        <motion.div
          initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-red-600 py-2.5 text-center text-sm font-bold text-white"
          data-testid="closed-banner"
        >
          We are currently closed
        </motion.div>
      )}

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-5">
        <div className="mb-4">
          <CategoryPills cats={cats} active={cat} pick={setCat} />
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : visible.length === 0 ? (
          <NoResults />
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="menu-grid">
            {visible.map(d => <DishCard key={d.id} dish={d} />)}
          </motion.div>
        )}
      </main>

      <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-400">
        Powered by <span className="font-bold text-gray-600">ProRestaurant SaaS</span> · {settings.restaurantName} · {settings.deliveryTime}
      </footer>

      <CartDrawer open={cartOpen} close={() => setCartOpen(false)} />
      <InstallButton />
    </div>
  );
}
