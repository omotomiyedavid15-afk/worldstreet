import type { Metadata } from "next";
import { SellerOrdersPage } from "@/features/sell/HubPages";

export const metadata: Metadata = { title: "Orders · Seller Hub", robots: { index: false, follow: false } };

export default function Page() {
  return <SellerOrdersPage />;
}
