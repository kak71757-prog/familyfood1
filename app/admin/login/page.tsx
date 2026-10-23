"use client";
import { motion } from "framer-motion";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { login } from "@/lib/store";

/** Merchant gate: password 1234 → session flag → /admin. */
export default function LoginPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");

  const submit = (): void => {
    if (login(pw)) {
      toast.success("Welcome back");
      router.push("/admin/");
    } else {
      toast.error("Wrong password");
      setPw("");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-side px-4">
      <motion.form
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={e => { e.preventDefault(); submit(); }}
        className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-pop"
        data-testid="login-card"
      >
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-black text-white"><LockKeyhole size={20} /></span>
        <h1 className="text-xl font-extrabold">Admin login</h1>
        <p className="mb-5 mt-1 text-sm text-gray-500">Merchant access only.</p>
        <input
          type="password" value={pw} autoFocus placeholder="Password"
          onChange={e => setPw(e.target.value)}
          data-testid="login-pass"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-black focus:bg-white"
        />
        <motion.button whileTap={{ scale: 0.97 }} type="submit" data-testid="login-btn"
          className="mt-4 w-full rounded-xl bg-black py-3 text-sm font-extrabold text-white hover:bg-gray-800">
          Sign in
        </motion.button>
        <p className="mt-4 text-center text-xs text-gray-400">Demo password: 1234</p>
      </motion.form>
    </main>
  );
}
