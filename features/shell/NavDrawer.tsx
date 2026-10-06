"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { ListRightIcon, XmarkCircleIcon } from "@/components/icons";
import { buttonClass } from "@/components/ui";

/* The menu drawer for phones and tablets (spec §3.1: utility items move into the
   drawer; §16.6: native dialog, focus trapped, Escape closes, focus returns to the
   menu button). It closes itself when a link inside navigates. */
export function NavDrawer({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className={buttonClass({ variant: "quiet", size: "sm", icon: true, className: "ws-header__menu" })}
        aria-label="Menu"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        <ListRightIcon />
      </button>
      <dialog
        ref={dialog}
        className="ws-drawer"
        aria-label="Menu"
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      >
        <div className="ws-drawer__panel">
          <div className="ws-drawer__head">
            <p className="ws-drawer__title">Menu</p>
            <button type="button" className={buttonClass({ variant: "quiet", size: "sm", icon: true })} aria-label="Close menu" onClick={() => dialog.current?.close()}>
              <XmarkCircleIcon />
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}

/** A drawer link that closes the drawer even when it points at the current page. */
export function DrawerLink({ href, icon, children }: { href: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <Link href={href} className="ws-drawer__link" onClick={(e) => e.currentTarget.closest("dialog")?.close()}>
      {icon}
      <span>{children}</span>
    </Link>
  );
}
