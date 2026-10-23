"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCart, useDB } from "@/lib/store";
import type { Order } from "@/lib/types";
import { fmt, uid, waLink } from "@/lib/utils";
import { EmptyCart } from "./States";

interface Errors { name?: string; phone?: string; address?: string }

/**
 * Right-side cart drawer (blurred backdrop). Lists positions with steppers,
 * money summary (subtotal / delivery fee / total) and a validated checkout
 * form whose green CTA hands the order to WhatsApp and stores it locally.
 */
export function CartDrawer({ open, close }: { open: boolean; close: () => void }) {
  const { dishes, settings, addOrder } = useDB();
  const qty = useCart(s => s.qty);
  const inc = useCart(s => s.inc);
  const dec = useCart(s => s.dec);
  const clear = useCart(s => s.clear);

  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [errs, setErrs] = useState<Errors>({});

  const lines = useMemo(
    () => Object.entries(qty).map(([id, q]) => ({ dish: dishes.find(d => d.id === id), q })).filter(l => l.dish),
    [qty, dishes],
  );
  const subtotal = lines.reduce((a, l) => a + (l.dish?.price ?? 0) * l.q, 0);
  const total = subtotal + (lines.length ? settings.deliveryFee : 0);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Phone must be exactly 10 digits";
    if (!form.address.trim()) e.address = "Address is required";
    return e;
  };

  const checkout = (): void => {
    const e = validate();
    setErrs(e);
    if (Object.keys(e).length) return;

    const order: Order = {
      id: uid(),
      customer: { ...form },
      items: lines.map(l => ({ id: l.dish!.id, name: l.dish!.name, price: l.dish!.price, qty: l.q })),
      total,
      status: "New",
      time: new Date().toISOString(),
    };
    addOrder(order);

    const items = order.items.map(i => `${i.qty}x ${i.name}`).join(", ");
    const msg = `New Order: ${items} Total: ${total} - Client: ${form.name} ${form.phone} ${form.address}`;
    window.open(waLink(settings.whatsappNumber, msg), "_blank", "noopener");

    clear();
    setForm({ name: "", phone: "", address: "", notes: "" });
    toast.success(`Order ${order.id} sent via WhatsApp`);
    close();
  };

  const field = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-black focus:bg-white";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Close cart"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-pop"
            data-testid="cart-drawer"
          >
            <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-extrabold">Your cart</h2>
              <button onClick={close} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-100"><X size={17} /></button>
            </header>

            {lines.length === 0 ? (
              <EmptyCart />
            ) : (
              <>
                <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {lines.map(({ dish, q }) => (
                    <li key={dish!.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={dish!.image} alt="" className="h-14 w-20 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{dish!.name}</p>
                        <p className="text-xs text-gray-500">{fmt(dish!.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-gray-100 px-1.5 py-1">
                        <button onClick={() => dec(dish!.id)} aria-label="Decrease" className="grid h-6 w-6 place-items-center rounded-full bg-white shadow-card"><Minus size={12} /></button>
                        <span className="min-w-4 text-center text-sm font-bold">{q}</span>
                        <button onClick={() => inc(dish!.id)} aria-label="Increase" className="grid h-6 w-6 place-items-center rounded-full bg-black text-white"><Plus size={12} /></button>
                      </div>
                    </li>
                  ))}
                </ul>

                <form
                  className="space-y-2.5 border-t border-gray-100 px-5 py-4"
                  onSubmit={e => { e.preventDefault(); checkout(); }}
                  noValidate
                >
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Delivery fee</span><span>{fmt(settings.deliveryFee)}</span></div>
                    <div className="flex justify-between text-base font-extrabold"><span>Total</span><span data-testid="cart-total">{fmt(total)}</span></div>
                    <p className="text-xs text-gray-400">Delivery time: {settings.deliveryTime}</p>
                  </div>

                  <div>
                    <input className={field} placeholder="Full Name *" value={form.name} data-testid="f-name"
                      onChange={e => setForm({ ...form, name: e.target.value })} />
                    {errs.name && <p className="mt-1 text-xs font-semibold text-red-600">{errs.name}</p>}
                  </div>
                  <div>
                    <input className={field} placeholder="Phone * (10 digits)" inputMode="numeric" value={form.phone} data-testid="f-phone"
                      onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
                    {errs.phone && <p className="mt-1 text-xs font-semibold text-red-600">{errs.phone}</p>}
                  </div>
                  <div>
                    <input className={field} placeholder="Address *" value={form.address} data-testid="f-address"
                      onChange={e => setForm({ ...form, address: e.target.value })} />
                    {errs.address && <p className="mt-1 text-xs font-semibold text-red-600">{errs.address}</p>}
                  </div>
                  <textarea className={field} placeholder="Notes (optional)" rows={2} value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })} />

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    data-testid="wa-checkout"
                    className="w-full rounded-2xl bg-green-600 py-3.5 text-base font-extrabold text-white shadow-pop transition hover:bg-green-700"
                  >
                    Order via WhatsApp
                  </motion.button>
                </form>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
