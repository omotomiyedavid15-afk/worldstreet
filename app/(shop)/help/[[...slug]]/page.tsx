import type { Metadata } from "next";
import Link from "next/link";
import { InfoCircleIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui";

/* Help centre placeholder (S0.10 fills in every footer and header destination), so
   links that point here today aren't dead ends (audit F5). */

const TITLES: Record<string, string> = {
  "prohibited-items": "Prohibited and restricted items",
  escrow: "How escrow protects you",
};

export async function generateMetadata({ params }: PageProps<"/help/[[...slug]]">): Promise<Metadata> {
  const slug = (await params).slug?.join("/") ?? "";
  return { title: TITLES[slug] ?? "Help centre" };
}

export default async function HelpPage({ params }: PageProps<"/help/[[...slug]]">) {
  const slug = (await params).slug?.join("/") ?? "";
  return (
    <div className="ws-help-stub">
      <h1 className="cx-h3">{TITLES[slug] ?? "Help centre"}</h1>
      <EmptyState icon={<InfoCircleIcon />} title="This page is on its way" headingLevel="h2" action={<Link href="/search">Back to shopping</Link>}>
        The help centre arrives with the account and trust pages.
      </EmptyState>
    </div>
  );
}
