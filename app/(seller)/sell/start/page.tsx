import type { Metadata } from "next";
import { SellerOnboarding } from "@/features/sell/SellerOnboarding";
import { repos } from "@/lib/data";

export const metadata: Metadata = { title: "Start selling", robots: { index: false, follow: false } };

export default async function Page() {
  const [categories, sellers] = await Promise.all([repos.categories.list(), repos.sellers.list()]);
  return <SellerOnboarding categories={categories} taken={sellers.map((s) => s.handle.toLowerCase())} />;
}
