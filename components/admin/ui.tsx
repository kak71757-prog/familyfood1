"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

/** Animated iOS-style switch (used for isOpen / available). */
export function Switch({ on, toggle, label }: { on: boolean; toggle: () => void; label: string }) {
  return (
    <button
      role="switch" aria-checked={on} aria-label={label} onClick={toggle}
      data-testid={`switch-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-green-500" : "bg-gray-300"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 34 }}
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${on ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

/** Centered modal shell with spring entrance. */
export function Modal({ open, close, title, children, wide }: {
  open: boolean; close: () => void; title: string; children: ReactNode; wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button aria-label="Close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          {/* Centering lives on this grid wrapper so Framer's transform
              animations never fight Tailwind's translate utilities. */}
          <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={`pointer-events-auto max-h-[88vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-pop ${wide ? "max-w-2xl" : "max-w-md"}`}
            data-testid="modal"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold">{title}</h3>
              <button onClick={close} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-100"><X size={16} /></button>
            </div>
            {children}
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Destructive-action confirmation dialog. */
export function ConfirmDialog({ open, close, onConfirm, title, body }: {
  open: boolean; close: () => void; onConfirm: () => void; title: string; body: string;
}) {
  return (
    <Modal open={open} close={close} title={title}>
      <p className="text-sm text-gray-600">{body}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={close} className="rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
        <button onClick={() => { onConfirm(); close(); }} data-testid="confirm-yes"
          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">
          Confirm
        </button>
      </div>
    </Modal>
  );
}
