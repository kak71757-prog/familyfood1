"use client";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDB } from "@/lib/store";
import type { Dish } from "@/lib/types";
import { fmt } from "@/lib/utils";
import { ConfirmDialog, Modal, Switch } from "@/components/admin/ui";

const input = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-black focus:bg-white";
const emptyForm = { name: "", price: "", image: "", category: "", newCat: "", description: "", available: true };

/** Dishes manager: searchable table, inline price edit, add-dish modal. */
export default function DishesPage() {
  const { dishes, addDish, updateDish, deleteDish } = useDB();
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState("");
  const [toDelete, setToDelete] = useState<Dish | null>(null);

  const cats = useMemo(() => Array.from(new Set(dishes.map(d => d.category))), [dishes]);
  const rows = useMemo(() => dishes.filter(d => d.name.toLowerCase().includes(q.trim().toLowerCase())), [dishes, q]);

  const savePrice = (id: string): void => {
    const n = Number(priceDraft);
    if (!Number.isFinite(n) || n <= 0) { toast.error("Price must be a positive number"); return; }
    updateDish(id, { price: n });
    setEditingPrice(null);
    toast.success("Price updated");
  };

  const submit = (): void => {
    const e: Record<string, string> = {};
    const category = (form.category === "__new" ? form.newCat : form.category).trim();
    if (!form.name.trim()) e.name = "Name is required";
    if (!Number(form.price) || Number(form.price) <= 0) e.price = "Enter a valid price";
    if (!form.image.trim()) e.image = "Image URL is required";
    if (!category) e.category = "Pick or create a category";
    setErrs(e);
    if (Object.keys(e).length) return;

    addDish({
      name: form.name.trim(),
      price: Number(form.price),
      image: form.image.trim(),
      category,
      description: form.description.trim(),
      available: form.available,
    });
    toast.success("Dish added");
    setForm(emptyForm);
    setModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Dishes</h1>
        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
          <label className="relative w-full sm:w-56">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search dishes…"
              className={`${input} pl-9`} data-testid="dish-search" />
          </label>
          <button onClick={() => setModal(true)} data-testid="add-dish"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-extrabold text-white hover:bg-gray-800">
            <Plus size={16} /> Add Dish
          </button>
        </div>
      </div>

      <section className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3">Dish</th><th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th><th className="px-4 py-3">Available</th><th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(d => (
              <tr key={d.id} data-testid="dish-row">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.image} alt="" className="h-10 w-10 rounded-lg object-cover" data-testid="dish-thumb" />
                    <span className="font-bold">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold">{d.category}</span></td>
                <td className="px-4 py-3">
                  {editingPrice === d.id ? (
                    <span className="flex items-center gap-1.5">
                      <input autoFocus value={priceDraft} inputMode="numeric" onChange={e => setPriceDraft(e.target.value.replace(/\D/g, ""))}
                        className={`${input} w-24 py-1.5`} data-testid="price-input" />
                      <button onClick={() => savePrice(d.id)} aria-label="Save price" className="grid h-7 w-7 place-items-center rounded-lg bg-green-600 text-white"><Check size={14} /></button>
                      <button onClick={() => setEditingPrice(null)} aria-label="Cancel" className="grid h-7 w-7 place-items-center rounded-lg bg-gray-100"><X size={14} /></button>
                    </span>
                  ) : (
                    <button onClick={() => { setEditingPrice(d.id); setPriceDraft(String(d.price)); }}
                      className="flex items-center gap-1.5 font-bold hover:text-green-700" data-testid="price-cell">
                      {fmt(d.price)} <Pencil size={12} className="text-gray-400" />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Switch on={d.available} label={`avail-${d.id}`}
                    toggle={() => { updateDish(d.id, { available: !d.available }); toast.success(`${d.name} is now ${d.available ? "unavailable" : "available"}`); }} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setToDelete(d)} aria-label={`Delete ${d.name}`} data-testid="delete-dish"
                    className="grid h-9 w-9 place-items-center rounded-xl text-red-500 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No dishes match your search.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Add-dish modal with live image preview */}
      <Modal open={modal} close={() => setModal(false)} title="Add Dish" wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <div>
              <input className={input} placeholder="Name *" value={form.name} data-testid="nd-name"
                onChange={e => setForm({ ...form, name: e.target.value })} />
              {errs.name && <p className="mt-1 text-xs font-semibold text-red-600">{errs.name}</p>}
            </div>
            <div>
              <input className={input} placeholder="Price * (MAD)" inputMode="numeric" value={form.price} data-testid="nd-price"
                onChange={e => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })} />
              {errs.price && <p className="mt-1 text-xs font-semibold text-red-600">{errs.price}</p>}
            </div>
            <div>
              <input className={input} placeholder="Image URL *" value={form.image} data-testid="nd-image"
                onChange={e => setForm({ ...form, image: e.target.value })} />
              {errs.image && <p className="mt-1 text-xs font-semibold text-red-600">{errs.image}</p>}
            </div>
            <div>
              <select className={input} value={form.category} data-testid="nd-cat"
                onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Category *</option>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__new">+ New category…</option>
              </select>
              {form.category === "__new" && (
                <input className={`${input} mt-2`} placeholder="New category name" value={form.newCat} data-testid="nd-newcat"
                  onChange={e => setForm({ ...form, newCat: e.target.value })} />
              )}
              {errs.category && <p className="mt-1 text-xs font-semibold text-red-600">{errs.category}</p>}
            </div>
          </div>
          <div className="space-y-3">
            <textarea className={input} rows={4} placeholder="Description" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })}
                className="h-4 w-4 accent-black" /> Available for sale
            </label>
            <div className="overflow-hidden rounded-2xl bg-gray-100" data-testid="img-preview">
              {form.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={form.image} alt="Preview" className="aspect-video w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.opacity = "0.25"; }} />
              ) : (
                <div className="grid aspect-video place-items-center text-xs text-gray-400">Live image preview</div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setModal(false)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
          <button onClick={submit} data-testid="nd-save" className="rounded-xl bg-black px-5 py-2.5 text-sm font-extrabold text-white hover:bg-gray-800">Save dish</button>
        </div>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null} close={() => setToDelete(null)}
        onConfirm={() => { if (toDelete) { deleteDish(toDelete.id); toast.success("Dish deleted"); } }}
        title="Delete dish?" body={`"${toDelete?.name ?? ""}" will be removed from the menu permanently.`}
      />
    </div>
  );
}
