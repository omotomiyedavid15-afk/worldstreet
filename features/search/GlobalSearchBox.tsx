"use client";

import Form from "next/form";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { ClockIcon, MagnifyingGlassIcon, TagIcon } from "@/components/icons";
import { buttonClass } from "@/components/ui";
import { addRecentSearch, clearRecentSearches, useRecentSearches } from "./recent";

/* GlobalSearchBox, Sprint 0 version (spec §3, flows B2 step 1): a GET form to /search
   (next/form, so it works before scripts and navigates client-side after), with a
   panel of recent and trending searches. ARIA combobox: ↑ ↓ move, Enter picks,
   Escape closes. Live suggestions as you type, the scope select and image search
   arrive with the header in Phase 1. */

type Props = {
  defaultValue?: string;
  trending: readonly string[];
  /** Params to keep on a new search, e.g. a non-default radius. */
  keep?: Record<string, string>;
};

type Option = { term: string; kind: "recent" | "trending" };

export function GlobalSearchBox({ defaultValue = "", trending, keep = {} }: Props) {
  const id = useId();
  const listId = `${id}-list`;
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const recents = useRecentSearches();

  const q = value.trim().toLowerCase();
  const fits = (t: string) => !q || (t.toLowerCase().includes(q) && t.toLowerCase() !== q);
  const recent: Option[] = recents.filter(fits).slice(0, 5).map((term) => ({ term, kind: "recent" }));
  const popular: Option[] = trending
    .filter((t) => fits(t) && !recents.some((r) => r.toLowerCase() === t.toLowerCase()))
    .slice(0, 5)
    .map((term) => ({ term, kind: "trending" }));
  const options = [...recent, ...popular];
  const expanded = open && options.length > 0;

  const close = () => {
    setOpen(false);
    setActive(-1);
  };
  const choose = (term: string) => {
    flushSync(() => setValue(term));
    close();
    formRef.current?.requestSubmit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!expanded) {
        setOpen(true);
        setActive(e.key === "ArrowDown" ? 0 : options.length - 1);
        return;
      }
      // -1 is the text itself; moving past either end comes back to it.
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => ((i + 1 + step + options.length + 1) % (options.length + 1)) - 1);
    } else if (e.key === "Enter" && expanded && active >= 0 && active < options.length) {
      e.preventDefault();
      choose(options[active].term);
    } else if (e.key === "Escape" && expanded) {
      e.preventDefault();
      close();
    }
  };

  const optionId = (i: number) => `${id}-opt-${i}`;
  const group = (label: string, items: Option[], offset: number) =>
    items.length > 0 && (
      <li role="presentation" className="ws-suggest__group">
        <div className="ws-suggest__head" id={`${id}-${offset}`} role="presentation">
          {label}
        </div>
        <ul role="group" aria-labelledby={`${id}-${offset}`}>
          {items.map((o, n) => {
            const i = offset + n;
            const Icon = o.kind === "recent" ? ClockIcon : TagIcon;
            return (
              <li
                key={o.term}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                className="ws-suggest__option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o.term)}
              >
                <Icon />
                {o.term}
              </li>
            );
          })}
        </ul>
      </li>
    );

  return (
    <Form
      ref={formRef}
      action="/search"
      role="search"
      aria-label="Search WorldStreet"
      className="ws-search"
      onSubmit={() => addRecentSearch(value)}
    >
      <div className="ws-search__field">
        <MagnifyingGlassIcon className="ws-search__icon" />
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={close}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-label="Search for anything"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={expanded && active >= 0 && active < options.length ? optionId(active) : undefined}
          placeholder="Search for anything"
          autoComplete="off"
          enterKeyHint="search"
          maxLength={200}
          className="ws-search__input"
        />
        {Object.entries(keep).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <button type="submit" className={buttonClass({ size: "sm", className: "ws-search__submit" })}>
          Search
        </button>
      </div>
      <div className="ws-suggest" hidden={!expanded}>
        <ul id={listId} role="listbox" aria-label="Search suggestions">
          {group("Recent searches", recent, 0)}
          {group("Trending", popular, recent.length)}
        </ul>
        {recent.length > 0 && (
          <button type="button" className="ws-suggest__clear" onMouseDown={(e) => e.preventDefault()} onClick={clearRecentSearches}>
            Clear recent searches
          </button>
        )}
      </div>
    </Form>
  );
}
