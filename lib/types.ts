/** Domain model — the entire SaaS persists as one JSON document. */
export interface Settings {
  restaurantName: string;
  whatsappNumber: string; // international format, e.g. 212669928434
  deliveryFee: number;
  deliveryTime: string; // e.g. "30-45 min"
  isOpen: boolean;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export interface OrderItem { id: string; name: string; price: number; qty: number }

export type OrderStatus = "New" | "Preparing" | "Ready" | "Delivered";

export interface Order {
  id: string;
  customer: { name: string; phone: string; address: string; notes: string };
  items: OrderItem[];
  total: number; // items subtotal + delivery fee
  status: OrderStatus;
  time: string; // ISO timestamp
}

/** The single persisted document (localStorage key `proRestaurant_v10`). */
export interface DB { settings: Settings; dishes: Dish[]; orders: Order[] }
