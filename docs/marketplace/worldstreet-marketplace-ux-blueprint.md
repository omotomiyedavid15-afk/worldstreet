# WorldStreet Marketplace — UX Audit & eBay-Parity Blueprint

Prepared 6 Oct 2026 · Author: Claude (Cowork) for Greatness Omotomiye

---

## 0. Read this first: scope and honesty notes

| Item | Status |
|---|---|
| eBay homepage, search results, item page, selling landing page, Money Back Guarantee policy | **Observed live** (6 Oct 2026 session, shipping destination auto-detected as Nigeria) |
| eBay sign-in-gated flows (cart, checkout, My eBay, Seller Hub, listing form, messages, disputes) | **Not observed.** Described from public eBay documentation patterns and general knowledge. Marked `[inferred]` |
| WorldStreet sandbox (`worldstreet-sandbox-hvxp-jivq5ns22.vercel.app`) | **Audited live** after you opened access (Section 3A). Tested the home page at a ~780px and a ~1350px viewport, using clicks and DOM/computed-style checks. Single run, not a lab benchmark |
| WorldStreet design/component intent | Taken from your own project notes (Phases 1–3, v5 tokens). Used only to map the roadmap, not to claim what is or isn't live |

**Scope limit of the live audit:** the sandbox is a front-end prototype with one page. Search, listing detail, Create listing, notifications and the bottom-nav tabs do not lead anywhere yet, so I could not test the item page, checkout, seller wizard or messaging. Those remain scorecard items in Section 3B. Not tested: a true 375px phone width, real-device performance, screen reader.

---

## 1. What eBay actually is (the model you are replicating)

eBay is not "a product grid". It is five interlocking systems. Replicating the UI without the systems gives you a catalogue, not a marketplace.

1. **Discovery engine** — search-first home, faceted search, saved searches, personalised feeds.
2. **Trust engine** — seller reputation, buyer protection, authenticity checks, verified feedback.
3. **Transaction engine** — Buy It Now, Best Offer, Auction, cart, unified checkout, payments held and released.
4. **Fulfilment engine** — shipping rules, delivery estimates, labels, tracking, returns.
5. **Seller engine** — listing creation, inventory, promotion, fees, performance standards.

Everything below is organised by these systems.

---

## 2. eBay teardown — observed evidence and the UX principle behind it

### 2.1 Homepage (observed)

**What is there**
- Utility bar: Sign in / register, Deals, Brand Outlet, Help & Contact, **ship-to postcode**, Sell, My eBay, notifications bell, cart.
- Primary bar: logo, "Shop by category", **one large search field with camera (image search) icon and a category scope dropdown**, Search button.
- Category rail: Saved, Electronics, Motors, Fashion, More.
- Hero carousel with **coupons** ("Save 20% on your wish list", dates, max-discount and use-count stated in the small print), pause control.
- Editorial tiles ("Whatever you're into…"), then "Today's Deals" with price + struck-through original price + "free shipping" label, then Trending tabs, then sign-in nudge ("Get more with an eBay account").
- On first load a **modal asks "Are you shipping to [postcode]?"** with country + zip and a Confirm button.

**Why it works**
- Search is the dominant control. Browsing is secondary. Users arrive with intent.
- Shipping destination is captured **before** showing prices, because on eBay shipping often decides the purchase (see 2.3).
- Deals are shown with real was/now prices, which gives a fast value signal.
- Sign-in is requested as a benefit, not a wall. Guests can browse, search, view items and add to cart.

**Weak points worth beating**
- The location modal blocks the hero on first paint; it can be a small inline bar instead.
- Heavy promo density competes with the search box on mobile.

### 2.2 Search results (observed: "sony headphones")

**What is there**
- Left rail: Category tree, Shipping to, Delivery Options, then **faceted filters with counts** (Type: Earbud 4,405, Ear-Cup 5,845 …). Popular Filters as chips (Bluetooth, USB-C, colour).
- Result header: **"15,000+ results for sony headphones"**, **Save this search** (heart), Buying Format and Condition dropdowns, **Sort (Best Match)**, grid/list toggle.
- Sponsored seller banner at top ("49K items sold · Shop store on eBay"). Sponsored rows are labelled.
- Each result card contains, in order: image, title, **condition badge** (Brand New / Certified Refurbished / Open Box / Pre-Owned), star rating + review count, **price**, **format** (Buy It Now / or Best Offer), **delivery cost line**, **item location**, **social proof** ("64+ sold", "22 watchers", "Last one", "Almost gone"), coupon line, **seller name + % positive + feedback count**, programme badge (eBay Refurbished).
- "Related searches", "Include description" checkbox, "Find more like this" tooltip for visual similarity.

