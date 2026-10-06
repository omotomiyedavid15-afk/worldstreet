import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, StoreIcon } from "@/components/icons";
import { EmptyState, buttonClass } from "@/components/ui";
import { repos } from "@/lib/data";

/* SCR-005 placeholder: cards and the listing page link here (audit F5). The shop page
   with its listings, feedback and "Usually replies within" arrives in Phase 3. */

export async function generateMetadata({ params }: PageProps<"/seller/[handle]">): Promise<Metadata> {
  const seller = await repos.sellers.getByHandle((await params).handle);
  return { title: seller?.shop_name ?? "Seller", robots: { index: false, follow: true } };
}

export default async function SellerPage({ params }: PageProps<"/seller/[handle]">) {
  const seller = await repos.sellers.getByHandle((await params).handle);
  if (!seller) notFound();
  return (
    <div className="ws-coming">
      <EmptyState
        icon={<StoreIcon />}
        title={seller.shop_name}
        headingLevel="h1"
        action={
          <Link href={`/search?q=${encodeURIComponent(seller.shop_name)}`} className={buttonClass({ variant: "ghost", arrow: true })}>
            Search for items
            <ArrowRightIcon />
          </Link>
        }
      >
        {seller.area.area}, {seller.area.city}. The shop page with all its listings and feedback is coming in Phase 3 of the build.
      </EmptyState>
    </div>
  );
}
