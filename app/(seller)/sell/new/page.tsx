import type { Metadata } from "next";
import { NewListing } from "@/features/sell/SellerHub";

export const metadata: Metadata = { title: "Create a listing", robots: { index: false, follow: false } };

export default function Page() {
  return <NewListing />;
}
