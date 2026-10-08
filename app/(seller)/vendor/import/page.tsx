import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { rules } from "@/config/marketplace-rules";
import { ImportPage } from "@/features/sell/HubPages";

export const metadata: Metadata = { title: "Import listings · Seller Hub", robots: { index: false, follow: false } };

export default function Page() {
  if (!rules.flags.bulkImport) notFound();
  return <ImportPage />;
}
