"use client";

import { useParams } from "next/navigation";
import { Morph } from "@/components/motion/Morph";
import { Skeleton } from "@/components/ui";
import { parseListingParam } from "@/lib/data/repo";

/* The listing skeleton's photo box carries the listing's photo name, so the card photo
   morphs into it straight away and on into the real photo when it arrives. */
export function LoadingMedia() {
  const { slug } = useParams<{ slug: string }>();
  const id = parseListingParam(slug ?? "")?.id;
  return (
    <Morph name={id ? `photo-${id}` : undefined}>
      <div className="ws-listing-stub__media">
        <Skeleton width="100%" height="100%" radius={0} />
      </div>
    </Morph>
  );
}
