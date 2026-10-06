/* MOCK DATA ONLY. Not real people, shops or listings. Imported only by lib/data/index.ts. */

import type { Category } from "@/lib/data/types";

export const categories: readonly Category[] = [
  { id: "phones", name: "Phones & tablets", inspection: "phones", kind: "goods", card_facts: ["Storage", "Battery health", "RAM"] },
  { id: "electronics", name: "Electronics", inspection: "electronics", kind: "goods", card_facts: ["Storage", "Colour", "Size"] },
  { id: "computing", name: "Computing", inspection: "electronics", kind: "goods", card_facts: ["RAM", "Storage", "Size"] },
  { id: "fashion", name: "Fashion", inspection: "fashion", kind: "goods", card_facts: ["Size", "Colour", "Material"] },
  { id: "home", name: "Home & kitchen", inspection: "home", kind: "goods", card_facts: ["Capacity", "Colour"] },
  { id: "appliances", name: "Appliances", inspection: "appliances", kind: "goods", card_facts: ["Capacity", "Power"] },
  { id: "furniture", name: "Furniture", inspection: "furniture", kind: "goods", card_facts: ["Seats", "Colour"] },
  { id: "beauty", name: "Health & beauty", inspection: "default", kind: "goods", card_facts: ["Size"] },
  { id: "vehicles", name: "Vehicles", inspection: "vehicles", kind: "vehicle", card_facts: ["Year", "Mileage", "Transmission", "Fuel"] },
  { id: "property", name: "Property", inspection: "property", kind: "property", card_facts: ["Bedrooms", "Bathrooms"] },
];
