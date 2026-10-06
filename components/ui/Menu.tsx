"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { buttonClass } from "./Button";

/* DS Menu (`.cx-menu`) on the native Popover API: top layer, light dismiss and Escape
   for free. The trigger is an icon button (card and row overflow menus) or a text
   button. Items with `checked` are radio choices; the menu opens on the checked one. Keyboard: arrows/Home/End move between items, Escape closes and returns focus
   to the trigger, Tab leaves. Where CSS anchor positioning is missing, the menu is
   placed under the trigger in script. */

type ItemBase = {
  label: string;
  icon?: ReactNode;
  kbd?: string;
  danger?: boolean;
  /** Makes the item a radio choice (menuitemradio) and marks the current one (sort orders). */
  checked?: boolean;
};
export type MenuItem = (ItemBase & { onSelect: () => void; href?: undefined }) | (ItemBase & { href: string; onSelect?: undefined });

const ITEM = "[role=menuitem], [role=menuitemradio]";

type MenuProps = {
  /** Accessible name of the trigger, e.g. "More actions for Sony WH-1000XM5". */
  label: string;
  /** Trigger content. An icon alone makes an icon button named by `label`. */
  trigger: ReactNode;
  iconOnly?: boolean;
  items: (MenuItem | "separator")[];
  variant?: "quiet" | "ghost";
  size?: "sm" | "md";
};

const itemRole = (item: MenuItem) =>
  item.checked === undefined ? { role: "menuitem" } : { role: "menuitemradio", "aria-checked": item.checked };

const supportsAnchor = () => typeof CSS !== "undefined" && CSS.supports("position-area: bottom");

export function Menu({ label, trigger, iconOnly = true, items, variant = "quiet", size = "sm" }: MenuProps) {
  const id = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const onToggle = (e: Event) => {
      const isOpen = (e as ToggleEvent).newState === "open";
      setOpen(isOpen);
      if (!isOpen) return;
      if (!supportsAnchor() && triggerRef.current) {
        const r = triggerRef.current.getBoundingClientRect();
        menu.style.position = "fixed";
        menu.style.margin = "0";
        menu.style.top = `${r.bottom + 8}px`;
        menu.style.left = `${Math.min(r.left, window.innerWidth - menu.offsetWidth - 16)}px`;
      }
      (menu.querySelector<HTMLElement>("[aria-checked=true]") ?? menu.querySelector<HTMLElement>(ITEM))?.focus();
    };
    menu.addEventListener("toggle", onToggle);
    return () => menu.removeEventListener("toggle", onToggle);
  }, []);

  const close = () => menuRef.current?.hidePopover();

  const onKeyDown = (e: KeyboardEvent) => {
    const all = [...(menuRef.current?.querySelectorAll<HTMLElement>(ITEM) ?? [])];
    const i = all.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => { e.preventDefault(); all[(n + all.length) % all.length]?.focus(); };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(all.length - 1);
    else if (e.key === "Tab") close();
    else if (e.key === "Escape") {
      // The browser closes an auto popover on Escape itself; doing it here too keeps the
      // focus return explicit and covers untrusted (scripted) key events.
      e.preventDefault();
      close();
      triggerRef.current?.focus();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={buttonClass({ variant, size: size === "md" ? undefined : size, icon: iconOnly })}
        popoverTarget={id}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        aria-label={iconOnly ? label : undefined}
      >
        {trigger}
      </button>
      <div ref={menuRef} id={id} popover="auto" role="menu" aria-label={label} className="cx-menu" onKeyDown={onKeyDown}>
        {items.map((item, n) =>
          item === "separator" ? (
            <hr key={`sep-${n}`} />
          ) : item.href ? (
            <Link key={item.label} href={item.href} tabIndex={-1} className={item.danger ? "danger" : undefined} onClick={close} {...itemRole(item)}>
              {item.icon}
              {item.label}
              {item.kbd && <span className="kbd">{item.kbd}</span>}
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              {...itemRole(item)}
              tabIndex={-1}
              className={item.danger ? "danger" : undefined}
              onClick={() => { close(); item.onSelect?.(); }}
            >
              {item.icon}
              {item.label}
              {item.kbd && <span className="kbd">{item.kbd}</span>}
            </button>
          ),
        )}
      </div>
    </>
  );
}
