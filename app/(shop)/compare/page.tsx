import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { rules } from "@/config/marketplace-rules";
import { ComparePage } from "@/features/compare/ComparePage";
import { repos } from "@/lib/data";
import { first } from "@/lib/search/params";

export const metadata: Metadata = { title: "Compare listings", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: PageProps<"/compare">) {
  if (!rules.flags.compare) notFound();
  const ids = (first((await searchParams).ids) ?? "").split(",").filter((id) => /^[A-Za-z0-9]{1,20}$/.test(id)).slice(0, rules.compare.max);
  const found = ids.length ? await repos.listings.list({ ids }) : [];
  return <ComparePage listings={ids.flatMap((id) => found.filter((l) => l.id === id))} />;
}
