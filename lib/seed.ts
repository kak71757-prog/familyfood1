import type { DB } from "./types";

/** First-run demo data — real catalogue, no placeholders. */
export const seed = (): DB => ({
  settings: {
    restaurantName: "Family Food Agadir",
    whatsappNumber: "212669928434",
    deliveryFee: 15,
    deliveryTime: "30-45 min",
    isOpen: true,
  },
  dishes: [
    { id: "d1", name: "Tagine of Prunes & Almonds", description: "Slow-cooked chicken tagine with caramelised prunes, toasted almonds and honey.", price: 68, image: "/img/moroccan-tagine-prunes.webp", category: "Tagines", available: true },
    { id: "d2", name: "Vegetable Tagine", description: "Seven seasonal vegetables, olives and preserved lemon in a saffron broth.", price: 52, image: "/img/moroccan-vegetable-tagine.webp", category: "Tagines", available: true },
    { id: "d3", name: "Friday Couscous", description: "Steamed semolina, caramelised onions, raisins and seven vegetables.", price: 60, image: "/img/couscous-friday.webp", category: "Couscous", available: true },
    { id: "d4", name: "Chicken Pastilla", description: "Crisp warqa pie, spiced chicken, almonds and a dust of cinnamon.", price: 74, image: "/img/pastilla-event.webp", category: "Pastilla", available: true },
    { id: "d5", name: "Fish with Chermoula", description: "Atlantic sea bass, chermoula marinade, roasted potatoes and lemon.", price: 89, image: "/img/moroccan-fish-chermoula.webp", category: "Grill", available: true },
    { id: "d6", name: "Moroccan Tea & Pastries", description: "Mint tea pot with homemade kaab el ghzal and chebakia.", price: 35, image: "/img/moroccan-tea-pastries.webp", category: "Drinks", available: true },
    { id: "d7", name: "Family Table (6 pax)", description: "Full Moroccan spread: tagine, couscous, pastilla, salads and tea.", price: 420, image: "/img/hero-family-table.webp", category: "Family", available: true },
    { id: "d8", name: "Event Delivery Pack", description: "Insulated catering pack for events, labelled per guest.", price: 380, image: "/img/delivery-packaging.webp", category: "Family", available: false },
  ],
  orders: [],
});
