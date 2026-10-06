"use client";

import { AnimatePresence, m } from "motion/react";
import Form from "next/form";
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { ArrowUpGraphIncreaseIcon, ClockIcon, MagnifyingGlassIcon, XmarkCircleIcon } from "@/components/icons";
import { useMagnetic } from "@/components/motion/useMagnetic";
import { buttonClass } from "@/components/ui";
import { rules } from "@/config/marketplace-rules";
import { spring } from "@/lib/motion/tokens";
import { suggestionMatch } from "@/lib/search/words";
import { addRecentSearch, clearRecentSearches, removeRecentSearch, useRecentSearches } from "./recent";
import { SuggestionText } from "./SuggestionText";

/* GlobalSearchBox, Sprint 0 version (spec §3, flows B2 step 1): a GET form to /search
   (next/form: works before scripts, navigates client-side after) with recent and
   trending searches. Behaviour from the UI research (Baymard autocomplete, eBay
   combobox, WAI-ARIA APG):
   - suggestions match the way results do (word prefixes, local spellings) and bold the
     part the buyer didn't type;
   - ↑ ↓ put the highlighted suggestion in the field; Escape puts back what was typed;
   - a Clear button; recent searches can be removed one at a time (Shift+Delete or ×).
   Live suggestions, the scope select and image search arrive with the header (Phase 1). */

type Props = {
  defaultValue?: string;
  trending: readonly string[];
  /** Params to keep on a new search, e.g. a non-default radius. */
  keep?: Record<string, string>;
  /** False after a prohibited search (EC-004): no suggestions at all. */
  suggestions?: boolean;
  /** A term never to keep in recent searches (the prohibited one just searched). */
  forget?: string;
  /** Id for the input (the skip link "Skip to search" targets the header's box). */
  inputId?: string;
};

type Option = { term: string; kind: "recent" | "trending" };

export function GlobalSearchBox({ defaultValue = "", trending, keep = {}, suggestions = true, forget, inputId }: Props) {
  const id = useId();
  const listId = `${id}-list`;
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  useMagnetic(submitRef);
  /** What the buyer typed (filters the list) and what the field shows (follows ↑ ↓). */
  const [typed, setTyped] = useState(defaultValue);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const recents = useRecentSearches();

  useEffect(() => {
    if (forget) removeRecentSearch(forget);
  }, [forget]);

  const q = typed.trim().toLowerCase();
  const fits = (t: string) => t.toLowerCase() !== q && suggestionMatch(t, typed) !== null;
  const recent: Option[] = suggestions ? recents.filter(fits).slice(0, rules.search.recentShown).map((term) => ({ term, kind: "recent" })) : [];
  const popular: Option[] = suggestions
    ? trending
        .filter((t) => fits(t) && !recents.some((r) => r.toLowerCase() === t.toLowerCase()))
        .slice(0, rules.search.trendingShown)
        .map((term) => ({ term, kind: "trending" }))
    : [];
  const options = [...recent, ...popular];
  const expanded = open && options.length > 0;

  const close = () => {
    setOpen(false);
    setActive(-1);
  };
  const highlight = (i: number) => {
    setActive(i);
    setValue(i >= 0 ? options[i].term : typed);
  };
  const choose = (term: string) => {
    flushSync(() => {
      setTyped(term);
      setValue(term);
    });
    close();
    formRef.current?.requestSubmit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (options.length === 0) return;
      if (!expanded) setOpen(true);
      // -1 is the typed text; moving past either end comes back to it.
      const step = e.key === "ArrowDown" ? 1 : -1;
      highlight(((active + 1 + step + options.length + 1) % (options.length + 1)) - 1);
    } else if (e.key === "Escape") {
      // Never let Escape wipe the field (the native search input clears on Escape).
      e.preventDefault();
      if (expanded) {
        setValue(typed);
        close();
      }
    } else if (e.key === "Enter" && expanded && active >= 0 && value !== options[active].term) {
      // Highlighted with the pointer, not the keyboard: search for that row.
      e.preventDefault();
      choose(options[active].term);
    } else if (e.key === "Delete" && e.shiftKey && expanded && active >= 0 && options[active].kind === "recent") {
      e.preventDefault();
      removeRecentSearch(options[active].term);
      setValue(typed);
      setActive(-1);
    } else if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key) && active >= 0) {
      // Editing the highlighted suggestion makes it what the buyer typed.
      setTyped(value);
      setActive(-1);
    }
  };

  const clear = () => {
    setTyped("");
    setValue("");
    setActive(-1);
    setOpen(true);
    inputRef.current?.focus();
  };

  const onBlur = (e: FocusEvent<HTMLFormElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close();
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
            const Icon = o.kind === "recent" ? ClockIcon : ArrowUpGraphIncreaseIcon;
            return (
              <m.li
                key={o.term}
                id={optionId(i)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring.soft, delay: i * 0.025 }}
                role="option"
                aria-selected={i === active}
                className="ws-suggest__option"
                onMouseDown={(e) => e.preventDefault()}
                onMouseMove={() => i !== active && setActive(i)}
                onClick={() => choose(o.term)}
              >
                <Icon />
                <span className="ws-suggest__text">
                  <SuggestionText text={o.term} typed={typed} />
                </span>
                {o.kind === "recent" && (
                  // Pointer shortcut; keyboard users have Shift+Delete.
                  <span
                    className="ws-suggest__remove"
                    aria-hidden="true"
                    title="Remove from recent searches"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(o.term);
                      setActive(-1);
                    }}
                  >
                    <XmarkCircleIcon />
                  </span>
                )}
              </m.li>
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
      onSubmit={() => {
        if (suggestions) addRecentSearch(value);
        close();
      }}
      onBlur={onBlur}
    >
      <div className="ws-search__field">
        <MagnifyingGlassIcon className="ws-search__icon" />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          name="q"
          value={value}
          onChange={(e) => {
            setTyped(e.target.value);
            setValue(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
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
        {value && (
          <button type="button" className="ws-search__clear" aria-label="Clear search" onMouseDown={(e) => e.preventDefault()} onClick={clear}>
            <XmarkCircleIcon />
          </button>
        )}
        {Object.entries(keep).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <button ref={submitRef} type="submit" className={buttonClass({ size: "sm", className: "ws-search__submit" })}>
          Search
        </button>
      </div>
      {/* Opens from the field with a spring; rows stagger in. */}
      <AnimatePresence>
        {expanded && (
          <m.div
            key="panel"
            className="ws-suggest"
            style={{ transformOrigin: "top center" }}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } }}
            transition={spring.snappy}
          >
            <ul id={listId} role="listbox" aria-label="Search suggestions">
              {group("Recent searches", recent, 0)}
              {group("Trending", popular, recent.length)}
            </ul>
            {recent.length > 0 && (
              <button type="button" className="ws-suggest__clear" onMouseDown={(e) => e.preventDefault()} onClick={clearRecentSearches}>
                Clear recent searches
              </button>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </Form>
  );
}