**Why it works**
- Every card answers the five questions a buyer silently asks: *what is it, what state, how much in total, who is selling, can I trust them.*
- Scarcity and demand cues ("Last one", "watchers") are factual and tied to inventory/engagement data.
- Filters are counted, so users never hit zero-result dead ends blindly.

**Critical lesson from the data (observed):** a pre-owned Sony MDR-XB550 listed at **$14.99 had $120.81 delivery** to Nigeria; a $20.90 watch had $34.41 delivery. For cross-border buyers the *landed cost* is the real price. eBay shows it in small grey text on the card. **You can win here** by showing a single "Total to Lagos" figure.

### 2.3 Item page (observed)

**Information hierarchy, top to bottom**
1. Gallery with thumbnails and a "**IN 137 CARTS**" urgency badge.
2. Title.
3. **Seller strip**: name, feedback count, % positive, "Seller's other items", **Message**.
4. **Price** (with unit price, was-price and discount % when applicable), **Condition** (with definition link), variation selectors (colour), **Quantity with "6 available · 1,350 sold"**, optional "Sale ends in 5d 20h".
5. Three actions: **Buy It Now** (primary), **Add to cart** (secondary), **Add to Watchlist** (tertiary). Best Offer and Place Bid appear here when the format allows.
6. Demand line: "People want this. 1205 people are watching this."
7. **Reassurance line: "Breathe easy. Returns accepted."** / "Free returns."
8. **Shipping, returns, and payments** block: shipping cost + method, item location, import-fee warning, **delivery date range to your postcode**, handling time, return window and who pays return shipping, accepted payment icons.
9. **Shop with confidence**: Top Rated Plus explanation, Money Back Guarantee.
10. **Item specifics** (structured attributes: Brand, Model, MPN, UPC, Connectivity…), seller notes, "About this item", item number, "Last updated … View all revisions" (change history is public).
11. **About this seller**: join date, response time, bio, Visit store, Message seller, Save seller.
12. **Detailed seller ratings** (Accurate description 4.9, Shipping cost 5.0, Shipping speed 4.9, Communication 5.0).
13. **Feedback list**: filter tabs (This item / All items), topic chips (Quality, Value, Fit…), masked buyer IDs with their own feedback score, "Verified purchase", time bucket ("Past 6 months").
14. Cross-sell modules: "People who viewed this also viewed", "Similar items", Best Sellers / Top Rated for the category, breadcrumb, related searches.

**Why it works**
- The decision-critical facts (price, condition, total shipping, arrival date, return policy, seller trust) are all above or immediately below the buy buttons.
- Trust is layered: seller score → rating dimensions → verified buyer reviews → platform guarantee.
- Revision history and structured specifics reduce disputes.

### 2.4 Money Back Guarantee (observed policy page)

- Covers three cases: **item not received**, **item not as described / damaged**, **seller not honouring stated return policy**.
- Only for payments completed **inside** eBay checkout. Off-platform payment voids cover. This is the platform's core defence against fraud and its core revenue protection.
- Explicit exclusions (real estate, services, vehicles, digital goods, etc.).
- Separate flows for buyer and seller, time-boxed appeals, refund/reimbursement and payment-hold rules.

### 2.5 Selling landing page (observed) and listing flow `[inferred]` for steps behind login

**Observed:** "List an item", AI-assisted pricing and descriptions, "only pay a final value fee when it sells", six listing tips (specific title, multi-angle photos, choose Buy It Now vs Auction, price from recent sales, promoted listings, delivery label), FAQ (fees, shipping, tax, payouts, protection).

**Inferred listing flow:** identify the item (search catalogue / scan barcode / upload photos) → category and item specifics auto-filled → condition → photos and video → title + description → format and price (BIN / Auction / Best Offer, reserve, duration) → shipping (service, weight, dimensions, handling time, domestic and international) → returns policy → promote (optional) → fee preview → list. Then Seller Hub: Overview, Orders, Listings, Marketing, Performance, Payments, Reports.

### 2.6 Flows behind login `[inferred]`

- **Cart**: grouped by seller, per-seller combined shipping, coupon entry, save for later.
- **Checkout**: single page: ship-to address, delivery method per seller, payment method, review, Confirm and pay. Price, shipping, tax/import fee totals shown before commitment.
- **Post-purchase**: order page, tracking, message seller, return/report-a-problem, leave feedback.
- **Offers**: buyer submits a Best Offer (limited counts), seller accepts / counters / declines within 48 h.
- **Auctions**: bid, max-bid (proxy bidding), outbid notifications, sniping window, auto-win to checkout.

