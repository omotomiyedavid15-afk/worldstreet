import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, InfoCircleIcon } from "@/components/icons";
import { EmptyState, buttonClass } from "@/components/ui";

/* Help centre placeholder (SCR-027), so links that point here today aren't dead ends
   (audit F5). Known topics show their title; anything else is a 404, not a fake page.
   The pages themselves (with /help/escrow's four steps, flows L11.1) come in Phase 6. */

const TOPICS: Record<string, string> = {
  "": "Help centre",
  escrow: "How escrow protects you",
  "buyer-protection": "Buyer protection",
  fees: "Selling fees",
  safety: "Staying safe when you meet",
  "prohibited-items": "Prohibited and restricted items",
  "top-rated-sellers": "Top rated sellers",
};

async function topic(params: PageProps<"/help/[[...slug]]">["params"]) {
  const slug = (await params).slug?.join("/") ?? "";
  return TOPICS[slug];
}

export async function generateMetadata({ params }: PageProps<"/help/[[...slug]]">): Promise<Metadata> {
  return { title: (await topic(params)) ?? "Help centre", robots: { index: false, follow: true } };
}

export default async function HelpPage({ params }: PageProps<"/help/[[...slug]]">) {
  const title = await topic(params);
  if (!title) notFound();
  return (
    <div className="ws-coming">
      <EmptyState
        icon={<InfoCircleIcon />}
        title={title}
        headingLevel="h1"
        action={
          <Link href="/" className={buttonClass({ variant: "ghost", arrow: true })}>
            Back to shopping
            <ArrowRightIcon />
          </Link>
        }
      >
        This help page is being written.
        <span className="ws-coming__phase">Coming in Phase 6 of the build, with orders and escrow.</span>
      </EmptyState>
    </div>
  );
}
