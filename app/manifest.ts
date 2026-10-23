import type { MetadataRoute } from "next";

/* Values exactly as specified. Keys use the web-manifest spec spelling
   (snake_case): Next 14's Manifest type AND Chrome both require it —
   camelCase keys would be silently ignored by browsers.
   The spec allows a space-separated purpose list ("any maskable"); Next's
   TS union only lists single keywords, so it is kept via a compile-time cast. */
const ANY_MASKABLE = "any maskable" as unknown as "any";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Family Food",
    short_name: "FamilyFood",
    description: "Family Food App",
    display: "standalone",
    display_override: ["standalone"],
    start_url: "/?source=pwa",
    scope: "/",
    background_color: "#ffffff",
    theme_color: "#ff6600",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: ANY_MASKABLE },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: ANY_MASKABLE },
    ],
  };
}