---

## 3A. Live audit of the WorldStreet sandbox (observed 6 Oct 2026)

### What is already strong (keep it)
- **Trust is stated up front.** A three-part strip under the hero: "Escrow on every deal", "Delivery you can follow (with the rider's number)", "Paid into your wallet". This is stronger than eBay's home page, which buries protection. Keep it.
- **Local-first positioning.** Ship-to is a visible control in the header: "Lagos · 10 km" with 5/10/25 km and "Anywhere in Nigeria". Cards show seller area, distance and posted time ("Lekki, Lagos · 3.2 km · 2h ago"). eBay has nothing like this.
- **Card content is rich and honest:** condition label, star rating with count, was/now price, "Free delivery", verified tick on seller, photo count (1/8).
- **Responsive shell:** desktop header with location, category scope, search, Create listing, avatar; mobile switches to a floating bottom nav (Home, Search, Saved, Sell, Inbox, More/switch module). No horizontal scroll at the tested widths.
- **Good micro-feedback:** the heart gives a toast "Added to Saved — Find it any time under Saved items."; sort and category filters update instantly with a result line ("4 listings in this filter") and a Clear action.
- **Accessibility foundations present:** `lang="en"`, skip link, `main`/`nav`/`header`/`footer` landmarks, carousel marked up as a carousel, star ratings read as "rated 4.9 out of 5", search box labelled.
- **Footer already maps the full eBay-style service surface:** Buyer protection, Open a dispute, Report a listing, Safety tips, Seller tools, Fees and payouts, Shipping labels, plus the WorldStreet cross-product links.

### Findings (ranked)

