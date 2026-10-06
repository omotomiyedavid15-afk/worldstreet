import { Skeleton } from "@/components/ui";

/* Shown at once when a card is tapped, so the tap registers on a slow network. Same
   layout as the listing page, so nothing jumps when it arrives. */
export default function ListingLoading() {
  return (
    <div className="ws-listing-stub" role="status" aria-busy="true" aria-label="Loading listing">
      <div className="ws-listing-stub__media">
        <Skeleton width="100%" height="100%" radius={0} />
      </div>
      <div className="ws-listing-stub__body">
        <Skeleton width={90} height={26} radius="var(--cx-r-pill)" />
        <Skeleton width="85%" height={36} />
        <Skeleton width="40%" height={36} />
        <Skeleton width="55%" height={16} />
        <Skeleton width="65%" height={16} />
      </div>
    </div>
  );
}
