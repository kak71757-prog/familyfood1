"use client";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { useDB } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { ding, fmt, prettyTime } from "@/lib/utils";

const STATUSES: OrderStatus[] = ["New", "Preparing", "Ready", "Delivered"];
const badge: Record<OrderStatus, string> = {
  New: "bg-blue-100 text-blue-700",
  Preparing: "bg-amber-100 text-amber-700",
  Ready: "bg-green-100 text-green-700",
  Delivered: "bg-gray-200 text-gray-600",
};

/** Order pipeline: status select per row + notification sound tester. */
export default function OrdersPage() {
  const { orders, setOrderStatus } = useDB();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Orders</h1>
        <button
          onClick={() => { ding(); toast.success("Ding! Notification sound works"); }}
          data-testid="test-sound"
          className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-extrabold text-white hover:bg-gray-800"
        >
          <BellRing size={16} /> Test Notification Sound
        </button>
      </div>

      <section className="overflow-x-auto rounded-2xl bg-white shadow-card">
        {orders.length === 0 ? (
          <p className="py-14 text-center text-sm text-gray-400" data-testid="no-orders">No orders yet.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-400">
              <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Time</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.id} data-testid="order-row">
                  <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold">{o.customer.name}</p>
                    <p className="text-xs text-gray-500">{o.customer.phone} · {o.customer.address}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{o.items.map(i => `${i.qty}x ${i.name}`).join(", ")}</p>
                  </td>
                  <td className="px-4 py-3 font-bold">{fmt(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <select
                        value={o.status}
                        onChange={e => { setOrderStatus(o.id, e.target.value as OrderStatus); toast.success(`${o.id} → ${e.target.value}`); }}
                        data-testid="status-select"
                        className={`rounded-full border-0 px-2.5 py-1.5 text-xs font-bold outline-none ${badge[o.status]}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{prettyTime(o.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