| ID | Sev | Finding | Evidence | Why it matters | Fix |
|---|---|---|---|---|---|
| F1 | S1 | **Listing cards go nowhere.** Clicking a title only shows an underline; URL does not change. The `<article>` contains no link. | 0 links inside cards; `h3` is plain text | The core buy path (card → detail) does not exist yet. Also no way to share or deep-link a listing | Make the title a real `<a href="/listing/:id">` with a stretched-link pattern so the whole card is clickable; keep heart as a separate button |
| F2 | S1 | **Search does nothing.** Typing "head" and pressing Enter changes nothing: no results, no URL change, no suggestions. Mobile Search tab only changes its highlight. | URL stays `/`; no results region | Search is the dominant eBay behaviour and your header's centrepiece | Route to `/search?q=`; add autosuggest; show result count and highlights; build zero-result state |
| F3 | S1 | **Price sort ignores currency.** "Price ↑" ordered €249.99, then $289.30, then ₦12,000. | Observed sort order | Sorted by face value across ₦/$/€. A ₦12,000 item is ranked as "more expensive" than a €249 one. Buyers will lose trust in every sorted list | Store one canonical price in NGN (plus original currency for display); sort and filter on the canonical value |
| F4 | S1 | **Mixed currencies on one page, no conversion.** Smartwatch `$289.30`, camera `€249.99`, everything else `₦`. | Cards | Naira-first buyers cannot compare; escrow and wallet are NGN. Also conflicts with your own `formatCurrency()` rule | Show ₦ as the primary price; if a seller prices abroad, show "≈ ₦X (listed at $289.30)". Prefer disallowing non-NGN listing currency in v1 |
| F5 | S2 | **Primary actions are dead:** "Create listing", "Start selling", notifications bell (12 unread), avatar menu, bottom-nav Search/Sell/Inbox. Real hrefs exist (`/sell/new`, `/vendor`, `/categories`) but no destination renders; 18 of 23 anchors are `href="#"`. | Click tests; anchor audit | Dead ends in the sandbox are fine, but a number badge of 12 with no panel looks broken in demos | Wire or hide; ship placeholder routes with clear "coming in Phase X" states |
| F6 | S2 | **Counts contradict each other.** Chip "Electronics (942)" but result line says "4 listings in this filter"; "16 listings near Lagos" includes Abuja, Ibadan and Port Harcourt items; Abuja sofa shows "1.1 km" and Port Harcourt camera "22 km" while the buyer is set to Lagos 10 km. | Observed | Breaks the promise of the location control. A 10 km filter should never show a 118 km item | Compute distance from the buyer's chosen anchor; apply the radius filter; separate "Nationwide" from "Near you"; label chip counts as "in current area" |
| F7 | S2 | **Low text contrast on cards.** Condition label (10px), seller location (11.5px) and review count (12.5px) are grey `rgb(114,114,114)` on the dark card: ≈ 3.1:1. "2h ago" text with 85% opacity measured ≈ 2.0:1. | Computed styles | Fails WCAG AA 4.5:1 for small text; 10–12px sizes make it worse. These are exactly the facts a buyer scans | Raise secondary text to ≥ 4.5:1 (about `#9A9A9A` or lighter on this surface) and minimum 12px; condition label to 12px |
| F8 | S2 | **Hero carousel auto-advances with no pause control** (slides changed between my screenshots). A floating unlabelled round button sits on the right edge. | 0 pause/play buttons found | WCAG 2.2.2 (Pause, Stop, Hide); also distracting | Add Pause/Play, stop autoplay on hover/focus, respect `prefers-reduced-motion`; label the floating button or remove it |
| F9 | S2 | **Heart does not expose state.** `aria-label` is always "Save listing", no `aria-pressed`. | DOM | Screen reader users cannot tell if an item is saved | `aria-pressed` and label swap ("Remove from saved") |
| F10 | S2 | **Touch targets too small.** 151 interactive elements measured under 44×44px at the tested width (the icon buttons and chips). | DOM | Mobile mis-taps; WCAG 2.5.8 minimum is 24px, but 44px is the practical target | Increase hit areas with padding, not visual size |
| F11 | S3 | **No `<h1>` on the page.** Headings jump straight to `h2`. | 0 `h1` | Weak document outline for assistive tech and SEO | Visually-hidden `h1` ("WorldStreet Marketplace — buy and sell near you") |
| F12 | S3 | **Missing alt text and unnamed controls:** 7 images without `alt`, 5 buttons without an accessible name. | DOM | Silent controls for screen readers | Add `alt=""` for decorative, descriptive alt for category and photo images; name every button |
| F13 | S3 | **Social proof looks reused/fabricated.** "4.8 (1,203 reviews)" appears on two different listings (smartwatch and laptop), same seller; "4.6 (312)" on two items from one seller; "4.9 (247)" on two items from one seller; all three are seller-level scores shown as item reviews. | Card data | If seller totals are shown as item reviews, buyers will think reviews are fake. A sofa with "5.0 (1 review)" looks a lot more credible than a 1,203-review badge on a used laptop | Label clearly: "Seller 4.8 (1,203)" vs "This item 4.9 (12)". Never show a number the buyer can't trace |
| F14 | S3 | **Same listing repeated** across Near you, Deals and All listings with identical cards; carousel has 15 slides with dot pagination that is too long for dots. | Page text | Page feels longer and more repetitive than the catalogue (16 items) really is | Replace dots with "3 of 15" counter; vary modules |
| F15 | S3 | **Performance on first load looked heavy:** ~1.6 MB transferred over 37 requests, DOM ready ≈ 4.0 s, load ≈ 5.3 s, LCP ≈ 4.5 s on this one cold run (my connection, not a lab test). JS is ~250 KB compressed. 41 of 67 images are lazy-loaded. | Performance API | Over the 2.5 s LCP target; Lagos mobile networks will be slower | Preload the hero image, serve AVIF/WebP at several sizes, cap hero to the visible slide, test with Lighthouse on throttled 4G |
| F16 | S3 | **Missing app metadata:** no Open Graph tags, no web manifest (service worker is present). | `<head>` | Links shared on WhatsApp will have no preview card; no "install" prompt | Add OG title/image/description per listing; add manifest and icons |
| F17 | S3 | **Sticky chrome is tall.** Header plus category rail consume ≈ 75px on desktop and a bottom nav floats over content on mobile (it overlapped the "Deals ending soon" heading in a screenshot). | Screenshots | Reduces viewport for content; the floating nav covers text | Add bottom padding equal to nav height; collapse the category rail on scroll |

### What this tells us about eBay parity
Your **home page is already ahead of eBay on trust messaging and local context.** The gap is the transaction spine: card → listing → offer/buy → checkout → order tracking → dispute, plus real search. Fix F1–F4 first; everything in Section 4 depends on them.

### Quick-win checklist (one sprint)
1. Make cards real links and create a `/listing/:id` stub (F1).
2. Wire the search box to `/search?q=` with a results list (F2).
3. Single canonical NGN price; fix sort and show the original-currency note (F3, F4).
4. Apply the location radius to the data and fix counts (F6).
5. Contrast, hit-area, `aria-pressed`, `h1`, alt text and carousel pause (F7–F12).

---

## 3B. Remaining audit scorecard (for flows not yet built)

