# Messaging fills the viewport width

Written against: df1d38e (plus uncommitted messaging redesign)

## Evidence chain

- Surface: `/inbox`, `/inbox/[id]`, `/offers` at wide viewports
- Problem: owner screenshot (2026-10-07 21:12, ~2000px) shows ~230px of unused page on each side of the chat frame.
- Design evidence: owner direction 7 Oct: "it should fill the width". Three-pane chat references are full-bleed.
- Owner: `app/(shop)/layout.tsx` wraps every page in `main.cx-container` (max-width `calc(var(--cx-container) + 2 * var(--cx-gutter))` = 1380px, `styles/ds/base.css:71`); `styles/marketplace/negotiation.css` adds `.ws-deal-page { max-width: 1440px }`.
- Scope and affected surfaces: the chat pages only; other shop pages keep the container.
- Uncertainty: none.

## Design decision

Lift both caps only where the chat page renders, keeping the DS gutter as page padding. Thread list and deal panel keep their widths; the conversation column takes the extra space, and bubbles keep their reading cap.

## Reuse

- `--cx-gutter` for side padding; `.cx-container` untouched for other pages.

## Changes

1. `styles/marketplace/negotiation.css`
   - Change: `main.cx-container:has(> .ws-chat-page) { max-width: none; }`; remove `max-width`/`margin-inline` from `.ws-deal-page`. Widen the panes at ≥1600px (list 360px, deal 380px).
   - Preserve: bubble `max-width: min(72%, 520px)`, phone/tablet layouts.
   - Verify: at 2000px the frame spans viewport minus 2 × gutter.

## Scope

- Inherit: Inbox, Offers. Exclude: every other shop page.

## Validation

- Interface: 1440, 2000, 1024, 375. Repository: `npm run check` → exit 0; `npx playwright test e2e/negotiation.spec.ts` → pass.

## Stop conditions

- Stop if another page renders `.ws-chat-page`.

## Design documentation

- Record in docs/marketplace/PROGRESS.md deviations: chat pages are full-bleed.
