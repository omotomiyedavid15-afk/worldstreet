"use client";

import { RouteError } from "@/features/errors/RouteError";

export default function ListingError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError what="this listing" reset={reset} />;
}