Use this once those screens exist. Method: Nielsen's 10 heuristics + Baymard-style e-commerce checks + WCAG 2.2 AA + Core Web Vitals. Score each item **0 = missing, 1 = partial, 2 = meets**; add a severity (S1 blocker, S2 major, S3 minor) and an evidence screenshot. Target ≥ 85% before beta.

### 3.1 Discovery
| # | Check | eBay benchmark | Score | Severity | Evidence |
|---|---|---|---|---|---|
| D1 | Search is the most prominent control on home; scope dropdown present | Yes | | | |
| D2 | Autosuggest with recent searches, categories, and popular terms | Yes | | | |
| D3 | Image/camera search or "find similar" | Yes | | | |
| D4 | Category navigation reachable in ≤ 1 click from any page | Yes | | | |
| D5 | Ship-to / location context set before prices are shown | Yes | | | |
| D6 | Deals module shows was/now price | Yes | | | |
| D7 | Guest can browse, search, view, and add to cart without signing in | Yes | | | |
| D8 | Personalised modules (recently viewed, based on your watchlist) | Yes | | | |

### 3.2 Search & filtering
| # | Check | Score |
|---|---|---|
| S1 | Result count and active-filter chips always visible and removable | |
| S2 | Facets show counts and update live without a full reload | |
| S3 | Filters: price range, condition, format, location, seller rating, free shipping/delivery, brand, category-specific attributes | |
| S4 | Sort: best match, price ↑↓ (with delivery), newest, ending soonest, nearest | |
| S5 | Save search + alert | |
| S6 | Zero-result page offers corrections and broader searches | |
| S7 | Sponsored items clearly labelled | |
| S8 | Mobile: filters in a bottom sheet with an Apply button and live count | |

### 3.3 Listing card (your `ListingCard`, 5 variants)
| # | Check | Score |
|---|---|---|
| C1 | Image ratio fixed to prevent layout shift; lazy-load below fold | |
| C2 | Shows condition badge, price, **total delivered cost**, location | |
| C3 | Shows seller name + rating or verified badge | |
| C4 | Format indicated (Buy now / Offers / Auction + time left) | |
| C5 | Save/watch control ≥ 44×44 px with accessible name and state | |
| C6 | Social proof is factual (sold count, watchers), never fabricated | |
| C7 | Currency uses `formatCurrency()` consistently (₦ glyph bug history) | |
| C8 | Entire card is one link target; no nested interactive traps | |

### 3.4 Listing detail
| # | Check | Score |
|---|---|---|
| L1 | Gallery: zoom, swipe, keyboard, video, thumbnails, count | |
| L2 | Price, condition, quantity, primary CTA all above the fold on 375×812 | |
| L3 | Sticky bottom CTA bar on mobile | |
| L4 | Delivery estimate and cost to the buyer's location | |
| L5 | Return policy and protection stated next to the CTA | |
| L6 | Seller card: reputation, response time, other items, message | |
| L7 | Structured item specifics + free-text description | |
| L8 | Reviews: verified-purchase tag, rating breakdown, filter and sort | |
| L9 | Make Offer and Contact Seller modals trap focus, validate, and confirm | |
| L10 | Report listing / safety tips visible | |

### 3.5 Cart & checkout
| # | Check | Score |
|---|---|---|
| K1 | Cart grouped by seller with per-seller subtotals | |
| K2 | Guest or low-friction checkout; express wallets | |
| K3 | Address form with autocomplete and Nigeria-specific fields (state/LGA, landmark, phone) | |
| K4 | All costs (item, delivery, fees, discount) shown before the pay button | |
| K5 | Inline validation, error summary, and preserved input | |
| K6 | Payment held in escrow, release rules explained | |
| K7 | Order confirmation page and email/SMS | |

### 3.6 Seller side (Phase 3 scope)
| # | Check | Score |
|---|---|---|
| M1 | `CreateListingWizard`: draft autosave, progress, per-step validation, preview | |
| M2 | Photo upload: drag/drop, reorder, crop, compression, progress | |
| M3 | Price guidance from comparable sold items | |
| M4 | Fee preview before publish | |
| M5 | `ListingsManagementTable`: bulk actions, filters, status, inline edit, empty/error states | |
| M6 | `OrderStatusTimeline` states match real fulfilment states | |
| M7 | Messaging: unread counts, attachments, safety warnings, offer threads | |

