# WorldStore Marketplace — Component Spec to Mirror eBay (Web + Mobile)

Built against the live WorldStore Design System (`worldstreet-design-system.vercel.app`, read 6 Oct 2026) and the eBay pages reviewed earlier (home, search results, item page, selling page, Money Back Guarantee policy).
Companions: `worldstreet-marketplace-ux-blueprint.md` (audit + research) and `worldstreet-ux-flows.md` (flows, states, escrow).

---

## 0. How to use this file

1. **Section 1** tells you the design-system rules every new component must follow, and where the current sandbox breaks them.
2. **Section 2** maps the 38 existing design-system components to marketplace jobs, so nothing is rebuilt.
3. **Sections 3–15** list every new component needed to mirror eBay, grouped by area. Each row gives the eBay behaviour it mirrors, how it composes from existing parts, and its web and mobile behaviour.
4. **Section 16** lists the global rules for responsive layout, density, motion, accessibility and performance.
5. **Section 17** lists missing icons and tokens. **Section 18** gives build order and acceptance criteria. **Section 19** is the master checklist.

**Provenance tags:** `[eBay-observed]` = seen live on ebay.com. `[eBay-inferred]` = behind sign-in or from general knowledge. `[WS]` = WorldStore decision. `[DS]` = taken from the design system site. `[Sandbox]` = observed on the marketplace sandbox.

**Count:** 38 existing DS components reused · ~265 new components or variants specified (the Part X checklist has 266 items) · 40 shared hooks/utilities.

---

## 1. Design-system rules to obey

### 1.1 What the design system actually says `[DS]`

| Area | Rule |
|---|---|
| Colour | Stone black + white + one gold family. Gold `#EAB308` primary, gold-bright `#FACC15` accents, gold-pale `#FDE68A` focus, **gold-deep `#A16207` for gold text on light**. Semantic tokens `--cx-bg`, `--cx-elevated`, `--cx-text`, `--cx-text-muted`, `--cx-gain`, `--cx-loss`, `--cx-warning`, `--cx-ember-text`. Every text colour clears WCAG AA. **Money moves in emerald (gain) and red (loss), always with a sign.** |
| Type | **Manrope** for everything. Headings get weight from size, not bold. Numbers are tabular. Scale: Balance 56/300, H1 64/400, H2 52/400, H3 32/500, Lead 20, Body 16, Small 14. |
| Space | 4px base: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Container 1320px. Breakpoints **768** and **1200**. Card padding 24, gutter 30, section 100. |
| Shape | Cards 20px radius with a soft wash and a hairline lit at two corners. Overlays 16px with a shadow. Controls are **pills (100px)**. Shadows only for things that float. |
| Motion | `--cx-ease: cubic-bezier(.22,1,.36,1)`. Durations: fast 140ms, default 240ms, slow 600ms. Springs `--cx-spring`, `-snappy`, `-bouncy`. Animate only `transform`, `opacity`, `filter`. One entrance moment per view. Only aurora, float and marquee loop. Everything stops under reduced motion. |
| Buttons | **One solid accent button per view**; everything else ghost or quiet. |
| Patterns | Aurora cards (bloom, ribbon, low), hover aurora, spotlight, border beam (**once per view**), wallet hero, stats band, CTA block, social proof. |
| Components | 38 live components, imported from `@/components/ui` or via `.cx-` classes. |
| Icons | 398 duotone gold glyphs on a 24px grid; 64 aliases. Includes a Shop group (store, shopping-bag, shopping-cart, tag, truck, package, package-check, package-search, ticket-percent, etc.). |
| Ecosystem | One account and one naira wallet across Dashboard, Academy, Xtreme, Social and Shop. |

### 1.2 Where the sandbox marketplace diverges `[Sandbox]`

| Observed in sandbox | Design system | Action |
|---|---|---|
| Font "Instrument Sans" | Manrope | Switch to Manrope; keep tabular figures for all prices |
| Lime-yellow primary buttons and price text | Gold `#EAB308` | Replace with gold tokens; use gold-deep for gold text on light |
| Multiple solid accent buttons per view (hero CTA, Create listing, sell banner, sell CTA) | One solid accent per view | Keep one; others ghost/quiet |
| Discount badge in red | Red means loss; green means gain | Discounts and savings use `--cx-gain`; red reserved for errors/destructive and price increases |
| `Marketplace` token set likely `--ws-*` (v5) in your notes | Design system uses `--cx-*` | Decide one namespace; add an alias layer so `--ws-*` maps to `--cx-*` during migration |
| Grey meta text ≈ 3.1:1 contrast | Every text colour clears AA | Use `--cx-text-muted` (verify ≥ 4.5:1 on card surface) |
| 15-slide dot carousel, autoplay | One entrance moment; reduced-motion stop | Counter ("3 / 15"), pause button, no autoplay by default |

### 1.3 Commerce density — the one place we must extend the design system

The DS is calm and spacious (24px card padding, aurora light, large headings). eBay is dense and scannable (results lists with 8–10 data points per card). A marketplace needs **both**: calm brand surfaces and dense commerce surfaces. Proposal `[WS]`:

- Add a **`density` prop / data attribute**: `data-density="comfortable"` (default DS) and `data-density="compact"` (commerce). Compact changes only: card padding 24 → 12, row heights 56 → 44, type one step down for meta (14 → 13), gaps 24 → 12/16. Radius stays 20px (16px in lists).
- **Aurora, spotlight and beam are brand-level effects**: allowed on hero, seller-hub header, CTA blocks and one featured card. **Not** allowed on grid cards (performance + noise). Hover aurora on cards is off by default in compact density.
- **Prices are never decorative.** No gradients, no rolling numbers on prices in lists. Rolling numbers allowed only on wallet balance, escrow amount, and bid price changes.

### 1.4 Component authoring rules (apply to all new components)

1. Compose from DS components first (Section 2). Do not re-implement Button, Chip, Modal, Drawer, Table, Tabs, Toast, etc.
2. Every component ships: default, hover, focus-visible, active, disabled, loading (Skeleton), empty, error, and, when relevant, selected, and offline.
3. Every interactive element ≥ 44×44 px hit area on touch; visible focus (gold-pale ring); keyboard operable; names via `aria-label` where icon-only.
4. Toggles expose `aria-pressed`/`aria-checked`; live changes use `aria-live="polite"`.
5. Money uses `formatCurrency()` + `price_minor` + tabular figures; never hand-formatted.
6. Props are serialisable and typed (TypeScript), with a Storybook story per variant, light and dark, mobile and desktop viewports.
7. Motion uses DS tokens only; respect `prefers-reduced-motion`.
8. Every component emits analytics via a shared `useTrack()` (event names in `worldstreet-ux-flows.md`, Part H).

---

## 2. Reuse map — the 38 existing DS components and their marketplace jobs `[DS]`

| DS component | Marketplace use (do not rebuild) |
|---|---|
| **Button** | All CTAs. Buy now = solid gold; Add to cart = ghost; Make offer/Watch = quiet. Magnetic variant only on Buy now (optional) |
| **Badge** (eyebrow pill) | Section eyebrows ("Near you", "Deals ending soon"), policy tags |
| **Chip / DeltaChip / Count** | Condition, format, status chips; price-drop chip (DeltaChip, `--cx-gain`); unread counts on bell/inbox/cart |
| **Avatar** | Seller/buyer avatars, thread headers, review authors |
| **Card** | Listing card base, seller card, escrow card, order card (compact density) |
| **Stat / Sparkline** | Seller hub KPIs, performance metrics, price history sparkline on listing |
| **Table** | Seller listings, orders, ledger, admin queues (sortable headers, right-aligned figures) |
| **List** | Orders feed, activity, address list, payment methods, notifications |
| **Text field (Field/Input/Textarea)** | All forms: address, title, description, search-in-filters, messages |
| **Amount input** | Offer amount, price input, bid input, withdrawal amount, quick-amount chips ("90%", "85%" of list price) |
| **OTP input** | Phone verification, delivery PIN entry/display, step-up auth |
| **Copy field** | Bank-transfer account number, order number, referral link, listing link |
| **Checkbox & radio** | Facet filters, T&Cs, address selection |
| **Switch** | "Accept offers", "Free delivery", notification prefs, "Include description" |
| **Slider** | Price range, radius, auto-accept threshold |
| **Choice card** | Delivery method, payment method, return policy, listing format, dispute outcome |
| **File upload** | Listing photos (extended), KYC docs, dispute evidence |
| **Inline input** | Newsletter / "Notify me" one-field forms |
| **Date picker** | Scheduling listing, pickup slot, report date range |
| **Tabs** (segmented/line, sliding thumb) | Saved tabs, order tabs, review filter, seller shop tabs, price-history ranges |
| **Breadcrumbs** | Category trail on listing/search |
| **Pagination** | Search results fallback, admin tables |
| **Top nav** | Marketing/landing header pattern (not the app header — see 3.1) |
| **Sidebar** | Seller Hub and Admin shells |
| **Bottom nav** | Mobile app tab bar (limit to 5 tabs) |
| **Alert / banners** | Maintenance, KYC prompts, price changed, listing unavailable |
| **Toast** | Saved, added to cart, offer sent (bottom-right; full width on mobile) |
| **Progress** (bar, ring, spinner) | Upload progress, profile completeness ring, payment checking spinner |
| **Steps** | Create-listing stepper, checkout stepper, dispute wizard, KYC |
| **Skeleton** | Every list/grid/detail loader |
| **Empty state** | Zero results, empty cart, no saved items, no orders |
| **Modal** (native dialog) | Confirmations, Make offer (desktop), report listing |
| **Drawer** (side on desktop, bottom sheet on mobile) | Filters (mobile), mini-cart, address form, share, sort, notifications panel |
| **Menu** (Popover API) | Overflow actions on cards and rows, account menu |
| **Popover** | "Why this price?", condition definitions, fee breakdown, delivery cost explanation |
| **Tooltip** | Icon-button labels, "Find more like this" hint |
| **Accordion** | FAQ, filter groups (web), policy details, item description sections on mobile |
| **Marquee** | Brand/seller logos strip (marketing pages only) |

