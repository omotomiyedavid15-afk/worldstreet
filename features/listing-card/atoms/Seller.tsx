import Link from "next/link";
import { CheckShieldIcon, StarBadgeAwardIcon } from "@/components/icons";
import { Avatar, Chip } from "@/components/ui";
import type { SellerProfile } from "@/lib/data/types";
import { formatCount } from "@/lib/format";

/* SellerMini, VerifiedTick and TopRatedBadge (spec §5.3). eBay's seller line is
   "name · 99.2% positive (1,284)" plus "Top Rated Plus". Seller feedback is a
   percentage, item ratings are stars, so the two never look alike (audit F13). */

export function VerifiedTick() {
  return <CheckShieldIcon label="Verified seller" />;
}

/** eBay's "Top Rated Plus" badge. Links to the standards page once /help exists (S0.10). */
export function TopRatedBadge() {
  return (
    <Chip tone="brand" className="ws-chip-icon">
      <StarBadgeAwardIcon />
      Top rated
    </Chip>
  );
}

const percent = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 1 });

type SellerMiniProps = {
  seller: Pick<SellerProfile, "shop_name" | "handle" | "verified" | "top_rated" | "feedback">;
  /** Off inside a card: the card has one link (spec §16.6). */
  link?: boolean;
  avatar?: boolean;
};

export function SellerMini({ seller, link = false, avatar = false }: SellerMiniProps) {
  const name = (
    <>
      {seller.shop_name}
      {seller.verified && <VerifiedTick />}
    </>
  );
  const { positive_percent, count } = seller.feedback;

  return (
    <div className="ws-seller">
      {avatar && <Avatar name={seller.shop_name} size="sm" />}
      {link ? (
        <Link href={`/seller/${seller.handle}`} className="ws-seller__name">
          {name}
        </Link>
      ) : (
        <span className="ws-seller__name">{name}</span>
      )}
      {seller.top_rated && <TopRatedBadge />}
      {count > 0 && (
        <span className="ws-seller__feedback">
          <span className="cx-sr-only">Seller feedback: </span>
          {percent.format(positive_percent)}% positive ({formatCount(count)})
        </span>
      )}
    </div>
  );
}