### 3.7 Cross-cutting
| # | Check | Score |
|---|---|---|
| X1 | Contrast ≥ 4.5:1 for text. Check gold `#E2B43F` on white (likely **fails** for text; use only as fill with dark text) | |
| X2 | Focus ring visible on every control; logical tab order | |
| X3 | Touch targets ≥ 44 px; no hover-only functionality | |
| X4 | `prefers-reduced-motion` respected | |
| X5 | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 on a throttled 4G Android profile | |
| X6 | Skeletons, empty, error, offline states for every list | |
| X7 | Breakpoints 360/480/768/1024/1400 verified, no horizontal scroll | |
| X8 | Copy tone consistent; no lorem or placeholder content | |
| X9 | Page `<title>`, meta, structured data (`Product`, `Offer`) for SEO | |
| X10 | Auth, deployment-protection, and error pages designed, not default | |

> Note on X1: the live sandbox uses a lime-yellow accent with dark text on a dark theme, and its main contrast problem is the grey secondary text (see F7). Re-check any gold `#E2B43F` usage on light surfaces when a light theme ships.

---

## 4. Target UX — the WorldStreet buy/sell system, built upward from eBay

### 4.1 Design principles
1. **Search first.** The header search box is the hero on every page.
2. **Landed cost, not list price.** Always show "Total to [your city]".
3. **Trust at the point of decision.** Seller score, protection, and return policy sit beside the buy button.
4. **Keep money inside the platform.** Escrow plus clear protection; warn on off-platform contact.
5. **Progressive disclosure.** Essentials on the card; depth on the item page; detail on demand.
6. **Mobile is the primary canvas** (Lagos traffic is mobile-heavy and bandwidth-constrained). Desktop is an enhancement.
7. **One component, one job.** Honour your reuse chain (Button → Toast → Table → Modal, Badge → Avatar).

### 4.2 Information architecture

```
Home
├─ Search results  (/search?q=&filters)
│   └─ Listing detail  (/listing/:id)
│        ├─ Make offer / Place bid / Buy now
│        ├─ Contact seller (thread)
│        └─ Seller profile (/seller/:handle)
├─ Category landing (/c/:slug)
├─ Deals / Auctions ending soon
├─ Watchlist / Saved searches / Saved sellers
├─ Cart  → Checkout → Order confirmation
├─ My Account
│   ├─ Orders (buying)  → Order detail → Track / Return / Report a problem
│   ├─ Offers & bids
│   ├─ Messages
│   ├─ Addresses, Payment methods, KYC
│   └─ Notifications & preferences
└─ Sell
    ├─ Create listing (wizard)
    └─ Seller Hub
         ├─ Overview (sales, views, to-do)
         ├─ Listings
         ├─ Orders (to ship, shipped, returns, disputes)
         ├─ Messages & offers
         ├─ Promotions
         ├─ Performance (standards, feedback)
         └─ Payouts & reports
```

### 4.3 Buyer flow (happy path)

1. **Land** → location pre-set from IP, one-tap confirm in an inline bar (not a blocking modal).
2. **Search** → autosuggest → results with live filters.
3. **Scan cards** → every card shows condition, price, **total delivered**, seller trust, format.
4. **Open listing** → decide in one screen: price, condition, delivery date to me, return policy, seller rating, protection.
5. **Choose action**
   - *Buy now* → checkout.
   - *Add to cart* → mini-cart drawer with "Continue shopping / Checkout".
   - *Make offer* → `OfferModal` (amount, optional message, expiry shown, remaining offers counter).
   - *Bid* → bid input, max-bid explanation, outbid alerts.
   - *Watch* → heart, confirmation toast, appears in Watchlist.
6. **Checkout (single page, 3 stacked sections)**: Ship to → Delivery per seller → Pay. Order summary sticky on desktop, collapsible on mobile. Final button states the total ("Pay ₦84,500").
7. **Confirmation** → order number, estimated delivery, "what happens next", message seller.
8. **Track** → `OrderStatusTimeline`: Paid → Seller preparing → Shipped → Out for delivery → Delivered → Funds released.
9. **Confirm receipt / auto-release** after a window → **review** prompt (verified purchase).
10. **Problem?** → "Report a problem" wizard: Not received / Not as described / Damaged → evidence upload → seller response clock → platform decision.

### 4.4 Seller flow (happy path)

1. **Become a seller** → verify phone + ID/KYC (reuse your KYC-gated action pattern), payout account, seller agreement.
2. **Create listing** (`CreateListingWizard`): Photos → Category and specifics (auto-suggest from title/photo) → Condition → Title and description → Format and price (with comparable sold data) → Shipping → Returns → Review with fee preview → Publish.
3. **Manage** in `ListingsManagementTable`: filter by status, bulk edit price/quantity, end listing, relist, promote.
4. **Receive order** → notification → pack → mark shipped with tracking → buyer notified.
5. **Get paid** → funds held until delivery confirmed or window lapses → payout to bank/wallet (tie into your Wallet & Banking module).
6. **Maintain standing** → performance dashboard: defect rate, late shipment, response time, with thresholds and plain-language remedies.

