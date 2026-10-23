"use client";
import { SearchX } from "lucide-react";

/** Loading skeleton grid (first paint). */
export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="skeleton">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="aspect-video animate-pulse bg-gray-200" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Empty search result. */
export function NoResults() {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl bg-white py-16 text-gray-400 shadow-card" data-testid="no-results">
      <SearchX size={36} strokeWidth={1.5} />
      <p className="font-semibold">No dishes found</p>
    </div>
  );
}

/** Empty cart illustration (inline SVG — no assets). */
export function EmptyCart() {
  return (
    <div className="grid flex-1 place-items-center gap-3 text-gray-400" data-testid="empty-cart">
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <rect x="18" y="30" width="60" height="48" rx="10" stroke="currentColor" strokeWidth="3" />
        <path d="M34 30c0-10 6-16 14-16s14 6 14 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M30 48h36M30 60h24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="font-semibold">Your cart is empty</p>
      <p className="text-sm">Add something delicious from the menu.</p>
    </div>
  );
}
