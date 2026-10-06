/* MOCK DATA ONLY. Not real people, shops or listings. Imported only by lib/data/index.ts. */

import type { Category } from "@/lib/data/types";

export const categories: readonly Category[] = [
  { id: "phones", name: "Phones & tablets", inspection: "phones", kind: "goods" },
  { id: "electronics", name: "Electronics", inspection: "electronics", kind: "goods" },
  { id: "computing", name: "Computing", inspection: "electronics", kind: "goods" },
  { id: "fashion", name: "Fashion", inspection: "fashion", kind: "goods" },
  { id: "home", name: "Home & kitchen", inspection: "home", kind: "goods" },
  { id: "appliances", name: "Appliances", inspection: "appliances", kind: "goods" },
  { id: "furniture", name: "Furniture", inspection: "furniture", kind: "goods" },
  { id: "beauty", name: "Health & beauty", inspection: "default", kind: "goods" },
  { id: "vehicles", name: "Vehicles", inspection: "vehicles", kind: "vehicle" },
  { id: "property", name: "Property", inspection: "property", kind: "property" },
];
