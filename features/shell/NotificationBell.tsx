"use client";

import Link from "next/link";
import { useId } from "react";
import { BellIcon } from "@/components/icons";
import { buttonClass, Count } from "@/components/ui";
import { markAllRead, unreadCount, useNotices } from "@/features/notifications/store";
import { timeAgo } from "@/lib/format";

/* NotificationBell + NotificationPanel (spec §3.1): a popover on desktop. The badge is
   the number of unread items in this panel and nothing else (Part H guardrail). Phones
   get the Notifications page from the drawer and the Account tab (spec §16.2). */
export function NotificationBell() {
  const id = useId();
  const notices = useNotices();
  const unread = unreadCount(notices);
  return (
    <>
      <button
        type="button"
        className={buttonClass({ variant: "quiet", size: "sm", icon: true, className: "ws-bell" })}
        popoverTarget={id}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-haspopup="dialog"
      >
        <BellIcon />
        <Count value={unread} className="ws-bell__count" />
      </button>
      <div id={id} popover="auto" role="dialog" aria-label="Notifications" className="cx-menu ws-notices">
        <div className="ws-notices__head">
          <h2 className="ws-notices__title">Notifications</h2>
          {unread > 0 && (
            <button type="button" className="cx-link ws-notices__read" onClick={markAllRead}>
              Mark all read
            </button>
          )}
        </div>
        {notices.length === 0 ? (
          <p className="ws-notices__empty">
            Nothing yet. Offers, messages, order updates and price drops on things you&apos;ve saved will show here.
          </p>
        ) : (
          <ul className="ws-notices__list">
            {notices.map((n) => (
              <li key={n.id} data-unread={!n.read || undefined}>
                <Link href={n.href}>
                  <span className="ws-notices__item-title">{n.title}</span>
                  {n.body && <span className="ws-notices__item-body">{n.body}</span>}
                  <span className="ws-notices__item-time">{timeAgo(n.at).short}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