**Patterns reused:** Aurora (hero, CTA, seller hub header), Wallet (balance header in checkout and payments), Border beam (one featured/promoted listing per view), Stats band (home trust numbers), Social proof (testimonials on seller landing), Spotlight (optional on category tiles).
**Motion reused:** Reveal (rails, once), Sliding tabs (built into Tabs), Rolling numbers (wallet, escrow, bids), Word rise (home hero only), Tilt (none in lists; optional on a featured card), Theme reveal (global).

---

# PART I — GLOBAL SHELL

## 3. Navigation and shell components

### 3.1 Header family

| Component | eBay behaviour mirrored | Composition | Web | Mobile |
|---|---|---|---|---|
| `AppHeader` | Two-row header: utility bar + primary bar with logo, category button, big search `[eBay-observed]` | Container, Button, Menu | Row 1 utility (ship-to, Sell, My account, bell, cart); Row 2 logo + Shop-by-category + search + cart. Sticky; shrinks on scroll | Single row: menu icon, logo, search icon, cart; search expands to full-width overlay |
| `UtilityBar` | "Hi! Sign in or register · Deals · Help & Contact · ship-to · Sell · My account · bell · cart" `[eBay-observed]` | Links, Menu | Visible ≥ 1200 | Hidden; items move into the drawer menu |
| `ShipToSelector` | Postcode chip + "Are you shipping to…?" prompt `[eBay-observed]` | Select/Popover, Drawer | Header chip opens popover (city, radius 5/10/25/Nationwide, "Use my location") | Bottom sheet; inline bar replaces blocking modal |
| `LocationBar` (inline) | – `[WS]` replaces eBay's blocking modal | Alert-style bar | Slim bar under header, dismissible | Same, above content |
| `CategoryMenuButton` + `MegaMenu` | "Shop by category" panel with deep tree `[eBay-observed]` | Popover/Drawer, Accordion | Hover/click opens 3-column mega menu (L1 list, L2 grid, featured promo) | Full-screen drawer with drill-down (stack navigation, back button, breadcrumb) |
| `CategoryRail` (existing `CategoryPills`) | Horizontal category row (Saved, Electronics, Motors, Fashion, More) `[eBay-observed]` | Chip, Marquee-like scroller | Pills with scroll arrows, fade edges | Swipe scroller, snap, "All" first |
| `GlobalSearchBox` | Large search with scope dropdown and camera icon, Search button `[eBay-observed]` | Input, Select, Button | 720px wide; scope select left; submit button right | Full-width overlay on tap; scope inside overlay |
| `SearchSuggestPanel` | Autosuggest with recents, categories, sellers | Popover/List | Dropdown under input, keyboard navigable, max 10 rows | Full-screen list with recent searches and trending chips |
| `ImageSearchButton` | Camera icon → "Find similar from a photo" `[eBay-observed]` | IconButton, File upload | Opens file picker/drag-drop modal | Opens camera/gallery sheet |
| `NotificationBell` + `NotificationPanel` | Bell with unread count `[eBay-observed]` | Count, Drawer, List | Popover panel, grouped by day, mark all read | Full-screen page `/notifications` |
| `CartButton` + `MiniCart` | Cart icon with count, mini-cart on add | Count, Drawer | Right drawer (360px) with items, subtotal, Checkout | Bottom sheet after add; cart tab badge |
| `AccountMenu` | "My eBay" dropdown: Summary, Orders, Messages, Selling… `[eBay-observed]` | Menu, Avatar | Dropdown with wallet balance chip, level badge | Account tab page (no dropdown) |
| `WalletBalanceChip` | – `[WS]` unified wallet | Chip, Rolling numbers | Header chip ("₦184,500"), tap → wallet module | Account tab top card |
| `SellButton` | "Sell" link in utility bar; "Create listing" | Button | Visible in header; ghost style (primary is Buy/Search focus) | Center slot of bottom nav |
| `HelpBubble` | Floating "?" help `[eBay-observed]` | IconButton, Popover | Bottom-right bubble: search help, contact | Moves into Account/More; no floating overlap with nav |
| `SkipLinks` | – | Link | Skip to main, search, footer | same |

### 3.2 Bottom navigation (mobile) `[DS]` + `[WS]`
- **Max 5 tabs:** Home · Search · Sell (centre, raised) · Inbox · Account. Saved and Cart live in the header and in Account.
  The sandbox shows 6 slots (Home, Search, Saved, Sell, Inbox, More); reduce to 5.
- Badges via `Count` on Inbox (messages + offers) and Account (action-required orders).
- Hide on scroll down, show on scroll up; always visible on listing detail? **No:** replaced by the sticky buy bar there.
- Respect iOS/Android safe areas; add bottom padding equal to nav height on all pages (fixes overlap seen in sandbox).

### 3.3 Footer
| Component | eBay behaviour | Notes |
|---|---|---|
| `SiteFooter` | Buy / Sell / Stay connected / About / Help links, country selector, legal | Accordion on mobile (one open), 4 columns on web; includes Buyer protection, Open a dispute, Report a listing, Safety tips (already in sandbox), cross-product links (Finance, Academy, Xstream, Vivid AI) |
| `LegalBar` | Copyright, privacy, terms, cookies | Single line, wraps on mobile |
| `CookieConsent` | Banner with decline-by-default `[eBay-observed pattern]` | Bottom banner (web) / bottom sheet (mobile); "Decline non-essential" equal weight to Accept |
| `AppInstallBanner` | Smart app banner | Mobile web only, dismissible, 14-day snooze |
| `SystemBanner` | Outage / maintenance | DS Alert banner variant |

---

# PART II — DISCOVERY

## 4. Home modules

| Component | eBay equivalent | Details | Web | Mobile |
|---|---|---|---|---|
| `HeroCarousel` | Promotional hero with coupon text and pause control `[eBay-observed]` | Max 4 slides; **pause button, counter "2 / 4"**, no autoplay under reduced motion; one solid CTA per slide | 16:5 aspect, arrows | 4:3 aspect, swipe, dots replaced by counter |
| `PromoCouponCard` | "Save 20% on your wish list · Ends 10/11 · Max $500 off · 2x use" `[eBay-observed]` | Title, terms line, "Get the coupon" | Inside hero or rail | Stacked |
| `TrustStrip` | eBay: "Shopping made easy: reliability, secure deliveries, hassle-free returns" `[eBay-observed]` | WorldStore: Escrow / Trackable delivery / Wallet payout. Use Stats-band style; copy sourced from one string table (see escrow spec L11.4) | 3 columns | Swipeable or stacked list (3 rows) |
| `CategoryTiles` | "Whatever you're into" tiles `[eBay-observed]` | Image tile + title + count; Spotlight optional | 6 across | 2×3 grid or horizontal scroll |
| `ProductRail` (generic) | "Today's Deals", "Trending on eBay" tabs, "Quality pre-owned picks" `[eBay-observed]` | Horizontal list of `ListingCard variant="rail"`; header with eyebrow + See all; arrows; Reveal once | 5–6 visible, arrow controls | 2.3 cards visible, swipe, peek |
| `DealsRail` | Today's Deals with was/now price and "free shipping" label `[eBay-observed]` | Rail with `PriceBlock showSavings` and countdown for timed deals | same | same |
| `TrendingTabs` | Trending on eBay: Tech, Motors, Luxury, Collectibles… `[eBay-observed]` | DS Tabs (segmented) above a rail | Tabs inline | Scrollable tabs |
| `RecentlyViewedRail` | Recently viewed | Personalised, hides when empty | yes | yes |
| `BecauseYouSavedRail` | Personalised recs | Hidden for guests | yes | yes |
| `NearYouRail` | – `[WS]` | Uses radius filter; shows distance | yes | yes |
| `EditorialTile` | "Build an elite collection" | Image + headline + CTA; compact density | 3 across | stacked |
| `SponsoredSellerBanner` | Seller banner with items-sold count at top of search `[eBay-observed]` | Label "Sponsored"; seller avatar, "49K items sold", Shop store | yes | compact variant |
| `SignInNudge` | "Get more with an eBay account" `[eBay-observed]` | Benefits + Sign in; hidden for signed-in | Card | Card |
| `SellCTABlock` | "Open your shop in minutes" | DS CTA block with ribbon aurora; one solid CTA | yes | yes |
| `FeaturedBeamCard` | – `[WS]` | One promoted listing with DS Border beam | max 1 per view | max 1 per view |

