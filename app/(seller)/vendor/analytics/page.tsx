import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { rules } from "@/config/marketplace-rules";
import { AnalyticsPage } from "@/features/sell/HubPages";

export const metadata: Metadata = { title: "Analytics · Seller Hub", robots: { index: false, follow: false } };

export default function Page() {
  if (!rules.flags.analytics) notFound();
  return <AnalyticsPage />;
}
