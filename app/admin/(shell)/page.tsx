"use client";
import { motion } from "framer-motion";
import { ClipboardList, Coins, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { useDB } from "@/lib/store";
import { fmt, prettyTime } from "@/lib/utils";
import { Switch } from "@/components/admin/ui";

const card = "rounded-2xl bg-white p-5 shadow-card";

/** Dashboard: KPI cards + animated OPEN/CLOSED master switch + recent orders. */
export default function Dashboard() {
  const { dishes, orders, settings, setSettings } = useDB();
  const revenue = orders.reduce((a, o) => a + o.total, 0);

  const stats = [
    { label: "Total Dishes", value: String(dishes.length), icon: UtensilsCrossed },
    { label: "Orders Today", value: String(orders.length), icon: ClipboardList },
    { label: "Revenue", value: fmt(revenue), icon: Coins },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            whileHover={{ y: -3 }} className={card} data-testid="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-500">{s.label}</p>
              <s.icon size={17} className="text-gray-400" />
            </div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight">{s.value}</p>
          </motion.div>
        ))}

        {/* Master status toggle */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className={`${card} flex items-center justify-between ${settings.isOpen ? "ring-2 ring-green-500" : "ring-2 ring-red-400"}`}
          data-testid="status-card">
          <div>
            <p className="text-sm font-semibold text-gray-500">Restaurant Status</p>
            <p className={`mt-1 text-lg font-extrabold ${settings.isOpen ? "text-green-600" : "text-red-500"}`} data-testid="status-label">
              {settings.isOpen ? "OPEN" : "CLOSED"}
            </p>
          </div>
          <Switch
            on={settings.isOpen} label="open"
            toggle={() => {
              const next = !settings.isOpen;
              setSettings({ isOpen: next });
              toast.success(next ? "Restaurant is now OPEN" : "Restaurant is now CLOSED");
            }}
          />
        </motion.div>
      </div>

      {/* Recent orders */}
      <section className={`${card} overflow-x-auto`} data-testid="recent-orders">
        <h2 className="mb-3 font-extrabold">Recent orders</h2>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No orders yet — they will appear here in real time.</p>
        ) : (
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase text-gray-400">
              <tr><th className="py-2 pr-4">ID</th><th className="py-2 pr-4">Customer</th><th className="py-2 pr-4">Total</th><th className="py-2 pr-4">Status</th><th className="py-2">Time</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.slice(0, 5).map(o => (
                <tr key={o.id}>
                  <td className="py-2.5 pr-4 font-mono text-xs">{o.id}</td>
                  <td className="py-2.5 pr-4 font-semibold">{o.customer.name}</td>
                  <td className="py-2.5 pr-4">{fmt(o.total)}</td>
                  <td className="py-2.5 pr-4"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold">{o.status}</span></td>
                  <td className="py-2.5 text-gray-500">{prettyTime(o.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