## 5. Listing card family (the most important component)

### 5.1 `ListingCard` — anatomy `[eBay-observed order]`

1. **Media** (aspect 1:1 or 4:5; fixed to prevent CLS; blurred placeholder) with overlays: top-left badges, top-right `SaveButton`, bottom-right photo count `1/8`.
2. **Eyebrow row:** `ConditionChip` (NEW / LIKE NEW / REFURBISHED / USED) + `FormatChip` (Buy now · Accepts offers · Auction) + `SponsoredLabel` when relevant.
3. **Title** (2 lines, ellipsis, real `<a>` stretched over the card).
4. **Rating** — `RatingStars` + count; item rating vs seller rating clearly labelled (audit F13).
5. **`PriceBlock`** — current price, was-price, `% off` chip (gain colour), unit price.
6. **`DeliveryLine`** — "Free delivery", or "+₦3,000 delivery", or "Pickup only"; and **"Total to Lekki ₦103,000"** (R-003).
7. **`LocationLine`** — area + distance (computed from the selected anchor) + posted time.
8. **`SocialProof`** — "64 sold", "22 watchers", "Last one", "Almost gone", "In 4 carts" — only real data `[eBay-observed]`.
9. **`SellerMini`** — avatar, name, verified tick, `% positive (count)`, programme badge (Top rated).
10. **Actions:** heart (Save), overflow `Menu` (Hide, Report, Find similar), optional quick-add (web hover only).

### 5.2 Variants

| Variant | Used in | Web | Mobile |
|---|---|---|---|
| `grid` | Search, category, saved | 4–5 columns (≥1200), 3 (768–1199) | 2 columns, compact density |
| `list` | Search list view `[eBay-observed toggle]` | Image left (200px), details right, actions far right | Image left (112px), 3 lines of meta, price right |
| `rail` | Home rails | 220px wide | 160px wide, shows fewer meta lines |
| `compact` | Cart suggestions, similar items, messages | 72px thumb row | same |
| `sponsored` | Search | Same as grid + "Sponsored" tag | same |
| `deal` | Deals | Adds struck price, % off, timer | same |
| `auction` | Phase 8 | Adds current bid, bids count, time left | same |
| `vehicle` | Vehicles | Year, mileage, transmission, fuel, location; no cart | same |
| `property` | Property | Beds/baths/area, price per period; "Book viewing" | same |
| `service` | Services | "From ₦X", rating, area, "Request" | same |
| `skeleton` | All | Same dimensions | same |
| `unavailable` | Saved/orders | Greyed, "Sold/Removed", similar link | same |

### 5.3 Card atoms

| Atom | Spec |
|---|---|
| `ConditionChip` | DS Chip; New (neutral), Like new (neutral), Refurbished (gold-tinted "Certified" if programme), Used, For parts (warning). 12px min, AA contrast |
| `FormatChip` | "Buy now", "or Best offer", "Auction · 2d 4h" |
| `DiscountChip` | `--cx-gain` tint, text "−23%"; **never red** |
| `UrgencyBadge` | "Limited time" with timer; only when real end time exists |
| `SponsoredLabel` | Quiet text label, always same position |
| `VerifiedTick` | `badge-check` icon, tooltip "Verified seller" |
| `TopRatedBadge` | Pill with `award` icon, links to standards explanation |
| `RatingStars` | Read-only (a11y text "rated 4.9 out of 5"), input variant for reviews |
| `PriceBlock` | Variants: `card`, `detail`, `cart`, `sticky`. Props: `price_minor`, `was_minor?`, `delivery_minor?`, `showTotalTo?`, `unitPrice?`. Tabular figures; gold-deep on light surfaces; never rolling in lists |
| `DeliveryLine` | Icon (truck/map-pin/package), text, optional popover "How we calculate" |
| `SocialProof` | Single line; max 2 signals; icon + text; pluralisation helper |
| `SaveButton` | 44×44 target, `aria-pressed`, label swaps "Save listing" ↔ "Remove from saved", toast on save, guest → auth sheet then resume |
| `PhotoCount` | `image` icon + "1/8" |
| `QuickAddButton` | Web hover/focus only; Add to cart without leaving results |
| `FindSimilarButton` | Camera/eye icon with tooltip "Find more like this" `[eBay-observed]` |
| `HideListingMenuItem` | "Not interested", "Hide seller" (feeds personalisation) |

## 6. Search results and filtering

| Component | eBay behaviour mirrored | Details | Web | Mobile |
|---|---|---|---|---|
| `ResultsHeader` | "15,000+ results for 'sony headphones'" + Save this search `[eBay-observed]` | Count, query chips, `SaveSearchButton`, view toggle, sort | Single row | Count + "Filters · Sort" sticky bar |
| `SaveSearchButton` | Heart "Save this search" `[eBay-observed]` | Toggles; sets alert prefs sheet on first save | Inline | Inline |
| `SortMenu` | "Sort: Best Match" dropdown `[eBay-observed]` | Best match, Price+delivery ↑↓, Newest, Nearest, Ending soonest, Biggest discount; **sorts on canonical NGN** | Menu | Bottom sheet radio list |
| `ViewToggle` | List/grid icons `[eBay-observed]` | `grid` / `list` icons; remembers choice | yes | yes (default grid) |
| `FilterRail` | Left rail: Category tree, Shipping to, Delivery options, facets with counts `[eBay-observed]` | 280px sticky rail; collapsible groups (Accordion); "Show more +" | yes | – |
| `FilterSheet` | – | Full-height Drawer with groups, sticky footer "Show 124 results" and "Clear" | – | yes |
| `FilterGroup` | Collapsible facet group with `^` toggle | Title, selected count, body | yes | yes |
| `FacetCheckbox` | "Ear-Cup (Over the Ear) (5,845)" `[eBay-observed]` | Checkbox + label + count; disabled at 0 | yes | yes (48px rows) |
| `CategoryTree` | "Category > Consumer Electronics > Portable Audio…" with "More +" `[eBay-observed]` | Single-select drill-down, bold current | rail | sheet drill-down |
| `PriceRangeFilter` | Min/Max inputs + Go | Amount inputs + Slider + optional histogram; syncs URL; presets chips (Under ₦10k, ₦10–50k…) | yes | yes |
| `ConditionFilter` | Condition dropdown | Multi-select chips/checkboxes | yes | yes |
| `FormatFilter` | Buying Format dropdown | Buy now / Offers / Auction | yes | yes |
| `LocationRadiusFilter` | "Shipping to NGA", Location | Radius radio (5/10/25 km/Nationwide) + area search | yes | yes |
| `DeliveryFilter` | "Free International Shipping" `[eBay-observed]` | Free delivery, Pickup, Fast delivery | yes | yes |
| `SellerFilter` | Seller type | Verified, Top rated, Shops only | yes | yes |
| `ColorSwatchFilter` | Colour chips | Circle swatches, `aria-label` colour names | yes | yes |
| `SizeFilter` | Size grid | Category-specific (shoe UK, clothing, etc.) | yes | yes |
| `BrandFilter` | Brand list with search | Typeahead within facet | yes | yes |
| `ActiveFilterChips` | Applied filters row | Removable chips + "Clear all" | above results | horizontal scroll row |
| `PopularFilterChips` | "Popular Filters: Bluetooth, USB-C, Sony…" `[eBay-observed]` | Quick-apply chips | above results | same |
| `RelatedSearches` | "Related: sony headphones wh-1000xm4" and footer list `[eBay-observed]` | Chips/links | top + bottom | bottom |
| `IncludeDescriptionToggle` | "Include description" `[eBay-observed]` | Switch/checkbox near search | yes | in filter sheet |
| `SpellCorrection` | "Did you mean…" | Inline text link | yes | yes |
| `ZeroResults` | – | EmptyState + corrections + widen radius + saved search CTA | yes | yes |
| `ResultsGrid` / `ResultsList` | Results container | Responsive columns; infinite scroll with "Load more" fallback; restore scroll on back | yes | yes |
| `ResultsPagination` | Page numbers | DS Pagination for SEO routes | yes | hidden (infinite) |
| `InfiniteLoader` | – | Sentinel + skeleton row; announces "24 more results loaded" | yes | yes |
| `ResultsSellerBanner` | Sponsored seller strip | See 4 | yes | yes |
| `CompareTray` (phase 9) | Compare items | Sticky tray of up to 4 items | yes | – |

---

# PART III — LISTING DETAIL

## 7. Listing detail components

