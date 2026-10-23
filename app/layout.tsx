import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { Hydrate } from "@/components/Hydrate";
import "./globals.css";

/* PWA surface: manifest via app/manifest.ts (served at /manifest.webmanifest),
   standalone meta hints, and the service-worker registration script in <head>. */

export const metadata: Metadata = {
  title: "ProRestaurant — Premium Ordering Platform",
  description:
    "Production-ready restaurant ordering SaaS: client storefront + WhatsApp checkout and a full admin dashboard. 100% local data.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#ff6600" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))}`,
          }}
        />
      </head>
      <body>
        <Hydrate />
        {children}
        <Toaster richColors position="top-center" toastOptions={{ style: { borderRadius: "14px" } }} />
      </body>
    </html>
  );
}
