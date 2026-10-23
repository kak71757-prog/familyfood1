"use client";
import { useEffect } from "react";
import { useDB } from "@/lib/store";

/**
 * Static-export hydration bridge: the prerendered HTML always ships the seed
 * catalogue (deterministic SSR), and the persisted document is applied here,
 * client-side, right after mount — zero hydration mismatches, zero stuck
 * "load" states on revisit.
 */
export function Hydrate() {
  const hydrate = useDB(s => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  return null;
}