| Component | eBay behaviour mirrored | Details | Web | Mobile |
|---|---|---|---|---|
| `ListingPageLayout` | Gallery left, buy box right `[eBay-observed]` | CSS grid, sticky buy box | 2 columns ≥ 1200, stacked 768–1199 | single column + sticky bar |
| `ListingBreadcrumb` | Category trail `[eBay-observed]` | DS Breadcrumbs | top of page | collapsed to "‹ Back to results" |
| `Gallery` | Main image, thumbnails, count | Swipe/arrows/keyboard, zoom on hover, video first, lazy thumbs | vertical thumb rail | full-width swipe with pagination "1 / 8" |
| `GalleryLightbox` | Full-screen viewer | Pinch/zoom, ESC, focus trap | modal | full-screen, swipe-down to close |
| `VideoPlayer` | Listing video | Poster, mute default, captions if provided | inline | inline |
| `ListingTitleBlock` | Title, condition, item number | H1 here (page's only H1) | yes | yes |
| `SellerStrip` | Seller name, feedback count, % positive, "Seller's other items", Message `[eBay-observed]` | Avatar, name, `TopRatedBadge`, rating, actions | in buy box | below title |
| `BuyBox` | Price, condition, variation, quantity, CTAs `[eBay-observed]` | Contains PriceBlock, VariationSelector, QuantityStepper, ActionStack, trust lines | sticky right column | stacked section |
| `VariationSelector` | Colour/size selects `[eBay-observed]` | Chips/swatches, out-of-stock disabled with reason, "Select a size" validation | yes | bottom sheet for long lists |
| `QuantityStepper` | Quantity + "6 available · 1,350 sold" `[eBay-observed]` | `−` `n` `+`, max = stock, availability text | yes | yes |
| `ActionStack` | Buy It Now, Add to cart, Add to Watchlist (+ Best Offer, Place bid) `[eBay-observed]` | One solid (Buy now), others ghost/quiet; consistent order | stacked full-width | in sticky bar + buy box |
| `StickyBuyBar` | – `[WS]` | Price + Buy now + heart + overflow; appears after buy box scrolls out of view | – | yes |
| `DemandLine` | "People want this. 1205 people are watching this." `[eBay-observed]` | Real counts only | yes | yes |
| `UrgencyBadge` | "IN 137 CARTS", "Sale ends in 5d 20h" `[eBay-observed]` | Timer from server | yes | yes |
| `ReassuranceLine` | "Breathe easy. Returns accepted." `[eBay-observed]` | Icon + one line, links to policy | yes | yes |
| `DeliveryPanel` | Shipping, location, import fees, **delivery date range**, handling time `[eBay-observed]` | Method list (rider, pickup station, meet-up), cost, ETA, "Total to {city}", change-location link | in buy box column | accordion section |
| `ReturnsPanel` | "30 days returns. Buyer pays return shipping." `[eBay-observed]` | Window, who pays, conditions | yes | accordion |
| `PaymentsPanel` | Payment icons `[eBay-observed]` | Card, bank transfer, USSD, wallet | yes | accordion |
| `ProtectionPanel` | "Shop with confidence: Top Rated Plus, Money Back Guarantee" `[eBay-observed]` | Escrow explainer + Verified seller + link to how escrow works | below buy box | inline |
| `ConditionInfo` | Condition + definition | Popover with grading table | yes | sheet |
| `ItemSpecifics` | Structured attributes table `[eBay-observed]` | Two-column key/value, collapsible after 8 rows | yes | accordion |
| `SellerNotes` | Seller notes quote | Blockquote style | yes | yes |
| `DescriptionBlock` | "Item description from the seller" | Sanitised HTML, "Read more" after 12 lines | yes | yes |
| `RevisionHistoryLink` + `RevisionModal` | "Last updated … View all revisions" `[eBay-observed]` | Timeline of changes (price, description) | modal | sheet |
| `ListingMeta` | eBay item number, listed date | Copy field | yes | yes |
| `SellerCard` | About this seller: joined, response time, bio, store, message, save `[eBay-observed]` | Avatar, stats, `Save seller` | below fold | yes |
| `SellerRatingsBreakdown` | Detailed seller ratings (4 dims) `[eBay-observed]` | 4 rows of stars + score | yes | yes |
| `ReviewsSection` | Feedback list, tabs This item / All items, topic chips, verified purchase `[eBay-observed]` | `RatingSummary`, `ReviewFilters`, `ReviewCard`, `ReviewPhotos`, load more | yes | yes |
| `ReviewFilters` | Tabs + topic chips (Quality, Value, Fit…) | DS Tabs + Chips | yes | scrollable |
| `ReviewCard` | Masked buyer ID, feedback score, "Verified purchase", time bucket `[eBay-observed]` | Avatar, text, photos, seller reply | yes | yes |
| `ReviewPhotoStrip` | "Photos and videos from customers" `[eBay-observed]` | Thumbnails → lightbox | yes | yes |
| `QAThread` (phase 9) | Questions & answers | Public Q&A on listing | yes | yes |
| `SimilarItemsRail` | "People who viewed this also viewed", "Similar items" `[eBay-observed]` | `ProductRail` | yes | yes |
| `SellerOtherItemsRail` | Seller's other items | `ProductRail` | yes | yes |
| `CategoryBestSellers` | "Best Sellers / Top Rated" `[eBay-observed]` | Tabs + rail | yes | yes |
| `ShareSheet` | Share | Copy link, WhatsApp, Telegram, X, SMS | Menu/Popover | native share sheet then fallback Drawer |
| `ReportListingModal` | Report item | Reason radio, details, submit | Modal | sheet |
| `SafetyTipsCard` | – `[WS]` | 4 tips (meet public, inspect, pay on platform) | yes | yes |
| `LocalPickupMap` | Located in: "Ozan, AR" `[eBay-observed]` | Approximate area on map; **never exact address** | yes | yes |
| `UnavailableState` | Ended/sold | Replaces CTAs, shows similar items | yes | yes |
| `PriceHistorySparkline` (phase 9) | – | DS Sparkline of last 30 days | yes | yes |

---

# PART IV — OFFERS, BIDS, CART, CHECKOUT

## 8. Offers and bidding

| Component | Details | Web | Mobile |
|---|---|---|---|
| `OfferModal` | Amount (AmountInput + quick chips 90%/85%/80% of list), quantity, note, "valid 48 h", offers-left counter, binding-commitment copy | Modal 480px | Bottom sheet |
| `OfferSummaryCard` | Pending/accepted/countered/declined/expired with timer | List row | List row |
| `OffersList` (buyer `/offers`, seller `/vendor/offers`) | Tabs: Active, Accepted, Closed | Table/List | List |
| `CounterOfferCard` | Accept / Counter / Decline | In thread + page | In thread |
| `OfferActionBar` (seller) | Accept, Counter (range validation), Decline + reason | Inline | Sheet |
| `AutoOfferSettings` | Auto-accept ≥ ₦X, auto-decline < ₦Y with Sliders | Seller wizard | same |
| `OfferThreadItem` | Offer cards inside messages | Thread | Thread |
| `BidPanel` | Current bid, bids count, time left, max-bid input, "Place bid" | Buy box | Buy box + sticky |
| `MaxBidExplainer` | Popover on proxy bidding | Popover | Sheet |
| `CountdownTimer` | Server-synced; day/hour/min/sec; urgency colour under 1 h (warning token, not red) | yes | yes |
| `BidHistory` | Anonymised bidder list | Modal | Sheet |
| `OutbidToast` | Real-time notice | Toast | Toast + push |

## 9. Cart

| Component | eBay behaviour | Details | Web | Mobile |
|---|---|---|---|---|
| `CartPage` | Cart `[eBay-inferred]` | Seller groups + summary | 2 columns | single column + sticky checkout bar |
| `CartSellerGroup` | Items grouped by seller, delivery per seller | Seller header, items, delivery selector, subtotal | yes | yes |
| `CartLineItem` | Image, title, variation, price, qty, remove, save for later | `QuantityStepper`, Menu | row | stacked |
| `SaveForLaterList` | Saved items under cart | List | yes | yes |
| `CartPriceChangeBanner` | "2 items changed since you added them" | Alert | yes | yes |
| `CouponField` | One coupon per order | Inline input + Chip for applied | yes | yes |
| `OrderSummary` | Items, delivery, discounts, fees, **total** | Sticky right (web), collapsible top (mobile) | yes | yes |
| `EmptyCart` | EmptyState + recommendations | yes | yes |
| `CartRecommendations` | "You may also like" | rail | rail |

## 10. Checkout

| Component | Details | Web | Mobile |
|---|---|---|---|
| `CheckoutLayout` | Single page, three stacked sections + summary | 2 columns | single column |
| `CheckoutSection` | Collapsible card with "Edit" and completion tick | yes | yes |
| `CheckoutSteps` | DS Steps (Ship to → Delivery → Pay → Done) | top | compact |
| `AddressSelector` | Radio list of saved addresses | yes | yes |
| `AddressForm` | Name, phone (+234), state, city/area, street, **landmark**, notes | Drawer | full-screen sheet |
| `AddressAutocomplete` | Google/Places-like with Nigerian states/LGAs | yes | yes |
| `PhoneInput` | +234 prefix, validation | yes | yes |
| `DeliverySelector` | Choice cards per seller: rider, pickup station, meet-up with cost + date range | yes | yes |
| `PickupStationPicker` | Map/list of stations with hours | modal | full-screen |
| `PaymentMethodPicker` | Choice cards: Card, Bank transfer, USSD, Wallet, (Pay on delivery later) | yes | yes |
| `CardForm` | PAN, expiry, CVV via provider-hosted fields (never touch raw card data) | yes | yes |
| `BankTransferPanel` | Dynamic account number (`CopyField`), amount, countdown, "I've paid" auto-detect | yes | yes |
| `UssdPanel` | Code + steps | yes | yes |
| `WalletBalanceToggle` | Use wallet balance (Switch) + remaining to pay | yes | yes |
| `EscrowNotice` | Lock icon + "₦X held until you confirm delivery" | above Pay | above Pay |
| `PayButton` | Names the amount ("Pay ₦103,000"); loading, success | yes | sticky bottom |
| `InventoryLockTimer` | "Held for you for 09:41" | yes | yes |
| `PaymentStatusPoller` | "Checking your payment…" (Progress spinner) | yes | yes |
| `PaymentErrorPanel` | Reason + alternative methods; preserves inputs | yes | yes |
| `OrderConfirmation` | Order number (`CopyField`), what's next (Steps), track, message seller | yes | yes |
| `KycGateSheet` | Inline L2 verification for high-value | Modal | sheet |

---

# PART V — POST-PURCHASE, TRUST, MESSAGING

## 11. Orders and post-purchase

| Component | Details | Web | Mobile |
|---|---|---|---|
| `OrdersPage` | Tabs Active/Completed/Cancelled/Returns + search by item/order # | Table-ish list | cards |
| `OrderRow` | Thumb, title, status chip, ETA, primary action | yes | yes |
| `OrderDetail` | Header, timeline, delivery, escrow, items, totals, actions | 2 columns | stacked |
| `OrderStatusTimeline` | Paid → Preparing → Dispatched → In transit → Out for delivery → Delivered → Confirmed → Released | Horizontal | Vertical |
| `MoneyTimeline` | Second lane: Held → Released → Available | Under order lane | same |
| `EscrowStatusCard` | State-driven headline/body/actions (buyer + seller variants) — copy table in escrow spec L11.2/L11.3 | yes | yes |
| `InspectionCountdown` | Server-synced, announces at thresholds | yes | yes |
| `ConfirmReleaseSheet` | Consequences sentence, "Confirm everything's fine" | Modal | Sheet |
| `DeliveryCard` | Rider name, masked phone relay, **PIN/QR** (OTP display, QR), ETA | yes | yes |
| `TrackingMap` (phase 9) | Live rider location | yes | yes |
| `ReceiptView` | Itemised receipt + PDF download | yes | yes |
| `ReviewForm` | Overall + 4 dimension stars, text, photos, preview | Modal/page | page |
| `ReportProblemWizard` | 4 steps via DS Steps: Issue → Evidence → Outcome → Review | Modal | full-screen |
| `EvidenceUploader` | DS File upload + camera capture, progress, remove | yes | yes |
| `DisputeTimeline` | Case events, deadlines, who's turn | yes | yes |
| `RefundTracker` | Amount, destination, expected date, reference | yes | yes |
| `ReturnInstructionsCard` | Label, address/drop-off, deadline, QR | yes | yes |
| `BuyAgainButton` | Re-adds items | yes | yes |
| `OrderIssueBanner` | "Seller late — wait or cancel & refund" | Alert | Alert |

## 12. Messaging

| Component | Details | Web | Mobile |
|---|---|---|---|
| `InboxLayout` | Thread list + conversation | 2 panes | list → thread (stack) |
| `ThreadList` / `ThreadRow` | Avatar, name, last message, time, unread Count, listing thumb | yes | yes |
| `ThreadHeader` | Counterparty, listing/order link, overflow (Block, Report) | yes | yes |
| `PinnedListingCard` | Listing/order summary at top of thread | yes | yes |
| `MessageBubble` | Sent/received, status (sent/delivered/read), timestamp | yes | yes |
| `MessageInput` | Text, attach (max 3 photos), quick replies, send | yes | yes (keyboard-safe) |
| `QuickReplies` | Suggested chips ("Is this still available?") | yes | yes |
| `OfferMessageCard` | Embedded offer with actions | yes | yes |
| `OrderEventMessage` | System messages (dispatched, delivered) | yes | yes |
| `SafetyBanner` | "Keep payment and chat on WorldStore" | yes | yes |
| `ContentWarning` | Inline warning on phone/bank patterns | yes | yes |
| `AttachmentPreview` | Image viewer | yes | yes |
| `BlockReportMenu` | Block, report | Menu | Sheet |
| `AwayModeBanner` | Seller away | yes | yes |
| `TypingIndicator` (optional) | yes | yes |

## 13. Trust, account and profile

| Component | Details | Web | Mobile |
|---|---|---|---|
| `SignInSheet` / `AuthModal` | Phone/email + OTP (DS OtpInput), social later; resumes intent (R-004) | Modal | Bottom sheet |
| `AccountHome` | Summary: orders, offers, saved, wallet, tasks | Page | Tab page |
| `ProfileForm`, `AddressBook`, `PaymentMethodsList` | CRUD using Field/List/Drawer | Pages | Pages |
| `KycStepper` | DS Steps + File upload + liveness handoff | yes | yes |
| `LevelBadge` | L1/L2/L3 | yes | yes |
| `VerifiedBadge`, `TopRatedBadge`, `NewSellerBadge` | Chips with icons | yes | yes |
| `SellerPublicProfile` | `SellerProfileHeader` (banner, avatar, stats, follow, message), tabs Items/Reviews/About | yes | yes |
| `SellerStats` | Items sold, % positive, response time, joined | DS Stat | compact |
| `SavedPage` | Tabs: Listings · Sellers · Searches; price-drop tags | yes | yes |
| `SavedSearchRow` | Query, filters summary, alert toggle (Switch) | yes | yes |
| `NotificationCentre` | Grouped list, filters, preferences link | yes | yes |
| `NotificationPreferences` | Switch matrix per channel/category | yes | yes |
| `HelpCentreHome` | Search, top topics, contact | yes | yes |
| `EscrowExplainerPage` | 4-step visual + protection windows table | yes | yes |
| `PolicyPage` template | TOC + Accordion sections | yes | yes |
| `ErrorPages` | 404, 410, 500, offline | yes | yes |

---

# PART VI — SELLER AND ADMIN

## 14. Seller tools

| Component | Details | Web | Mobile |
|---|---|---|---|
| `SellerShell` | DS Sidebar + page header | Sidebar 260px | Bottom sheet menu / top tabs |
| `SellerOnboarding` | Intro, profile, OTP, KYC, payout account, agreement quiz | Steps | Steps |
| `PayoutAccountForm` | Bank + account number + name enquiry result | yes | yes |
| `CreateListingWizard` | 7 steps (Photos → Category → Title/Description → Format/Price → Delivery → Returns → Review) with autosave | Stepper left + preview right | Stepper top, full-screen steps, preview as last step |
| `PhotoUploader` | Drag/drop, camera, reorder (drag handle + keyboard), crop, compress, per-file progress, retry | yes | camera-first, long-press reorder |
| `CategoryPicker` | Search + tree + suggestions | Modal | Full-screen |
| `ItemSpecificsForm` | Dynamic fields by category; required markers; IMEI/serial | yes | yes |
| `TitleInput` | Counter (80), tips, duplicate warning | yes | yes |
| `RichTextEditor` | Bold, lists, links off by default; sanitised | yes | simple textarea + toolbar |
| `FormatPicker` | Choice cards: Buy now / Accept offers / Auction | yes | yes |
| `PriceGuidancePanel` | Comparable sold range, median, position marker | side panel | inline card |
| `FeePreview` | Fee breakdown ("You'll receive ₦Y") | yes | yes |
| `DeliveryProfileEditor` | Methods, zones, handling time, fees | yes | yes |
| `ReturnPolicyPicker` | Choice cards | yes | yes |
| `ListingLivePreview` | Card + detail, device toggle | side panel | tab |
| `PublishChecklist` | Blocking issues + warnings | yes | yes |
| `ListingsTable` | Table (web) / cards (mobile): status tabs, bulk bar, inline edit | yes | yes |
| `BulkActionBar` | Edit price/qty, end, relist, promote, export | sticky | sheet |
| `InlineEditCell` | Price/qty edit with undo toast | yes | – |
| `SellerOrdersTable` | To ship / Shipped / Returns / Disputes tabs | yes | yes |
| `DispatchSheet` | Method, tracking/rider, ETA | Drawer | Sheet |
| `PackingSlipView` | Print/PDF | yes | share |
| `SellerOffersInbox` | See Section 8 | yes | yes |
| `PayoutsPage` | `BalanceBreakdown` (In escrow / Pending / Available / On hold), `LedgerTable`, withdraw | yes | yes |
| `WithdrawFlow` | AmountInput + account select + step-up OTP | Drawer | Sheet |
| `PerformanceDashboard` | Stat grid with targets, trend sparkline, "what to do" | yes | yes |
| `StandardsMeter` | Level progress ring (DS Progress ring) | yes | yes |
| `PromotionWizard` (phase 9) | Promote listing, budget, preview | yes | yes |
| `AnalyticsDashboard` (phase 9) | Views, conversion, sources | yes | yes |
| `BulkImport` (phase 9) | CSV upload + row error report | yes | – |

## 15. Admin and ops (web only)

| Component | Details |
|---|---|
| `AdminShell` | Sidebar + global search |
| `ModerationQueue` | Table with risk score, reason, SLA timer, bulk approve/remove |
| `ListingReviewPanel` | Images, history, seller, prior flags, policy picker, actions |
| `CaseView` | Dispute timeline, messages, evidence gallery, order/payment/delivery data, decision form |
| `LedgerViewer` | Double-entry entries per order; reversal action with second approver |
| `UserLookup` | Profile, devices, risk flags, actions (hold, cap, ban) |
| `RiskRulesTable` | Rule list and thresholds |
| `AuditLogTable` | Filters by actor/entity |
| `SupportConsole` | Read-only impersonate view, templates |

---

# PART VII — GLOBAL RULES

## 16. Layout, responsive behaviour, motion, accessibility, performance

### 16.1 Breakpoints and grid `[DS]` extended

| Token | Width | Layout |
|---|---|---|
| XS | 360 | Phone. 2-col listing grid, 16px gutters |
| S | 480 | Large phone. same |
| M | 768 | Tablet. 3-col grid; filter rail becomes drawer; header single row |
| L | 1024 | Small laptop. 3–4 col grid; filter rail appears (240px) |
| XL | 1200 | Desktop. DS breakpoint: full header (2 rows), 4–5 col grid, filter rail 280px |
| 2XL | 1320+ | Container max 1320; 5-col grid |

The DS defines 768 and 1200 as the two main breakpoints. XS/S/L are internal subdivisions for grid and header only; do not introduce new design changes at them without need.

**Listing grid columns:** 2 (≤767) · 3 (768–1199) · 4 (1200–1319) · 5 (≥1320). With filter rail open at 1200, grid is 3–4 columns.
**Gutters:** 12px mobile, 16px tablet, 24px desktop (compact density), 30px on brand pages (DS).
**Image aspect:** cards 1:1 (4:5 for fashion); detail gallery 1:1 main; hero 16:5 / 4:3.

### 16.2 Web vs mobile pattern decisions

| Pattern | Web (≥ 768 / ≥ 1200) | Mobile (< 768) |
|---|---|---|
| Header | 2-row, mega menu, big search | 1 row, expandable full-screen search |
| Navigation | Header + footer + breadcrumbs | Bottom nav (5 tabs) + back chevrons |
| Filters | Left rail, immediate apply | Bottom sheet, apply button with live count |
| Sort | Menu | Bottom sheet |
| Results | Grid/list toggle | Grid default; list optional |
| Listing buy actions | Buy box in right column | Sticky bottom bar + buy box section |
| Gallery | Thumb rail + hover zoom | Swipe pager + pinch lightbox |
| Offer | Modal | Bottom sheet |
| Address form | Drawer | Full-screen sheet |
| Checkout | 2-col with sticky summary | 1-col, summary collapsible, sticky Pay |
| Messages | Two-pane | Stack navigation |
| Seller tools | Sidebar + tables | Top tabs + card lists; critical actions only (dispatch, reply, list) |
| Notifications | Popover | Page |
| Toasts | Bottom-right | Full width above bottom nav |
| Confirmations | Modal | Bottom sheet |
| Hover affordances | Quick-add, spotlight, tooltips | Never rely on hover; long-press for secondary actions |
| Pull-to-refresh | – | Orders, inbox, saved |
| Native share | Popover | `navigator.share` |

### 16.3 Density and typography in commerce `[WS]`
- Meta text min **12px** (13px preferred); never below 12px (sandbox used 10–11.5px).
- Price: 20px/600 in cards (compact), 32px/500 on detail (matches DS H3), tabular figures.
- Titles: 14–15px/600, max 2 lines in cards; 24–28px H1 on detail.
- Line length ≤ 70ch for descriptions.

### 16.4 Colour usage in commerce (using DS tokens only)

| Meaning | Token | Examples |
|---|---|---|
| Primary action | Gold `#EAB308` (solid, once per view) | Buy now, Pay |
| Gold text on light | Gold deep `#A16207` | Price on light cards, links |
| Savings / positive | `--cx-gain` | −23%, price drop, "Refunded" |
| Loss / error | `--cx-loss` | Payment failed, destructive actions, price increase |
| Warning | `--cx-warning` | Ending soon, low stock, KYC needed |
| Info / neutral | `--cx-text-muted`, `--cx-elevated` | Meta text, surfaces |
| Focus | Gold pale `#FDE68A` ring | All focusable |
| Brand moments | Aurora/ribbon/low | Hero, CTA block, seller hub header only |

### 16.5 Motion budget
- **Grid/list pages:** no looping motion; Reveal once on first rail entry; image fade-in only.
- **Detail:** gallery swipe uses `--cx-spring-snappy`; sliding Tabs; rolling numbers on bid price only.
- **Checkout:** no decorative motion; progress and confirmation only (`Progress`, `Steps`).
- **Wallet/escrow cards:** rolling numbers on value change; single beam on the "held" amount optional.
- **Reduced motion:** all of the above static; carousels paused; countdowns update without animation.

### 16.6 Accessibility checklist (all components)
- Text ≥ 4.5:1; large text and UI ≥ 3:1; focus ring ≥ 3:1.
- Touch targets ≥ 44px; spacing ≥ 8px between.
- Single `<h1>` per page; heading order logical.
- Cards: one link per card (stretched), separate buttons for Save/overflow with unique labels ("Save Wireless over-ear headphones").
- Carousels: `role="region" aria-roledescription="carousel"`, pause control, slide announcements off by default.
- Forms: visible labels, inline errors with `aria-describedby`, error summary focus on submit, input preserved.
- Live updates: price/stock/offer/bid/escrow state via `aria-live="polite"`; urgent errors `assertive`.
- Timers: expose remaining time as text; do not announce every second.
- Dialogs: native `<dialog>`, focus trap, ESC closes, focus returns to trigger.
- Images: meaningful alt for listing photos (title + index), empty alt for decorative.

### 16.7 Performance budgets
- LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 on throttled 4G, mid-range Android.
- Home ≤ 1 MB transferred above the fold; JS ≤ 200 KB gzip on first route; image formats AVIF/WebP with `srcset`; lazy-load below fold; preload hero.
- Listing grid renders ≤ 24 cards before "Load more"; virtualise lists > 100.
- Skeletons match final dimensions; no layout shift.
- Offline: service worker caches shell, saved listings, recent searches; checkout blocked offline with clear message.

### 16.8 State coverage matrix (apply to every component)

| State | Required | Pattern |
|---|---|---|
| Loading | Yes | Skeleton shaped like content |
| Empty | Yes | DS EmptyState with one next action |
| Error | Yes | Inline message + retry; never blank |
| Offline | Yes | Banner + cached content |
| Disabled | Yes | Reason in tooltip/helper text |
| Success | Yes | Toast or inline confirmation |
| Partial | Yes | Show what loaded; mark rest |
| Permission | If applicable | Location/notification/camera pre-prompt with benefit + deny path |

---

# PART VIII — ICONS, TOKENS, HOOKS

## 17. Icons, tokens and shared utilities

### 17.1 Icons already available that cover the marketplace `[DS]`
store, shopping-bag, shopping-cart, tag, ticket-percent, percent, truck, package, package-check, package-search, car, sofa, shirt, tv, watch, baby, paw-print, building, gift, gem, search, search-x, filter, sliders, list-filter, sort, map-pin, map, navigation, route, compass, heart, star, bookmark, bookmark-check, bookmark-plus, share, share-nodes, flag, chat, message-text, messages, inbox, bell, bell-ringing, mail, camera, image, image-plus, video, qr-code, scan-line, shield, shield-check, lock, fingerprint, id-card, badge-check, user, user-check, users, handshake, wallet, card, bank, receipt, vault, banknote, clock, timer, hourglass, calendar, calendar-clock, refresh, repeat, undo, rotate-ccw, external-link, link, copy, download, upload, file-pdf, eye, eye-off, info, help-circle, alert, check, close, plus, minus, chevrons, arrows, grid, list, menu, home, settings, globe, moon, sun, whatsapp, telegram, x-twitter, instagram, facebook.

### 17.2 Icons to add (not seen in the listing I read; verify before drawing)

The icon page output was truncated in the Arcade & fun and General groups, so confirm none of these exist first.

| Needed | Used for |
|---|---|
| `gavel` | Auctions, bids |
| `rider` / `bike` | Rider delivery |
| `pickup-station` | Pickup point |
| `meetup` (two people + pin) | Local meet-up |
| `camera-search` | Image search |
| `price-drop` (tag + down arrow) | Price-drop chip |
| `escrow-lock` (shield + wallet) | Protection badge |
| `return-box` | Returns |
| `verified-store` | Verified shop |
| `top-rated` (award + store) | Top rated seller |
| `condition-new`, `condition-used`, `condition-refurb` | Condition chips |
| `delivery-pin` | Delivery PIN/QR |
| `offer` (hand + tag) | Make offer |
| `compare` | Compare tray |
| `grid-view`, `list-view` | View toggle (grid and list exist; verify distinct glyphs) |
| `cart-add` | Quick add |
| `heart-filled` | Saved state |

Rules: duotone, 24px grid, gold gradient back layer + 2px front stroke `[DS]`. Provide filled variant only for states (heart-filled, star-filled).

### 17.3 Tokens to add (extend, don't fork)

| Token | Purpose | Suggested value |
|---|---|---|
| `--cx-density-pad` | Card padding by density | 24 / 12 |
| `--cx-density-row` | Row height | 56 / 44 |
| `--cx-gap-grid` | Grid gap | 24 / 12–16 |
| `--cx-price-size` | Price size by context | 20 / 32 |
| `--cx-chip-condition-*` | Condition chip tints | derived from neutrals + gold |
| `--cx-savings` | Alias of `--cx-gain` | – |
| `--cx-urgent` | Alias of `--cx-warning` for countdowns | – |
| `--cx-sheet-radius` | Bottom sheet corner | 20 (DS card) top corners |
| `--cx-sticky-offset` | Header + rail height for sticky positioning | computed |
| `--cx-safe-bottom` | Safe-area inset + bottom nav height | env() + 64 |
| `--cx-z-*` | Layers: header, sticky bar, drawer, modal, toast, tooltip | 100/200/300/400/500/600 |

### 17.4 Shared hooks and utilities (40)

`useTrack`, `useAuthGate(intent)`, `useLocation`, `useCurrency` (`formatCurrency`, `toMinor`), `useCart`, `useSaved`, `useSearchParams` (URL ↔ filters), `useRecentSearches`, `useDebounce`, `useInfiniteList`, `useScrollRestoration`, `useMediaQuery` (768/1200), `useReducedMotion`, `useServerTime` (timers), `useCountdown`, `useOnlineStatus`, `useIdempotencyKey`, `useUpload` (resumable), `useImageCompress`, `useDraftAutosave`, `useFormErrors` (summary + focus), `usePagination`, `useClipboard`, `useShare`, `useGeolocation`, `useDistance`, `useDeliveryEstimate`, `useTotalToCity`, `useOfferRules`, `useEscrowState`, `usePaymentPoll`, `useNotifications`, `useRealtime` (messages, bids), `useVirtualList`, `useLightbox`, `useFocusTrap`, `useLiveRegion`, `useAnalyticsContext`, `useFeatureFlag`, `useAbTest`.

---

# PART IX — BUILD ORDER AND ACCEPTANCE

## 18. Build order (aligns with Sprint 0 and Phases 4–9 in `worldstreet-ux-flows.md`)

| Stage | Build | Why first | Done when |
|---|---|---|---|
| 0 Foundations | Manrope + gold tokens, density tokens, `PriceBlock`, `ConditionChip`, `SaveButton` (a11y), `ListingCard` link, `RatingStars`, state matrix helpers | Fixes sandbox divergence and the F1–F13 audit issues | Sandbox cards open `/listing/:id`; prices canonical NGN; contrast AA |
| 1 Header & search | `AppHeader`, `GlobalSearchBox`, `SearchSuggestPanel`, `ShipToSelector`, `CategoryMegaMenu`, mobile search overlay, `BottomNav` 5 tabs | Search is the primary behaviour | Query returns results; keyboard nav works |
| 2 Results | `ResultsHeader`, `FilterRail`, `FilterSheet`, facets, `ActiveFilterChips`, `SortMenu`, `ViewToggle`, `ZeroResults`, `InfiniteLoader`, `SaveSearchButton` | Core eBay parity | Filters with counts update live; URL state; scroll restore |
| 3 Detail | `Gallery`, `BuyBox`, `VariationSelector`, `DeliveryPanel`, `ReturnsPanel`, `ProtectionPanel`, `ItemSpecifics`, `SellerCard`, `ReviewsSection`, `StickyBuyBar` | Decision screen | Price/delivery/return/trust above fold on 375×812 |
| 4 Offers & messages | `OfferModal`, offer cards, `InboxLayout`, thread components, safety banners | Differentiates from fixed-price retail | Offer state machine passes tests |
| 5 Cart & checkout | Cart components, `CheckoutLayout`, address, delivery, payment, escrow notice, confirmation | Revenue | Test payments incl. failure paths |
| 6 Orders & escrow | `OrderDetail`, timelines, `EscrowStatusCard`, `ConfirmReleaseSheet`, `DeliveryCard`, `ReviewForm`, `ReportProblemWizard` | Trust | Escrow acceptance tests (flows doc, L14) |
| 7 Seller | Onboarding, wizard, listings table, orders, payouts, performance | Supply | First listing < 4 min |
| 8 Admin | Moderation, cases, ledger | Safety | SLA timers visible |
| 9 Growth | Auctions, compare, price history, promotions, analytics, Q&A | Parity extras | – |

**Acceptance (per component):** Storybook stories for all states × light/dark × 375/768/1280 · axe zero serious/critical · keyboard-only run-through · reduced-motion check · Lighthouse mobile ≥ 90 on pages that use it · analytics events fire once · visual regression snapshot.

---

# PART X — MASTER CHECKLIST ("everything to mirror")

Use this as the tracking list. `W` = web, `M` = mobile.

## A. Shell
- [ ] AppHeader (W two-row, M single-row)  - [ ] UtilityBar (W)  - [ ] ShipToSelector (W popover, M sheet)  - [ ] LocationBar inline
- [ ] CategoryMenuButton + MegaMenu (W)  - [ ] Category drill-down drawer (M)  - [ ] CategoryRail
- [ ] GlobalSearchBox with scope select + camera  - [ ] SearchSuggestPanel  - [ ] Mobile search overlay  - [ ] ImageSearchButton
- [ ] NotificationBell + Panel (W) / page (M)  - [ ] CartButton + MiniCart  - [ ] AccountMenu (W) / Account tab (M)  - [ ] WalletBalanceChip  - [ ] SellButton
- [ ] BottomNav 5 tabs (M)  - [ ] HelpBubble  - [ ] SkipLinks  - [ ] SiteFooter (accordion M)  - [ ] CookieConsent  - [ ] AppInstallBanner  - [ ] SystemBanner

## B. Home
- [ ] HeroCarousel w/ pause + counter  - [ ] PromoCouponCard  - [ ] TrustStrip  - [ ] CategoryTiles  - [ ] ProductRail  - [ ] DealsRail  - [ ] TrendingTabs
- [ ] RecentlyViewedRail  - [ ] BecauseYouSavedRail  - [ ] NearYouRail  - [ ] EditorialTile  - [ ] SponsoredSellerBanner  - [ ] SignInNudge  - [ ] SellCTABlock  - [ ] FeaturedBeamCard

## C. Cards & atoms
- [ ] ListingCard: grid, list, rail, compact, sponsored, deal, auction, vehicle, property, service, skeleton, unavailable
- [ ] ConditionChip  - [ ] FormatChip  - [ ] DiscountChip  - [ ] UrgencyBadge  - [ ] SponsoredLabel  - [ ] VerifiedTick  - [ ] TopRatedBadge  - [ ] RatingStars (read + input)
- [ ] PriceBlock (card/detail/cart/sticky)  - [ ] DeliveryLine (+ Total to city)  - [ ] LocationLine  - [ ] SocialProof  - [ ] SellerMini  - [ ] SaveButton  - [ ] PhotoCount  - [ ] QuickAddButton  - [ ] FindSimilarButton  - [ ] Card overflow menu (Hide/Report)

## D. Search & filters
- [ ] ResultsHeader  - [ ] SaveSearchButton  - [ ] SortMenu  - [ ] ViewToggle  - [ ] FilterRail (W)  - [ ] FilterSheet (M)  - [ ] FilterGroup  - [ ] FacetCheckbox (counts)
- [ ] CategoryTree  - [ ] PriceRangeFilter  - [ ] ConditionFilter  - [ ] FormatFilter  - [ ] LocationRadiusFilter  - [ ] DeliveryFilter  - [ ] SellerFilter  - [ ] ColorSwatchFilter  - [ ] SizeFilter  - [ ] BrandFilter
- [ ] ActiveFilterChips  - [ ] PopularFilterChips  - [ ] RelatedSearches  - [ ] IncludeDescriptionToggle  - [ ] SpellCorrection  - [ ] ZeroResults  - [ ] ResultsGrid/List  - [ ] ResultsPagination  - [ ] InfiniteLoader  - [ ] CompareTray

## E. Detail
- [ ] ListingPageLayout  - [ ] ListingBreadcrumb  - [ ] Gallery  - [ ] GalleryLightbox  - [ ] VideoPlayer  - [ ] ListingTitleBlock  - [ ] SellerStrip  - [ ] BuyBox  - [ ] VariationSelector  - [ ] QuantityStepper
- [ ] ActionStack  - [ ] StickyBuyBar (M)  - [ ] DemandLine  - [ ] ReassuranceLine  - [ ] DeliveryPanel  - [ ] ReturnsPanel  - [ ] PaymentsPanel  - [ ] ProtectionPanel  - [ ] ConditionInfo
- [ ] ItemSpecifics  - [ ] SellerNotes  - [ ] DescriptionBlock  - [ ] RevisionHistory  - [ ] ListingMeta  - [ ] SellerCard  - [ ] SellerRatingsBreakdown  - [ ] ReviewsSection (+ filters, cards, photos)
- [ ] QAThread  - [ ] SimilarItemsRail  - [ ] SellerOtherItemsRail  - [ ] CategoryBestSellers  - [ ] ShareSheet  - [ ] ReportListingModal  - [ ] SafetyTipsCard  - [ ] LocalPickupMap  - [ ] UnavailableState  - [ ] PriceHistorySparkline

## F. Offers & bids
- [ ] OfferModal/Sheet  - [ ] OfferSummaryCard  - [ ] OffersList (buyer/seller)  - [ ] CounterOfferCard  - [ ] OfferActionBar  - [ ] AutoOfferSettings  - [ ] OfferThreadItem
- [ ] BidPanel  - [ ] MaxBidExplainer  - [ ] CountdownTimer  - [ ] BidHistory  - [ ] OutbidToast

## G. Cart & checkout
- [ ] CartPage  - [ ] CartSellerGroup  - [ ] CartLineItem  - [ ] SaveForLaterList  - [ ] CartPriceChangeBanner  - [ ] CouponField  - [ ] OrderSummary  - [ ] EmptyCart  - [ ] CartRecommendations  - [ ] MiniCart
- [ ] CheckoutLayout  - [ ] CheckoutSection  - [ ] CheckoutSteps  - [ ] AddressSelector  - [ ] AddressForm  - [ ] AddressAutocomplete  - [ ] PhoneInput  - [ ] DeliverySelector  - [ ] PickupStationPicker
- [ ] PaymentMethodPicker  - [ ] CardForm (hosted fields)  - [ ] BankTransferPanel  - [ ] UssdPanel  - [ ] WalletBalanceToggle  - [ ] EscrowNotice  - [ ] PayButton  - [ ] InventoryLockTimer  - [ ] PaymentStatusPoller  - [ ] PaymentErrorPanel  - [ ] OrderConfirmation  - [ ] KycGateSheet

## H. Orders & trust
- [ ] OrdersPage  - [ ] OrderRow  - [ ] OrderDetail  - [ ] OrderStatusTimeline  - [ ] MoneyTimeline  - [ ] EscrowStatusCard  - [ ] InspectionCountdown  - [ ] ConfirmReleaseSheet  - [ ] DeliveryCard (PIN/QR)  - [ ] TrackingMap
- [ ] ReceiptView  - [ ] ReviewForm  - [ ] ReportProblemWizard  - [ ] EvidenceUploader  - [ ] DisputeTimeline  - [ ] RefundTracker  - [ ] ReturnInstructionsCard  - [ ] BuyAgainButton  - [ ] OrderIssueBanner

## I. Messaging
- [ ] InboxLayout  - [ ] ThreadList/Row  - [ ] ThreadHeader  - [ ] PinnedListingCard  - [ ] MessageBubble  - [ ] MessageInput  - [ ] QuickReplies  - [ ] OfferMessageCard  - [ ] OrderEventMessage  - [ ] SafetyBanner  - [ ] ContentWarning  - [ ] AttachmentPreview  - [ ] BlockReportMenu  - [ ] AwayModeBanner  - [ ] TypingIndicator

## J. Account & content
- [ ] SignInSheet/AuthModal  - [ ] AccountHome  - [ ] ProfileForm  - [ ] AddressBook  - [ ] PaymentMethodsList  - [ ] KycStepper  - [ ] LevelBadge  - [ ] VerifiedBadge  - [ ] NewSellerBadge  - [ ] SellerPublicProfile + SellerProfileHeader  - [ ] SellerStats
- [ ] SavedPage + SavedSearchRow  - [ ] NotificationCentre  - [ ] NotificationPreferences  - [ ] HelpCentreHome  - [ ] EscrowExplainerPage  - [ ] PolicyPage template  - [ ] ErrorPages (404, 410, 500, offline)

## K. Seller
- [ ] SellerShell  - [ ] SellerOnboarding  - [ ] PayoutAccountForm  - [ ] CreateListingWizard  - [ ] PhotoUploader  - [ ] CategoryPicker  - [ ] ItemSpecificsForm  - [ ] TitleInput  - [ ] RichTextEditor  - [ ] FormatPicker  - [ ] PriceGuidancePanel  - [ ] FeePreview
- [ ] DeliveryProfileEditor  - [ ] ReturnPolicyPicker  - [ ] ListingLivePreview  - [ ] PublishChecklist  - [ ] ListingsTable  - [ ] BulkActionBar  - [ ] InlineEditCell  - [ ] SellerOrdersTable  - [ ] DispatchSheet  - [ ] PackingSlipView
- [ ] SellerOffersInbox  - [ ] PayoutsPage (BalanceBreakdown, LedgerTable)  - [ ] WithdrawFlow  - [ ] PerformanceDashboard  - [ ] StandardsMeter  - [ ] PromotionWizard  - [ ] AnalyticsDashboard  - [ ] BulkImport

## L. Admin
- [ ] AdminShell  - [ ] ModerationQueue  - [ ] ListingReviewPanel  - [ ] CaseView  - [ ] LedgerViewer  - [ ] UserLookup  - [ ] RiskRulesTable  - [ ] AuditLogTable  - [ ] SupportConsole

## M. Cross-cutting
- [ ] Density system (comfortable/compact)  - [ ] Manrope + gold token migration  - [ ] `--ws-*` ↔ `--cx-*` alias layer  - [ ] Missing icons (17.2)  - [ ] Hooks (17.4)  - [ ] State matrix coverage  - [ ] A11y checks  - [ ] Performance budgets  - [ ] Analytics events  - [ ] Copy string table (one source for escrow, delivery, return claims)

---

# PART XI — EBAY PATTERNS TO MIRROR (BEHAVIOUR, NOT JUST COMPONENTS)

These are interaction rules seen on eBay that components alone do not capture.

| # | eBay pattern | How WorldStore mirrors it | Source |
|---|---|---|---|
| 1 | Search is the dominant control; category scope inside the search bar | Wide search with scope select + camera | `[eBay-observed]` |
| 2 | Every result card answers "what, condition, total cost, who, trust" | `ListingCard` order in 5.1 | `[eBay-observed]` |
| 3 | Delivery cost and date shown to *your* location, on cards and detail | `ShipToSelector`, `DeliveryLine`, `DeliveryPanel` | `[eBay-observed]` |
| 4 | Facets show counts and update without dead ends | `FacetCheckbox` with counts; zero disabled | `[eBay-observed]` |
| 5 | Condition is a first-class label | `ConditionChip` everywhere | `[eBay-observed]` |
| 6 | Format shown (Buy It Now / or Best Offer / Auction) | `FormatChip` | `[eBay-observed]` |
| 7 | Honest scarcity and demand ("64+ sold", "Last one", "22 watchers", "In 137 carts") | `SocialProof`, `UrgencyBadge` (real data only) | `[eBay-observed]` |
| 8 | Seller trust inline on every card (name, % positive, count) | `SellerMini` | `[eBay-observed]` |
| 9 | Sponsored items labelled | `SponsoredLabel` | `[eBay-observed]` |
| 10 | Three-level CTA: Buy It Now / Add to cart / Watch | `ActionStack` | `[eBay-observed]` |
| 11 | Reassurance line next to CTA ("Returns accepted") | `ReassuranceLine` | `[eBay-observed]` |
| 12 | "Shop with confidence" block | `ProtectionPanel` | `[eBay-observed]` |
| 13 | Structured item specifics + seller notes + revision history | `ItemSpecifics`, `RevisionHistory` | `[eBay-observed]` |
| 14 | Four-dimension seller ratings and verified-purchase feedback with masked IDs | `SellerRatingsBreakdown`, `ReviewCard` | `[eBay-observed]` |
| 15 | "Find more like this" visual similarity | `FindSimilarButton` | `[eBay-observed]` |
| 16 | Save this search | `SaveSearchButton` + alerts | `[eBay-observed]` |
| 17 | Coupons with terms in small print on hero | `PromoCouponCard` | `[eBay-observed]` |
| 18 | Guests can browse, search, view and cart before signing in | Auth gate resumes intent (R-004) | `[eBay-observed]` + `[eBay-inferred]` |
| 19 | Selling page: AI-assisted listing, fee reassurance, six listing tips, FAQ | `CreateListingWizard` assist, tips panel, `FeePreview` | `[eBay-observed]` |
| 20 | Money Back Guarantee: on-platform payments only; three coverage cases | Escrow + dispute system | `[eBay-observed]` |
| 21 | Cart grouped by seller; single checkout | Cart/checkout components | `[eBay-inferred]` |
| 22 | Best Offer with expiry and limited counters | Offer system | `[eBay-inferred]` |
| 23 | Seller Hub tabs and performance standards | Seller shell + dashboard | `[eBay-inferred]` |
| 24 | Persistent help access | `HelpBubble` | `[eBay-observed]` |

### Where WorldStore should deliberately be better than eBay
1. **One "Total to {city}"** price instead of tiny delivery text.
2. **Local-first:** radius filter, distance on cards, pickup/meet-up options, rider details.
3. **Escrow as the headline, not a footnote.**
4. **Non-blocking location prompt** (inline bar, not a modal).
5. **Item review vs seller score separated** and labelled.
6. **Calmer surfaces** from the DS (aurora only on brand moments) with a compact density for commerce.
7. **One wallet** across Shop, Dashboard, Academy and Xtreme: wallet chip in header, wallet as payment method, payouts into the same balance.

---

## Sources and confidence
- WorldStore design system (`/`, `/foundations`, `/components`, `/patterns`, `/icons`, `/motion`), read 6 Oct 2026. Not read: `/aurora` and the Cryonix switcher.
- eBay: homepage, search results, two item pages, selling page, Money Back Guarantee policy, 6 Oct 2026. Sign-in-gated screens are inferred.
- WorldStore marketplace sandbox, audited 6 Oct 2026.
- Counts (~265 components, 40 hooks) are a tally of rows in this document, not an industry number.