### 4.5 Screen-level specifications

**A. Header (UniversalHeader)**
- Row 1 (utility, desktop only): ship-to, sell, my account, notifications, cart.
- Row 2: logo, category button, **search with scope select + camera**, cart.
- Mobile: logo, search icon expanding to a full-width field, cart; bottom tab bar (Home, Search, Sell, Messages, Account).

**B. Search results**
- Desktop: left filter rail + results grid/list toggle. Mobile: sticky "Filters · Sort" bar opening bottom sheets.
- Always visible: result count, removable filter chips, Save search, sort.
- Card order: image → title → condition + format → price → total delivered → location → seller trust → social proof (factual only).

**C. Listing detail**
- Desktop two columns: gallery left; buy box right (title, seller strip, price, condition, quantity, CTAs, delivery, returns, protection).
- Mobile single column with a **sticky bottom bar** (price + primary CTA).
- Below: item specifics, description, seller card, rating breakdown, verified reviews, similar items, recently viewed.
- Add "last updated / edit history" link as eBay does; it reduces bait-and-switch disputes.

**D. Offer modal**
- Fields: your offer, quantity, optional note. Show seller's accepted-range hint only if the seller enables it. Show "Offer valid 48 h". Confirmation toast and entry in Offers tab.

**E. Cart**
- Grouped by seller; per-seller delivery selector; coupon field; saved-for-later; clear total; Checkout button persistent.

**F. Checkout**
- Section 1 Address (autocomplete, saved addresses, phone mandatory for delivery).
- Section 2 Delivery per seller (cost + date range).
- Section 3 Payment (card, bank transfer, USSD, wallet balance, pay-on-delivery only if you can underwrite the risk).
- Pre-pay summary: items, delivery, fees, discounts, **total in local currency**.
- Trust strip: "Protected by WorldStreet Guarantee".

**G. Report a problem (dispute)**
- Step 1 choose reason, Step 2 evidence (photos, message), Step 3 desired outcome (refund / return / replacement), Step 4 timeline view with seller deadline and escalation button.

**H. Seller Hub Overview**
- Cards: sales (7/30 days), views, offers awaiting reply, orders to ship, messages unanswered, performance status. Primary to-do list at top, not charts.

### 4.6 Trust & safety system (non-negotiable for parity)
- Seller score = % positive + volume + detailed dimensions (description accuracy, shipping speed, communication, packaging).
- Badges: Verified Seller (KYC), Top Rated (performance thresholds), Refurbished/Certified programme if you add one.
- Escrow with release on confirmed delivery or timeout.
- Block off-platform payment prompts in messaging (detect phone numbers, bank details, "pay me outside" patterns) with an inline warning.
- Report listing/user on every page; moderation queue; listing policy.
- Authenticity programme for high-fraud categories (phones, sneakers, watches) when volume justifies.

### 4.7 Local adaptation (do not copy eBay blindly)
- **Currency:** NGN primary, optional USD display; always through `formatCurrency()`. Show exchange basis if converting.
- **Delivery:** eBay's cross-border import-fee and "International Shipping" model is its weakest area for Nigeria buyers. Build **domestic-first** logistics: city-level delivery zones, rider/pickup-station options, delivery range in days.
- **Payments:** card, bank transfer, USSD, mobile wallet; instant-confirmation UX; failure and retry states.
- **Trust:** phone-verified accounts, NIN/BVN-based KYC tiers where legally appropriate (check regulation), visible meet-up safety tips for local pickup.
- **Bandwidth:** image compression, responsive `srcset`, skeletons, minimal blocking JS, offline-friendly watchlist.
- **Language/copy:** plain English first; consider Pidgin or Yoruba/Hausa/Igbo microcopy later.
- **Social proof:** WhatsApp share on listings, since that is a primary distribution channel.

---

## 5. Gap analysis: eBay capability → WorldStreet component map

