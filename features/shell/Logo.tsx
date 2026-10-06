import Link from "next/link";
import { ShopBagIcon } from "@/components/icons";

/* The WorldStreet mark: the Atlas shopping bag on the gold tile (the app icon) and the
   name. Until a real logo exists (PROGRESS: app icon row). */
export function Logo() {
  return (
    <Link href="/" className="ws-logo" aria-label="WorldStreet home">
      <span className="ws-logo__tile" aria-hidden="true">
        <ShopBagIcon />
      </span>
      <span className="ws-logo__name" aria-hidden="true">
        WorldStreet
      </span>
    </Link>
  );
}
