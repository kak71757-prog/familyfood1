"use client";
import { motion } from "framer-motion";
import { BarChart3, ClipboardList, LogOut, Menu as MenuIcon, Settings as SettingsIcon, UtensilsCrossed, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthed, logout, useDB } from "@/lib/store";

const LINKS = [
  { href: "/admin/", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/dishes/", label: "Dishes", icon: UtensilsCrossed },
  { href: "/admin/orders/", label: "Orders", icon: ClipboardList },
  { href: "/admin/settings/", label: "Settings", icon: SettingsIcon },
];

/** Auth-guarded dark shell: 240px sidebar + light-gray content canvas. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const name = useDB(s => s.settings.restaurantName);
  const [ready, setReady] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  /* Guard: no session → straight back to the login page. */
  useEffect(() => {
    if (!isAuthed()) { router.replace("/admin/login/"); return; }
    setReady(true);
  }, [router]);

  if (!ready) return <main className="grid min-h-screen place-items-center bg-canvas"><span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" /></main>;

  const nav = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <p className="mb-3 truncate px-3 text-sm font-extrabold text-white">{name}</p>
      {LINKS.map(l => {
        const active = pathname === l.href;
        return (
          <Link key={l.href} href={l.href} onClick={() => setNavOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-white text-black" : "text-gray-400 hover:bg-white/10 hover:text-white"}`}>
            <l.icon size={17} /> {l.label}
          </Link>
        );
      })}
      <button
        onClick={() => { logout(); router.replace("/admin/login/"); }}
        data-testid="logout"
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10"
      >
        <LogOut size={17} /> Logout
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Desktop sidebar (240px) */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-side md:block" data-testid="sidebar">{nav}</aside>

      {/* Mobile drawer sidebar */}
      {navOpen && (
        <>
          <button aria-label="Close menu" onClick={() => setNavOpen(false)} className="fixed inset-0 z-40 bg-black/50 md:hidden" />
          <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} className="fixed inset-y-0 left-0 z-50 w-60 bg-side md:hidden">
            <button onClick={() => setNavOpen(false)} aria-label="Close" className="absolute right-3 top-4 text-gray-400"><X size={18} /></button>
            {nav}
          </motion.aside>
        </>
      )}

      <div className="min-w-0 flex-1 md:pl-60">
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <button onClick={() => setNavOpen(true)} aria-label="Open menu" className="grid h-9 w-9 place-items-center rounded-xl bg-black text-white"><MenuIcon size={17} /></button>
          <span className="font-extrabold">Admin</span>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