| eBay capability | WorldStreet component (status per your notes) | Gap / next |
|---|---|---|
| Result card | `ListingCard` ×5 (P1 done) | Add total-delivered line, format/time-left, seller trust row |
| Featured carousel | `FeaturedListingCarousel` ×3 (P1 done) | Add pause control, reduced-motion, keyboard |
| Category rail | `CategoryPills` ×2 (P1 done) | Mega-menu / drawer for deep categories |
| Gallery | `ListingImageGallery` (P2 done) | Zoom, video, 360 optional |
| Seller strip | `SellerCard` (P2 done) | Dimension ratings, response time, follow |
| Feedback | `ReviewCard`, `RatingSummary` (P2 done) | Verified-purchase tag, topic chips, filters |
| Best Offer | `OfferModal` (P2 done) | Counter-offer thread, expiry, offer limits |
| Message seller | `ContactSellerModal` (P2 done) | Link to Phase 3 thread; safety nudges |
| Seller profile | `SellerProfileHeader` (P3 spec) | Stats, badges, store tabs |
| Listing manager | `ListingsManagementTable` (P3 spec) | Bulk actions, inline edit |
| Create listing | `CreateListingWizard` (P3 spec) | Price guidance, fee preview, autosave |
| Orders | `OrderStatusTimeline` (P3 spec) | Dispute states, return states |
| Messaging | `MessageBubble`, `MessageInput` (P3 spec) | Attachments, offer cards in thread |
| Faceted search | not listed | **New:** `FilterRail`, `FilterSheet`, `ActiveFilterChips`, `SortMenu`, `SaveSearchButton` |
| Autosuggest | not listed | **New:** `SearchBox` with suggestions |
| Cart | not listed | **New:** `CartDrawer`, `CartGroupBySeller` |
| Checkout | not listed | **New:** `CheckoutLayout`, `AddressForm`, `DeliverySelector`, `PaymentMethodPicker`, `OrderSummary` |
| Buyer protection | not listed | **New:** `ProtectionBadge`, `ReportProblemWizard`, `DisputeTimeline` |
| Watchlist/alerts | Favorites + Notifications (planned) | Price-drop and ending-soon alerts |
| Auctions | not listed | **New:** `BidPanel`, `CountdownTimer`, `BidHistory` |
| Seller Hub | Phase 4 (planned) | Overview, performance, payouts, promotions |

---

## 6. Roadmap (build upward, each phase shippable)

**Phase 3 (in progress): Seller & Management.** Finish the six components. Add price guidance and fee preview hooks even if data is stubbed.

**Phase 4: Search & Discovery depth** (2–3 weeks). SearchBox + autosuggest, FilterRail/Sheet with counts, active chips, sort, saved search, zero-result state, recently viewed, category landing templates.

**Phase 5: Cart & Checkout** (3 weeks). Cart by seller, address + delivery + payment, order summary, confirmation, emails/SMS, payment failure states, escrow ledger integration with the Wallet module.

**Phase 6: Trust & Resolution** (3 weeks). Verified-purchase reviews, seller dimension ratings, ProtectionBadge, ReportProblemWizard, DisputeTimeline, moderation tools, off-platform-payment warnings.

**Phase 7: Seller Hub** (3 weeks). Overview with to-do list, performance standards, payouts, promotions, bulk listing import, analytics.

**Phase 8: Engagement & growth** (ongoing). Auctions, notifications centre, price alerts, personalisation, WhatsApp sharing, referral, deals/coupons.

**Cross-phase quality gates:** WCAG 2.2 AA check, Lighthouse mobile ≥ 90 on a mid-range Android profile, Storybook story per variant (your 60+ story standard), analytics events per funnel step.

---

## 7. Metrics to design against

| Funnel step | Metric | Target to aim for |
|---|---|---|
| Search | Search-to-click rate; zero-result rate | > 60% / < 5% |
| Listing | View-to-cart/offer/bid | Track baseline, improve 10% per release |
| Cart | Cart-to-checkout start | > 50% |
| Checkout | Checkout completion; payment success rate | > 60% / > 95% |
| Trust | Dispute rate; time to resolution | Under 3% / under 7 days |
| Seller | Time to first listing; listings per active seller | < 10 min / rising |
| Performance | LCP, INP, CLS | 2.5 s / 200 ms / 0.1 |

Targets are starting hypotheses, not eBay-published figures. Calibrate after your first 1,000 sessions.

---

## 8. Immediate next steps

1. Fix F1–F4 from Section 3A (real card links, working search, one canonical NGN price, honest location radius). Then I can re-audit the listing page, offer flow and seller wizard against Section 3B.
2. Decide the **domestic-first logistics model** (own riders, partner couriers, or seller-arranged) because it drives Phase 5.
3. Decide **escrow design** and payment provider with legal review (KYC, payout rules, consumer protection).
4. Approve the new component list in Section 5 so Phases 4–6 can be specced in your existing build-prompt format.

---

## Sources

- eBay homepage, search results ("sony headphones"), item pages, Selling landing page, and Money Back Guarantee policy, observed 6 Oct 2026 (ebay.com).
- WorldStreet project notes (tokens, phases, components) from the user's own workspace.
