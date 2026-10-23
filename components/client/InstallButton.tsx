"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Home, PlusSquare, Share, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DIS_KEY = "pr_install_dis";

/**
 * Sticky bottom PWA install CTA (orange brand action).
 * - Android/Chrome: replays the captured `beforeinstallprompt` for a native sheet.
 * - iOS/Safari & desktop: guided steps (Share → Add to Home Screen).
 * - Hides itself once installed (standalone), dismissed (session) or when the
 *   native prompt is not needed.
 */
export function InstallButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [help, setHelp] = useState(false);
  const [hidden, setHidden] = useState(true); // SSR-safe: reveal client-side
  const [ios] = useState(() => typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent));

  useEffect(() => {
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(DIS_KEY) === "1"; } catch { /* noop */ }
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setHidden(dismissed || standalone);

    const onBip = (e: Event): void => { e.preventDefault(); setDeferred(e as BIPEvent); };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const dismiss = (): void => {
    try { sessionStorage.setItem(DIS_KEY, "1"); } catch { /* noop */ }
    setHidden(true);
  };

  const click = (): void => {
    if (deferred) { void deferred.prompt(); deferred.userChoice.then(() => setDeferred(null)).catch(() => undefined); }
    else setHelp(true);
  };

  if (hidden) return null;

  const steps = ios
    ? [
        { icon: Share, txt: "Tap the Share button in Safari's toolbar" },
        { icon: PlusSquare, txt: "Choose “Add to Home Screen”" },
        { icon: Home, txt: "Confirm — the app icon appears on your Home Screen" },
      ]
    : [
        { icon: Smartphone, txt: "Open the Chrome menu and choose “Add to Home screen”" },
        { icon: Home, txt: "Confirm — the app installs full-screen, offline-ready" },
      ];

  return (
    <>
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}
      >
        <div className="pointer-events-auto flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={click}
            data-testid="install-btn"
            className="flex items-center gap-2.5 rounded-full bg-orange-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-pop transition hover:bg-orange-600"
          >
            <Smartphone size={18} /> Install App
          </motion.button>
          <button
            onClick={dismiss}
            aria-label="Dismiss install prompt"
            data-testid="install-dismiss"
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-gray-500 shadow-pop hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {help && (
          <>
            <motion.button
              aria-label="Close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setHelp(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-6 shadow-pop"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
              data-testid="install-help"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-200" />
              <h3 className="mb-1 text-lg font-extrabold">Install this app</h3>
              <p className="mb-4 text-sm text-gray-500">
                {ios ? "On iPhone/iPad (Safari):" : "On Android (Chrome):"} one tap from your Home Screen, works offline.
              </p>
              <ol className="space-y-3">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-semibold">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600"><s.icon size={17} /></span>
                    {s.txt}
                  </li>
                ))}
              </ol>
              <button onClick={() => setHelp(false)}
                className="mt-5 w-full rounded-2xl bg-black py-3 text-sm font-extrabold text-white hover:bg-gray-800">
                Got it
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
