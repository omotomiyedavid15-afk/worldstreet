import Link from "next/link";
import { CheckShieldIcon, DeliveryTruckIcon, WalletIcon } from "@/components/icons";
import { IconTile } from "@/components/ui";
import { TRUST } from "@/lib/copy/trust";

/* TrustStrip (spec §4, flows B1 step 3): Escrow · Tracked delivery · Wallet payouts,
   above the fold, in the DS stats-band layout: three columns on desktop, a row that
   scrolls sideways on phones. Every sentence comes from lib/copy (L11.1, L14 test 8). */

const ICONS = { escrow: CheckShieldIcon, tracking: DeliveryTruckIcon, payout: WalletIcon } as const;

export function TrustStrip() {
  return (
    <section className="ws-trust" aria-label="Buying on WorldStreet">
      <ul className="ws-trust__list">
        {TRUST.map((item) => {
          const Icon = ICONS[item.id];
          return (
            <li key={item.id} className="ws-trust__item">
              <IconTile size="sm">
                <Icon />
              </IconTile>
              <div className="ws-trust__text">
                <p className="ws-trust__title">{item.title}</p>
                <p className="ws-trust__body">
                  {item.body}
                  {"link" in item && (
                    <>
                      {" "}
                      <Link href={item.link.href} className="cx-link ws-trust__link">
                        {item.link.label}
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
