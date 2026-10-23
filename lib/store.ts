"use client";
import { create } from "zustand";
import type { DB, Dish, Order, OrderStatus, Settings } from "./types";
import { seed } from "./seed";

/**
 * Single source of truth. The whole document is mirrored verbatim into
 * localStorage under `proRestaurant_v10` as { settings, dishes, orders }
 * (no wrapper objects) so exports/imports stay portable.
 */
export const LS_KEY = "proRestaurant_v10";

/** Prerender/SSR shape — always the seed so server HTML is deterministic. */
function load(): DB {
  return seed();
}

/** Client-only hydration from localStorage (called post-mount). */
function fromLS(): DB | null {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<DB>;
      if (p && p.settings && Array.isArray(p.dishes) && Array.isArray(p.orders)) {
        return { settings: p.settings, dishes: p.dishes, orders: p.orders } as DB;
      }
    }
  } catch { /* corrupted store → keep seed */ }
  return null;
}

const save = (db: DB): void => {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify({
      settings: db.settings, dishes: db.dishes, orders: db.orders,
    }));
  } catch { /* private mode — app keeps working in-memory */ }
};

interface DBStore extends DB {
  /** Applies the persisted document after mount (no hydration mismatch). */
  hydrate: () => void;
  setSettings: (patch: Partial<Settings>) => void;
  addDish: (d: Omit<Dish, "id">) => void;
  updateDish: (id: string, patch: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  addOrder: (o: Order) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  importDB: (db: DB) => void;
  clearAll: () => void;
}

export const useDB = create<DBStore>()((set, get) => ({
  ...load(),
  hydrate: () => { const db = fromLS(); if (db) set(db); },
  setSettings: patch => { const settings = { ...get().settings, ...patch }; set({ settings }); save({ ...get(), settings }); },
  addDish: d => { const dishes = [...get().dishes, { ...d, id: `d${Date.now().toString(36)}` }]; set({ dishes }); save({ ...get(), dishes }); },
  updateDish: (id, patch) => { const dishes = get().dishes.map(x => (x.id === id ? { ...x, ...patch } : x)); set({ dishes }); save({ ...get(), dishes }); },
  deleteDish: id => { const dishes = get().dishes.filter(x => x.id !== id); set({ dishes }); save({ ...get(), dishes }); },
  addOrder: o => { const orders = [o, ...get().orders]; set({ orders }); save({ ...get(), orders }); },
  setOrderStatus: (id, status) => { const orders = get().orders.map(o => (o.id === id ? { ...o, status } : o)); set({ orders }); save({ ...get(), orders }); },
  importDB: db => { set({ settings: db.settings, dishes: db.dishes, orders: db.orders }); save(get()); },
  clearAll: () => {
    const empty: DB = { settings: { ...seed().settings, restaurantName: "My Restaurant", whatsappNumber: "212600000000" }, dishes: [], orders: [] };
    set(empty); save(empty);
  },
}));

/* ------------------------------------------------------------- cart (RAM) */
interface CartStore {
  qty: Record<string, number>;
  inc: (id: string) => void;
  dec: (id: string) => void;
  clear: () => void;
}
export const useCart = create<CartStore>()((set, get) => ({
  qty: {},
  inc: id => set({ qty: { ...get().qty, [id]: (get().qty[id] ?? 0) + 1 } }),
  dec: id => {
    const n = (get().qty[id] ?? 0) - 1;
    const qty = { ...get().qty };
    if (n <= 0) delete qty[id]; else qty[id] = n;
    set({ qty });
  },
  clear: () => set({ qty: {} }),
}));

/* ------------------------------------------------------------- admin auth */
export const AUTH_KEY = "adminAuth";
export const isAuthed = (): boolean => {
  try { return window.localStorage.getItem(AUTH_KEY) === "true"; } catch { return false; }
};
export const login = (pw: string): boolean => {
  if (pw !== "1234") return false;
  try { window.localStorage.setItem(AUTH_KEY, "true"); } catch { /* noop */ }
  return true;
};
export const logout = (): void => {
  try { window.localStorage.removeItem(AUTH_KEY); } catch { /* noop */ }
};
