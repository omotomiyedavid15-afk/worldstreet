# Phase 9b Seller Growth UI Cleanup

**Goal:** Remove verified visual inconsistencies from the Phase 9b seller import, analytics, and listing-toolbar surfaces without changing their product behavior or WorldStore identity.

**Architecture:** Keep the existing `SellerShell`, `HubPages`, design-system buttons/cards, and `--cx-*` tokens. Make the smallest changes in the Phase 9b markup and `styles/marketplace/growth.css`, with regression coverage in the existing seller-growth Playwright flow.

**Approach:** Apply a narrow UI patch to the Phase 9b owners. A broader Seller Hub restyle was rejected because it would disturb already-verified Phase 7 surfaces and exceed the requested consistency cleanup.

## Task 1: Capture current rendered evidence

**Files:**
- Inspect: `features/sell/HubPages.tsx`
- Inspect: `styles/marketplace/growth.css`
- Test: `e2e/seller-growth.spec.ts`

**Steps:**
1. Open `/vendor/import`, `/vendor/analytics`, and `/vendor/listings` with seeded seller data.
2. Capture desktop and mobile screenshots and console errors.
3. Compare spacing, hierarchy, overflow, and action presentation with existing Seller Hub surfaces.

**Verification:** Playwright against `http://localhost:3012` at 1280×800 and 375×812.

## Task 2: Apply the narrow UI corrections

**Files:**
- Modify: `features/sell/HubPages.tsx`
- Modify: `styles/marketplace/growth.css`
- Modify only if required by evidence: `features/sell/SellerHub.tsx`

**Steps:**
1. Reuse existing design-system primitives and tokens.
2. Correct only the verified hierarchy, spacing, wrapping, and responsive inconsistencies.
3. Preserve CSV import/export, promotions, analytics calculations, and navigation behavior.

**Verification:** `npm run lint -- features/sell/HubPages.tsx features/sell/SellerHub.tsx` and focused unit tests.

## Task 3: Verify the affected flows

**Files:**
- Test: `e2e/seller-growth.spec.ts`

**Steps:**
1. Run Phase 9b unit tests.
2. Run seller-growth Playwright checks at desktop and mobile widths.
3. Confirm the CSV export download and axe checks pass.
4. Run `npm run check` if focused checks pass.

**Verification:** `npm test -- features/sell/growth.test.ts`, focused Playwright, then `npm run check`.
