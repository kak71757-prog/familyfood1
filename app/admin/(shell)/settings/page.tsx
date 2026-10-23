"use client";
import { Download, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LS_KEY, useDB } from "@/lib/store";
import type { DB } from "@/lib/types";
import { ConfirmDialog } from "@/components/admin/ui";

const input = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-black focus:bg-white";

/** Store settings + portable data actions (export / import / clear). */
export default function SettingsPage() {
  const { settings, setSettings, importDB, clearAll } = useDB();
  const [form, setForm] = useState({ ...settings });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Keep the draft in sync when settings change elsewhere (e.g. dashboard). */
  useEffect(() => { setForm({ ...settings }); }, [settings]);

  const save = (): void => {
    const e: Record<string, string> = {};
    if (!form.restaurantName.trim()) e.restaurantName = "Restaurant name is required";
    if (!/^212\d{9,12}$/.test(form.whatsappNumber.trim())) e.whatsappNumber = "WhatsApp number must start with 212… (e.g. 212669928434)";
    if (!Number.isFinite(Number(form.deliveryFee)) || Number(form.deliveryFee) < 0) e.deliveryFee = "Enter a valid fee";
    if (!form.deliveryTime.trim()) e.deliveryTime = "Enter a delivery time (e.g. 30-45 min)";
    setErrs(e);
    if (Object.keys(e).length) return;
    setSettings({ ...form, deliveryFee: Number(form.deliveryFee) });
    toast.success("Settings saved");
  };

  const exportJSON = (): void => {
    const blob = new Blob([JSON.stringify({ settings, dishes: useDB.getState().dishes, orders: useDB.getState().orders }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${LS_KEY}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Backup exported");
  };

  const importJSON = (file: File): void => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const p = JSON.parse(String(reader.result)) as Partial<DB>;
        if (!p.settings || !Array.isArray(p.dishes) || !Array.isArray(p.orders)) throw new Error("shape");
        importDB({ settings: p.settings, dishes: p.dishes, orders: p.orders });
        toast.success("Data imported");
      } catch { toast.error("Invalid backup file"); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-extrabold">Settings</h1>

      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-card">
        <div>
          <label className="mb-1 block text-sm font-bold">Restaurant Name *</label>
          <input className={input} value={form.restaurantName} data-testid="set-name"
            onChange={e => setForm({ ...form, restaurantName: e.target.value })} />
          {errs.restaurantName && <p className="mt-1 text-xs font-semibold text-red-600">{errs.restaurantName}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold">WhatsApp Number * (212…)</label>
          <input className={input} inputMode="numeric" value={form.whatsappNumber} data-testid="set-wa"
            onChange={e => setForm({ ...form, whatsappNumber: e.target.value.replace(/\D/g, "") })} />
          {errs.whatsappNumber && <p className="mt-1 text-xs font-semibold text-red-600">{errs.whatsappNumber}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-bold">Delivery Fee * (MAD)</label>
            <input className={input} inputMode="numeric" value={String(form.deliveryFee)} data-testid="set-fee"
              onChange={e => setForm({ ...form, deliveryFee: Number(e.target.value.replace(/\D/g, "")) })} />
            {errs.deliveryFee && <p className="mt-1 text-xs font-semibold text-red-600">{errs.deliveryFee}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Delivery Time *</label>
            <input className={input} value={form.deliveryTime} placeholder="30-45 min" data-testid="set-time"
              onChange={e => setForm({ ...form, deliveryTime: e.target.value })} />
            {errs.deliveryTime && <p className="mt-1 text-xs font-semibold text-red-600">{errs.deliveryTime}</p>}
          </div>
        </div>
        <button onClick={save} data-testid="set-save"
          className="rounded-xl bg-black px-6 py-3 text-sm font-extrabold text-white hover:bg-gray-800">
          Save settings
        </button>
      </section>

      {/* Portable data actions */}
      <section className="flex flex-wrap gap-2 rounded-2xl bg-white p-6 shadow-card">
        <button onClick={exportJSON} data-testid="export-json"
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-black">
          <Download size={15} /> Export JSON
        </button>
        <button onClick={() => fileRef.current?.click()} data-testid="import-json"
          className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-200">
          <Upload size={15} /> Import JSON
        </button>
        <input ref={fileRef} type="file" accept="application/json" hidden
          onChange={e => { const f = e.target.files?.[0]; if (f) importJSON(f); e.target.value = ""; }} />
        <button onClick={() => setConfirmClear(true)} data-testid="clear-all"
          className="ml-auto flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">
          <Trash2 size={15} /> Clear All Data
        </button>
      </section>

      <ConfirmDialog
        open={confirmClear} close={() => setConfirmClear(false)}
        onConfirm={() => { clearAll(); toast.success("All data cleared"); }}
        title="Clear all data?" body="Dishes, orders and settings will be reset. This cannot be undone."
      />
    </div>
  );
}
