"use client";

import { HeartIcon } from "@/components/icons";
import { buttonClass, toast } from "@/components/ui";
import { rules } from "@/config/marketplace-rules";
import { cx } from "@/lib/cx";
import { requireAuth } from "@/features/auth/session";
import { saveListing, unsaveListing, useIsSaved } from "@/features/saved/store";

/* SaveButton (spec §5.3), eBay's heart over the photo. The DS quiet icon button: 36px to
   the eye, 44px to the finger. It's a toggle, so the name stays "Save {title}" and
   aria-pressed carries the state (WAI-ARIA APG: a toggle's label must not change);
   the title keeps each card's button unique (spec §16.6). Guests sign in first, then
   the save they asked for happens (R-004). */

function apply(listingId: string, save: boolean) {
  if (!save) {
    unsaveListing(listingId);
    toast({ message: "Removed from Saved", action: { label: "Undo", onClick: () => saveListing(listingId) } });
    return;
  }
  const result = saveListing(listingId);
  if (result === "full") {
    toast({ tone: "warning", message: `Saved is full (${rules.saved.maxListings} listings). Remove one to save this.` });
  } else if (result === "saved") {
    toast({ message: "Added to Saved", action: { label: "View", href: "/saved" } });
  }
}

type Props = { listingId: string; title: string; className?: string };

export function SaveButton({ listingId, title, className }: Props) {
  const saved = useIsSaved(listingId);
  return (
    <button
      type="button"
      className={buttonClass({ variant: "quiet", size: "sm", icon: true, className: cx("ws-save", className) })}
      aria-label={`Save ${title}`}
      aria-pressed={saved}
      onClick={() => {
        const wanted = !saved; // decided now, so a resumed save after sign-in can't flip it back
        requireAuth("save listings", () => apply(listingId, wanted));
      }}
    >
      <HeartIcon />
    </button>
  );
}
