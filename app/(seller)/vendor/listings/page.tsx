import type { Metadata } from "next";
import { ListingsPage } from "@/features/sell/HubPages";

export const metadata: Metadata = { title: "Listings · Seller Hub", robots: { index: false, follow: false } };

export default function Page() {
  return <ListingsPage />;
}
