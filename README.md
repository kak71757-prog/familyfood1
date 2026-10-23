# Family Food Agadir — ProRestaurant SaaS (Next.js 14 PWA)

Next.js 14 App Router + Tailwind + Zustand + Framer Motion. 100% local data
(localStorage key `proRestaurant_v10`). Client storefront + WhatsApp checkout
(+212 669928434) + admin dashboard at /admin (pass: 1234).

## Run
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to out/ (PWA: manifest.webmanifest + sw.js)

## PWA
app/manifest.ts -> /manifest.webmanifest (standalone, maskable icons)
public/sw.js -> 3-line service worker (skipWaiting + clients.claim + fetch fallback)
public/icon-192.png, icon-512.png, apple-touch-icon.png (#ff6600, maskable-safe)

## Deploy
Static: upload out/ anywhere (Vercel/Netlify drag & drop). Vercel project: familyfood1.
