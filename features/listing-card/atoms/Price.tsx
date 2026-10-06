import { Chip } from "@/components/ui";
import { cx } from "@/lib/cx";
import { discountPercent, formatCurrency, kobo, type Kobo } from "@/lib/money";
import { buyerTotal } from "@/lib/pricing";

/* PriceBlock and DiscountChip (spec §5.3). eBay order: price, "Was" price with the
   saving, "or Best offer", unit price, then the total to the buyer's area (R-003).
   Prices never animate in lists. */

/** eBay's "23% off", in the savings colour. Never red (spec §5.3). Nothing when there's no real cut. */
export function DiscountChip({ price_minor, was_minor }: { price_minor: Kobo; was_minor?: Kobo }) {
  const percent = discountPercent(price_minor, was_minor);
  if (percent === null) return null;
  return <Chip tone="gain">{percent}% off</Chip>;
}

export type PriceBlockProps = {
  price_minor: Kobo;
  was_minor?: Kobo;
  variant?: "card" | "detail" | "cart" | "sticky";
  /** Rent: "per year" follows the price, in every variant. */
  period?: "night" | "month" | "year";
  /** eBay's "or Best offer" under the price. */
  bestOffer?: boolean;
  unitPrice?: { amount_minor: Kobo; unit: string };
  /** With `showTotalTo`, adds "Total to {area} ₦X" (item + delivery, R-003). */
  delivery_minor?: Kobo;
  /** The buyer's area, as shown in the location bar ("Lekki"). */
  showTotalTo?: string;
  className?: string;
};

export function PriceBlock({ price_minor, was_minor, variant = "card", period, bestOffer, unitPrice, delivery_minor, showTotalTo, className }: PriceBlockProps) {
  const percent = discountPercent(price_minor, was_minor);
  const showTotal = showTotalTo !== undefined && delivery_minor !== undefined;
  // Detail spells the saving out the way eBay does; smaller variants use the chip.
  const saving = was_minor !== undefined && percent !== null ? kobo(was_minor - price_minor) : null;

  return (
    <div className={cx("ws-price", `ws-price--${variant}`, className)}>
      <p className="ws-price__now">
        {formatCurrency(price_minor)}
        {period && <span className="ws-price__period"> per {period}</span>}
      </p>
      {saving !== null && was_minor !== undefined && variant !== "sticky" && (
        <p className="ws-price__was">
          <span>
            Was <s>{formatCurrency(was_minor)}</s>
          </span>
          {variant === "detail" ? (
            <span className="ws-price__save">
              Save {formatCurrency(saving)} ({percent}% off)
            </span>
          ) : (
            <DiscountChip price_minor={price_minor} was_minor={was_minor} />
          )}
        </p>
      )}
      {bestOffer && variant !== "cart" && <p className="ws-price__note">or Best offer</p>}
      {unitPrice && (
        <p className="ws-price__note">
          ({formatCurrency(unitPrice.amount_minor)}/{unitPrice.unit})
        </p>
      )}
      {showTotal && (
        <p className="ws-price__total">
          Total to {showTotalTo} <strong>{formatCurrency(buyerTotal({ item_minor: price_minor, delivery_minor }))}</strong>
        </p>
      )}
    </div>
  );
}
