# WorldStreet Marketplace — Progress

Plan: [PLAN.md](PLAN.md). Each phase ends with a report below. Items are ticked in the master
checklist (component spec, Part X) when they meet the spec row, have stories and a test, and
pass `npm run check`.

## Phase reports

_Phase 0 in progress on `phase/0-foundations`: S0.0–S0.10 done (home, placeholder routes, manifest, a11y pass: axe zero serious/critical on `/`, `/search`, placeholders and the 404 at 375, 360 and 1280); Sprint 0 check #5 passes (e2e/home.spec.ts). Next: Phase 1 (header, footer, bottom nav). Building in dark mode (your direction, 6 Oct). Sprint 0 checks #1–#4 pass end to end (e2e/search.spec.ts, 375 and 1280). Components mirror eBay, styled with the DS (your direction, 6 Oct)._

## Deviations from the docs and the design system

| Date | Where | Deviation | Why |
|---|---|---|---|
| 6 Oct | DS tokens | Five text tokens changed: light `--cx-text-muted` #78716c→#6c6661, `--cx-ember-text` #a16207→#925906, `--cx-warning` #b45309→#a84d08, `--cx-gain` #047857→#047655; dark `--cx-loss` #ef4444→#f36e6e | The published values drop below 4.5:1 on the DS's own translucent surfaces (worst 3.95:1). Your AA rule outranks the DS. Measured by Foundations › Colors. **Worth fixing upstream in the DS** |
| 6 Oct | DS tokens | `--cx-text-3` and `--cx-text-disabled` kept off readable text | `--cx-text-3` is 50% alpha: 3.9:1 on white |
| 6 Oct | DS tokens | `--cx-panel` re-pointed to stone/gold | The brand block leaves it on the base theme's ember gradient |
| 6 Oct | DS base | `scroll-behavior: auto` under reduced motion | The DS sets smooth scrolling and never switches it off |
| 6 Oct | Fonts | ₦ comes from a 1.2 KB Noto Sans subset placed **before** Manrope in `--cx-font` | Manrope has no U+20A6 (checked in its latin-ext cmap). The DS stack lists "Noto Sans" after Manrope, which lets the metric fallback font draw ₦ |
| 6 Oct | Spec §17.3 | No new `--cx-z-*` scale | The DS already has `--cx-z-sticky` 100 … `--cx-z-tooltip` 700 and `--cx-touch` 44px |
| 6 Oct | Checklist M3 | `--ws-*` ↔ `--cx-*` alias layer not built | Nothing from the sandbox is ported (your direction, 6 Oct) |
| 6 Oct | Icons | Atlas has no plain chevron, ✕, ✓, +/− strokes, menu bars or sort arrows. Using `ArrowLeft/Right/Down` as chevrons, `XmarkCircle` (close), `CheckCircle`, `PlusCircle`/`MinusCircle`, `ListRight` (menu), `NavigateArrowUpDown` (sort), `MenuSquare` (categories). Also misleading names avoided: `Cross` is a religious cross, `Hamburger` is food, `Pin` is a thumbtack | You asked for Atlas as the only icon source, so nothing is hand-drawn. If you'd rather have a bare ✕/chevron, I can draw 6 primitives on the Atlas grid (spec §17.2 allows additions) |
| 6 Oct | Icons | Atlas is generated into `components/icons/atlas.generated.ts` (60 icons, ~21 KB, per-icon exports), ids and inline `<style>` stripped | The package is one 3 MB untree-shakable module, and its fixed ids duplicate when an icon repeats (axe failure) |
| 6 Oct | DS components | Batch 1 rebuilt in `components/ui` (Button, Chip, DeltaChip, Count, Card, IconTile, Badge, Avatar, Skeleton, EmptyState, Toast, Menu, Tooltip) from the site's code samples, rendered markup and CSS | DS React source isn't available |
| 6 Oct | DS a11y gaps | Small buttons get a 44px hit area; menu rows 44px on touch; Tooltip dismisses on Escape (1.4.13); DeltaChip uses sr-only text instead of `aria-label` on a span; light-theme tile icons use the gold text token (tile icon was ~1.3:1) | WCAG 2.2 AA rule outranks the DS |
| 6 Oct | DS CSS loading | All component CSS loads once via `globals.css` (layer components) | Next 16 only documents global CSS imports from inside `app/` |
| 6 Oct | Tooling | Local browser tests drive installed Chrome | Playwright has no Chromium build for macOS 13; CI uses bundled Chromium |
| 6 Oct | Config | Low-price warning uses EC-027's "under 40% **of** the comparable median" (`priceWarnBelowPercentOfMedian`) | S2 step 4 says "< 40% below" the median (i.e. under 60% of it). The two disagree; EC-027 is the specific rule. **Confirm which you want** |
| 6 Oct | Data | Entity fields keep Part G's snake_case (`price_minor`, `seller_id`, `created_at`) | Matches the docs and the eventual API, so nothing is renamed at the boundary |
| 6 Oct | Mocks | Mock photos are one labelled SVG placeholder per category in `public/mock/img/`, built from Atlas icons | No stock or real product photos; nothing to license or mistake for a real item |
| 6 Oct | Direction | Components mirror eBay's anatomy, order and wording, styled with the DS | Your direction (6 Oct). Recorded in PLAN.md |
| 6 Oct | SaveButton | Name stays "Save {title}" and `aria-pressed` carries the state; it doesn't swap to "Remove from saved" | Spec §5.3 asks for both, but a toggle whose label changes is announced wrongly (WAI-ARIA APG). The title keeps every card's button unique (§16.6) |
| 6 Oct | DiscountChip | Reads "13% off" (eBay) rather than "−13%" | eBay's wording, and it needs no screen-reader workaround. Still the savings colour, never red |
| 6 Oct | FormatChip / PriceBlock | eBay puts "or Best offer" under the price as text, so PriceBlock has `bestOffer`; the chip says "Best offer" | Mirrors eBay; the chip stays for detail and filters |
| 6 Oct | ConditionChip | eBay's condition names: Brand new, Like new, Refurbished, Pre-owned, For parts or not working | eBay's wording in the DS's sentence case |
| 6 Oct | R-004 gate | Guests get a "Sign in to save listings" toast with a Sign in action (mock session), and the save completes after | SignInSheet + useAuthGate land in Phase 4; callers of `requireAuth()` won't change |
| 6 Oct | Saved | Saved listings live in localStorage (`features/saved/store.ts`), capped at 500 | No accounts yet. Only that file changes when a server store exists |
| 6 Oct | TopRatedBadge | Not a link yet | The standards page arrives with the S0.10 placeholder routes; no dead links (F5) |
| 6 Oct | DeliveryLine | No "How we calculate" popover; the total sits on its own line under the fee | The popover belongs with DeliveryPanel (Phase 3). Stacking avoids a stranded "·" when the line wraps |
| 6 Oct | DeliveryOption | Added `coverage` (`same_city` / `nationwide`) | "Total to {area}" must use an option that reaches the buyer; riders and meet-ups don't leave the seller's city |
| 6 Oct | RatingStars | Atlas's star detail stroke is hidden inside ratings | It reads as noise in empty and half stars |
| 6 Oct | ListingCard | Photo is full-bleed at 1:1 on the DS card; the rating row and two title lines are always reserved | Your review (6 Oct): the photo should fill the card and spacing be even. Reserving rows keeps prices and seller lines level across a grid row |
| 6 Oct | Meta lines | Separators are clipped at the start of a wrapped line instead of sitting between items in the markup | A wrap no longer strands a "·"; the dots are hidden from screen readers |
| 6 Oct | Mobile card | On phones the grid card shows condition as text, price + "% off" on one line, "Total ₦X" (area is in the location bar), distance only, one demand signal and the seller's name; desktop keeps everything | Your review (6 Oct): mobile cards were too long (~650px → ~410px at 375). Mirrors eBay's app grid; the rest is on the listing page |
| 6 Oct | Interaction motion (owner: "expressive") | Grid cards tilt towards the pointer and lift, photo eases in (hover devices only); card → listing photo morphs (React ViewTransition); results reveal in staggered batches on scroll (GSAP ScrollTrigger); the results count rolls; Save pops with a ring and sparks; Hide shrinks the card and springs in the Undo note; search suggestions spring open with staggered rows; magnetic Search / Show more / Apply; buttons press on a spring; menus drop in and phone sheets rise (`@starting-style`); toasts spring and reflow (Motion layout). All off under reduced motion | Owner request. Story tests skip animations (`MotionGlobalConfig.skipAnimations` when the browser is driven) so axe checks the settled frame; the hide test caught Undo losing focus behind the exit animation (fixed with a mount ref) |
| 6 Oct | 3D foundation (owner: hero + listing viewer) | `ThreeStage`: three.js and the scene load only when the stage nears the viewport, pause off-screen and in background tabs, fade in over a server-rendered fallback, and fall back on a lost GL context or a switch to reduced motion. A capability gate (`lib/three/capability.ts`, thresholds in `rules.three`) turns away no-WebGL, reduced-motion, data-saver, under-4 GB and under-4-core devices. Scenes: home hero (gold and dark parcels, coins and rings easing out on the DS curve, leaning to the pointer, gold dust) and the listing photo ring (drag to turn, momentum, springs to the nearest photo, "Photo 3 of 6" live caption) | Budget Android and metered data (spec §16.7): nobody below the bar downloads three.js. Hero goes in with S0.10; the viewer joins the Phase 3 gallery, which stays the keyboard route |
| 6 Oct | Mock photos | Placeholders are drawn from each category's Atlas icon (`npm run mock-photos`) | Your rule (6 Oct): Atlas is the only icon set, placeholders included |
| 6 Oct | Theme | Components are designed and reviewed in dark; light is checked for AA | Your direction (6 Oct) |
| 6 Oct | ListingCard | Trimming to eBay's app density is a container query on the card's details column (< 240px), not a viewport breakpoint | One rule set covers phone grids, home rails and the phone list view |
| 6 Oct | Results grid | 4 columns from 1200px, not 5 at 1320 | Five columns make desktop cards narrow enough to trim; the spec allows 4–5 |
| 6 Oct | Card menu | Only "Not interested" and "Hide {shop}" for now, each with Undo (focus moves to Undo) | "Find similar" (/search, S0.9) and "Report" (Phase 3) would be dead ends today (audit F5) |
| 6 Oct | SellerMini | "Top rated" sits beside the shop name, a size down in seller rows | Keeps the card's seller row to two lines next to the ⋮ |
| 6 Oct | Sort | Price sorts are labelled "Price: lowest/highest first" and use the item price; best match uses the B2 weights with relevance from search | "Price + delivery" needs delivery quotes (PLAN C10); the label doesn't promise what the sort doesn't do yet |
| 6 Oct | Menu | Added `checked` items (menuitemradio + aria-checked); the menu opens on the checked one | Sort orders are a single choice |
| 6 Oct | Location | Area in an httpOnly cookie (`ws-area`, area id only), radius in the URL (`?radius=5|10|25|all`, default 25 omitted). No cookie = IP city, mocked as Lagos | The server renders nearby results without client JS; radius is a shareable, Back-able state (R-011) |
| 6 Oct | ShipToSelector | A form on a native popover posting to a Server Action (validated inputs, same-site return path only); "Use my location" asks only on tap and keeps just the nearest named area | Works before scripts load; no open redirect; position never leaves the device (F8) |
| 6 Oct | Search | Prefix matching, every word must match (title, category, attributes, shop); a starter synonyms table (EC-003) and an illustrative prohibited list (EC-004) in `lib/search/query.ts` | Ops own the real lists; the prohibited list belongs server-side in the moderation service |
| 6 Oct | Search | "Show more" is a link to `?page=N` showing N×24 results, not infinite scroll | Keeps every state a URL (R-011) and Back exact; InfiniteLoader is Phase 2 |
| 6 Oct | Routes | `/listing/:id-:slug` is a placeholder (photo, price, delivery, seller) with canonical-slug redirects; `/help/*` is a placeholder | Cards and the EC-004 policy link must not be dead ends (F5); the real pages are Phase 3 and S0.10 |
| 6 Oct | Property cards | No condition chip on property (the row stays reserved) | "Brand new" means nothing for a flat to let |
| 6 Oct | Deploys | `vercel.json` turns off Vercel's automatic Git deployments (`git.deploymentEnabled: false`) | Your direction (6 Oct): no more Vercel deploys. The Vercel GitHub app was building a preview of every push |
| 6 Oct | Dark theme (UI research) | Dark only: `--cx-elevated` #1c1917→#292524, `--cx-text` #fff→#f5f5f4, `--cx-text-2` #f0f0f0→#d6d3d1; to keep AA on hover fills over the lighter surface, muted #a8a29e→#aaa5a1, loss #f36e6e→#f58686, gain #10b981→#10be84 | Raised surfaces were 1.13:1 against the page; Material, Apple HIG and eBay evo-dark lift them with lighter surfaces, and use distinct text tiers. **Worth raising upstream in the DS** |
| 6 Oct | DS gap fixes (UI research) | `.cx-skel` stops shimmering under reduced motion; the DS card hover lift/wash only on `(hover: hover)` devices | Sticky hover after taps on phones; motion preference |
| 6 Oct | Cards (UI research) | Stars in the text colour (price is the one gold element), visited titles a step dimmer, press feedback on tap, hover underline only on hover devices, faint photo scrim plus a hairline edge in dark | eBay item tile and image treatment, Baymard list items, NN/g visited links |
| 6 Oct | Mock photos | Re-generated at mid-tone | Light placeholders glared on the dark page |
| 6 Oct | DeliveryLine (UI research) | Days on the delivery line ("+₦2,500 delivery in 2–4 days"; dropped under 240px), "Total to {area}" only when it differs from the price, a "Free local pickup" row with the handshake icon, pickup stations named as such ("+₦3,000 pickup station", "Total with pickup") and never "free delivery"; door delivery leads | eBay tiles show delivery time and "Free local pickup"; a total equal to the price is noise; a station isn't door delivery. Spec §5.1 item 6 to gain "Free local pickup" |
| 6 Oct | Rent | `price_period` on listings; PriceBlock shows "₦1,800,000 per year"; property cards skip the delivery line | Baymard price-per-unit; rent isn't delivered |
| 6 Oct | Trust | Verified ID uses Atlas `UserCheck` ("Verified ID"), keeping the shield for escrow; "New seller" chip (Atlas `Leaf`) under `rules.trust.newSellerFeedbackCount` ratings unless top rated | Two different promises shouldn't share an icon; "100% positive (4)" overstates a new seller (spec §440) |
| 6 Oct | Images | `priority` replaced by `loading` + `fetchPriority` (first 2 high, first 4 eager, `rules.media`); AVIF then WebP; quality 60 for rail/compact thumbnails; grid `sizes` matches the real column widths | Next 16 deprecates `priority`; four preloads competed on phones; data cost |
| 6 Oct | Results page (UI research) | The h1 carries the count and place ("32 listings near Lagos", "5 results for “phone”", "No results for “sofa” near Lagos"); ZeroResults titles name the next step; EC-004 says "No results" once; "You've viewed 24 of 32" above Show more; "That's everything within 25 km" plus "1 more result nationwide" at the end | NN/g no-results and scoped search, Baymard load more, BBC GEL load more |
| 6 Oct | Instant feedback | In-page search links (sort, chips, wider area, Show more) run as transitions: results stay and dim, a thin gold progress bar shows, Show more says "Loading more…"; Apply says "Applying…"; error screens with Try again and a search box; a listing loading skeleton. Links still work without JS | High-latency networks make a server round trip look like a dead tap (NN/g). No search `loading.tsx`, so the search box never blanks |
| 6 Oct | Phones | The IP-guessed location says "Based on your connection. Not right?" on every width; sort shows a gold dot when not Best match; filter chips are 44px tall and one scrolling row | Mobile IP location is often >100 km off in Africa; Baymard applied filters |
| 6 Oct | Escrow copy | One source (`lib/copy/escrow.ts`); "Every deal protected by escrow" replaced, since vehicles and property have no escrow checkout; the listing stub shows the claim (or the no-escrow note) | PLAN F9, L11.4, L14 test 8 |
| 6 Oct | Search box (UI research) | Suggestions match like results (word prefixes, local spellings; shared `lib/search/words.ts`), bold the part not typed, ↑ ↓ put the suggestion in the field and Escape restores the typed text (never wipes it), a Clear button replaces the browser's, recents removable (Shift+Delete or ×), counts in `rules.search`, trending icon `ArrowUpGraphIncrease`; after a prohibited search the box shows no suggestions and forgets the term | Baymard autocomplete (reverse highlighting, copy suggestion to field), eBay combobox and search field, NN/g; EC-004 |
| 6 Oct | Link previews (UI research) | `metadataBase` from `SITE_URL`, default Open Graph (en_NG), listing canonical URL and preview text ("₦485,000 · Brand new · Ikeja GRA, Lagos"), and a generated 1200×630 preview image; a static bold TTF of the ₦ glyph (`app/fonts/noto-sans-naira-700.ttf`) because `next/og` can't read WOFF2 or variable fonts | Blueprint F16: listings travel by WhatsApp. **Set `SITE_URL` per environment** |
| 6 Oct | Search matching | A word matching only the shop name no longer makes a listing match | Weak matches crowded price sorts (Baymard faceted sorting); shop search belongs to Phase 1 seller suggestions |
| 6 Oct | Sort on phones | Menu `sheetTitle`: below 768px the sort menu is a bottom sheet titled "Sort by" with 52px rows; a dropdown elsewhere | Spec §6 (sheets, not dropdowns, on phones), Material bottom sheet |
| 6 Oct | Hidden cards | Hides mirror into a `ws-hidden` cookie (ids only, capped by `rules.hidden`), and the server leaves them out of results and counts | No reload flash; "Showing 24 of N" stays true |
| 6 Oct | Testing | Playwright `android-360` project; no-sideways-scroll checks at 360 and 320 (caught a real 38–50px overflow, fixed with `minmax(0, 1fr)` on the page column). Lighthouse CI deferred: it adds a dependency, and there's no home page to budget yet (S0.10) | GSMA device mix; spec §16.7 |
| 6 Oct | Card subtitle (decided C2) | Condition plus up to 3 category facts on one line under the title ("Pre-owned · 256GB · Battery 89%", "1 bed · 1 bath"), replacing the condition chip on cards; facts per category in `Category.card_facts`, worded in `lib/facts.ts`, skipping what the title says; narrow cards keep condition + 1 | eBay item tile; Baymard category attributes. Spec §5.1 items 2/3 change. ConditionChip stays for the listing page and filters |
| 6 Oct | Card photos (decided C1) | Step through up to 4 photos on grid and list cards: hover arrows and dots on desktop, swipe on phones (Motion drag), spring slide, "2/6" counter; tap still opens the listing; only photo 1 loads up front | eBay/Etsy. Arrows are pointer-only (not in tab order): keyboard users get every photo in the listing gallery (blueprint X3 noted) |
| 6 Oct | Home (S0.10) | Search and the location bar sit at the top until the Phase 1 header exists; the h1 is visually hidden ("WorldStreet Marketplace: buy and sell near you", F11) because hero slides rotate | B1 step 1 puts search first; a rotating headline can't be the page's h1 |
| 6 Oct | HeroCarousel | 3 slides (PLAN C6), APG carousel: rotation control first, "2 / 3" counter, slides labelled "2 of 3", aria-live off while rotating; rotation holds while the pointer or focus is inside and stops for good once the buyer changes slide; never starts under reduced motion; Previous/Next on phones too; CTAs are ghost; every slide's copy sits invisibly in the same cell so the hero never changes height | Spec §4 says mobile is "swipe, counter", but WCAG 2.5.7 needs a single-pointer alternative to dragging. Ghost CTAs: Search is the view's one solid gold button (spec §1.1). The invisible copies keep rotation from shifting the page (CLS) |
| 6 Oct | Home rails | Each listing goes to its most specific rail first (price drop → Deals, then nearest → Near you, then newest → Just listed), shown in B1 order; rails follow `?radius=`; with nothing nearby one "From sellers across Nigeria" rail replaces Near you; B1's "All listings" is a "Just listed" rail plus "Browse all N listings near Lagos" (N = the /search count) | R-013 dedupe without starving Deals; F6 never passes far items off as near; a long grid of full cards would make the phone page very long |
| 6 Oct | Deals rail | "Deals near Lagos" with eyebrow "Price drops", no countdown | Listings have no deal end time, so "Deals ending soon" (B1) would be a false claim |
| 6 Oct | CategoryTiles | Icon tiles (the category's Atlas glyph) with "5 nearby" or "2 nationwide"; the number is the one the tile's search shows, radius included; two scrolling rows on phones | Spec §4 asks for image tiles; Atlas is the only image source we use. R-016 |
| 6 Oct | Trust copy | Strip and hero copy in `lib/copy/trust.ts`, escrow sentences in `escrow.ts`, numbers from config (₦20,000 tracking, 72-hour inspection, 7-day was-price); strip says "We hold your payment while you check the item, then pay the seller", not "until you confirm" | L11.4: the short claim mustn't hide that the inspection window can release the money; L14 test 8 |
| 6 Oct | Placeholder routes (F5) | `/categories`, `/saved`, `/notifications`, `/inbox`, `/offers`, `/account`, `/cart`, `/checkout`, `/orders`, `/sell/start`, `/sell/new`, `/vendor`, `/seller/:handle`, `/help/*` say what they'll do and "Coming in Phase N of the build", noindex; unknown help topics, sellers and paths get a real 404 page | No dead links before the shell (Phase 1) points at them; a fake help page for any slug would hide broken links |
| 6 Oct | App icon and manifest (F16) | The Atlas ShopBag glyph on the gold tile (`npm run app-icons`, rasterised with sharp, which Next installs); favicon, SVG icon, Apple icon, 192/512 and maskable icons; manifest dark, standalone, en-NG | Replaces the create-next-app favicon. Atlas is the only icon source (your rule), so the brand mark uses it too. **Swap in a real WorldStreet logo when there is one** |
| 6 Oct | F17 (sticky chrome) | Bottom padding for the nav and the collapsing category rail move to Phase 1 | Neither the bottom nav nor the category rail exists yet; padding for a missing nav would be empty space |
| 6 Oct | AppHeader (Phase 1) | One search box in the header at every width: phones put it on its own row under the menu, logo and cart (eBay mobile web) instead of a search icon; the header is sticky with a negative top so the utility row (desktop) or logo row (phones) scrolls away without a layout jump; utility links move into a native `<dialog>` drawer below 1200 | Spec §3.1 says a search icon opens an overlay on phones; a visible field is one tap shorter and the overlay comes from focusing it (P1c). Toggling heights on scroll would shift the page |
| 6 Oct | Shell gaps | No ship-to chip in the utility row (the inline LocationBar does that job on the pages that use location); no cart count or mini-cart until the cart exists (Phase 5); no WalletBalanceChip or HelpBubble yet; links to Finance, Academy, Xstream and Vivid AI wait for their addresses; no CookieConsent while the site sets no non-essential cookies | F5: no badge or control without a working panel; a consent banner for cookies we don't set would mislead |
| 6 Oct | NotificationBell | The badge is the number of unread items in its own panel (one list, so they can't disagree); the list stays empty until offers, messages and orders exist | Part H guardrail, audit F5 |
| 6 Oct | Footer | Four columns on desktop, an exclusive accordion on phones (`<details name>`, no script; desktop opens all via `::details-content`), Atlas arrow for the toggle | Spec §3.3 |
| 6 Oct | Bottom nav (F17) | Five tabs, Sell raised in gold; hides on scroll down; body padding equals its height plus the safe area on phones | Spec §3.2 |
| 6 Oct | --cx-sticky-offset | Set on `<body>` by the header | The brand block declares it on `<body>`, which shadowed a value set on `<html>` (caught by e2e) |
| 6 Oct | Category navigation (Phase 1) | Desktop "Shop by category" opens a popover under the header: categories on the left, the hovered or focused one's four newest listings on the right with "See all"; phones list the categories in the menu drawer; the rail (All, every category, Saved) sits in the page under the sticky header, so it scrolls away (F17) | There's one level of categories in the data, so no subcategory column or drill-down yet. A rail inside the sticky header would make the chrome taller, the F17 problem |
| 6 Oct | Menu drawer | The menu button uses invoker commands (`commandfor`/`command="show-modal"`), so the drawer opens before scripts load | The Android 360 e2e profile tapped Menu before hydration and nothing happened; the same would happen on a slow phone |
| 6 Oct | Mock photos | Four views per category (`{cat}-1..4.svg`) | So stepping shows different images |
| 6 Oct | Tooling | `PW_CHROMIUM_PATH` lets story tests use a preinstalled Chromium; Testing Library cleanup is explicit in `vitest.setup.ts` | Cloud containers ship a different Chromium build; auto-cleanup needs Vitest globals, which are off |

## Master checklist (266 items, spec Part X)

## A. Shell
- [x] AppHeader (W two-row, M single-row)
- [x] UtilityBar (W)
- [x] ShipToSelector (W popover, M sheet)
- [x] LocationBar inline
- [x] CategoryMenuButton + MegaMenu (W)
- [x] Category drill-down drawer (M)
- [x] CategoryRail
- [ ] GlobalSearchBox with scope select + camera (Sprint 0 box with recents/trending done; scope, camera and live suggestions in Phase 1)
- [ ] SearchSuggestPanel
- [ ] Mobile search overlay
- [ ] ImageSearchButton
- [x] NotificationBell + Panel (W) / page (M) (panel and count; the page is still a placeholder)
- [ ] CartButton + MiniCart
- [x] AccountMenu (W) / Account tab (M) (mock session; Account tab opens the placeholder)
- [ ] WalletBalanceChip
- [x] SellButton
- [x] BottomNav 5 tabs (M)
- [ ] HelpBubble
- [x] SkipLinks
- [x] SiteFooter (accordion M)
- [ ] CookieConsent
- [ ] AppInstallBanner
- [ ] SystemBanner

## B. Home
- [x] HeroCarousel w/ pause + counter
- [ ] PromoCouponCard
- [x] TrustStrip
- [x] CategoryTiles
- [x] ProductRail
- [ ] DealsRail (rail with was/now prices done; countdowns wait for timed deals)
- [ ] TrendingTabs
- [ ] RecentlyViewedRail
- [ ] BecauseYouSavedRail
- [x] NearYouRail
- [ ] EditorialTile
- [ ] SponsoredSellerBanner
- [ ] SignInNudge
- [x] SellCTABlock
- [ ] FeaturedBeamCard

## C. Cards & atoms
- [ ] ListingCard: grid, list, rail, compact, sponsored, deal, auction, vehicle, property, service, skeleton, unavailable (grid, list, rail, compact, skeleton done; the rest arrive with their categories and phases)
- [x] ConditionChip
- [x] FormatChip
- [x] DiscountChip
- [ ] UrgencyBadge
- [ ] SponsoredLabel
- [x] VerifiedTick
- [x] TopRatedBadge (link waits for S0.10 routes)
- [ ] RatingStars (read + input): read done; input with ReviewForm (Phase 6)
- [x] PriceBlock (card/detail/cart/sticky)
- [x] DeliveryLine (+ Total to city)
- [x] LocationLine
- [x] SocialProof
- [x] SellerMini
- [x] SaveButton
- [ ] PhotoCount
- [ ] QuickAddButton
- [ ] FindSimilarButton
- [ ] Card overflow menu (Hide/Report): Not interested + Hide seller with Undo done; Report and Find similar join when their pages exist

## D. Search & filters
- [x] ResultsHeader
- [ ] SaveSearchButton
- [x] SortMenu
- [ ] ViewToggle
- [ ] FilterRail (W)
- [ ] FilterSheet (M)
- [ ] FilterGroup
- [ ] FacetCheckbox (counts)
- [ ] CategoryTree
- [ ] PriceRangeFilter
- [ ] ConditionFilter
- [ ] FormatFilter
- [ ] LocationRadiusFilter (radius logic + selector done in S0.8; the filter-rail control is Phase 2)
- [ ] DeliveryFilter
- [ ] SellerFilter
- [ ] ColorSwatchFilter
- [ ] SizeFilter
- [ ] BrandFilter
- [x] ActiveFilterChips (category and price; more filters in Phase 2)
- [ ] PopularFilterChips
- [ ] RelatedSearches
- [ ] IncludeDescriptionToggle
- [ ] SpellCorrection
- [x] ZeroResults
- [ ] ResultsGrid/List (grid done with 'Show more' paging; list toggle in Phase 2)
- [ ] ResultsPagination
- [ ] InfiniteLoader
- [ ] CompareTray

## E. Detail
- [ ] ListingPageLayout
- [ ] ListingBreadcrumb
- [ ] Gallery
- [ ] GalleryLightbox
- [ ] VideoPlayer
- [ ] ListingTitleBlock
- [ ] SellerStrip
- [ ] BuyBox
- [ ] VariationSelector
- [ ] QuantityStepper
- [ ] ActionStack
- [ ] StickyBuyBar (M)
- [ ] DemandLine
- [ ] ReassuranceLine
- [ ] DeliveryPanel
- [ ] ReturnsPanel
- [ ] PaymentsPanel
- [ ] ProtectionPanel
- [ ] ConditionInfo
- [ ] ItemSpecifics
- [ ] SellerNotes
- [ ] DescriptionBlock
- [ ] RevisionHistory
- [ ] ListingMeta
- [ ] SellerCard
- [ ] SellerRatingsBreakdown
- [ ] ReviewsSection (+ filters, cards, photos)
- [ ] QAThread
- [ ] SimilarItemsRail
- [ ] SellerOtherItemsRail
- [ ] CategoryBestSellers
- [ ] ShareSheet
- [ ] ReportListingModal
- [ ] SafetyTipsCard
- [ ] LocalPickupMap
- [ ] UnavailableState
- [ ] PriceHistorySparkline

## F. Offers & bids
- [ ] OfferModal/Sheet
- [ ] OfferSummaryCard
- [ ] OffersList (buyer/seller)
- [ ] CounterOfferCard
- [ ] OfferActionBar
- [ ] AutoOfferSettings
- [ ] OfferThreadItem
- [ ] BidPanel
- [ ] MaxBidExplainer
- [ ] CountdownTimer
- [ ] BidHistory
- [ ] OutbidToast

## G. Cart & checkout
- [ ] CartPage
- [ ] CartSellerGroup
- [ ] CartLineItem
- [ ] SaveForLaterList
- [ ] CartPriceChangeBanner
- [ ] CouponField
- [ ] OrderSummary
- [ ] EmptyCart
- [ ] CartRecommendations
- [ ] MiniCart
- [ ] CheckoutLayout
- [ ] CheckoutSection
- [ ] CheckoutSteps
- [ ] AddressSelector
- [ ] AddressForm
- [ ] AddressAutocomplete
- [ ] PhoneInput
- [ ] DeliverySelector
- [ ] PickupStationPicker
- [ ] PaymentMethodPicker
- [ ] CardForm (hosted fields)
- [ ] BankTransferPanel
- [ ] UssdPanel
- [ ] WalletBalanceToggle
- [ ] EscrowNotice
- [ ] PayButton
- [ ] InventoryLockTimer
- [ ] PaymentStatusPoller
- [ ] PaymentErrorPanel
- [ ] OrderConfirmation
- [ ] KycGateSheet

## H. Orders & trust
- [ ] OrdersPage
- [ ] OrderRow
- [ ] OrderDetail
- [ ] OrderStatusTimeline
- [ ] MoneyTimeline
- [ ] EscrowStatusCard
- [ ] InspectionCountdown
- [ ] ConfirmReleaseSheet
- [ ] DeliveryCard (PIN/QR)
- [ ] TrackingMap
- [ ] ReceiptView
- [ ] ReviewForm
- [ ] ReportProblemWizard
- [ ] EvidenceUploader
- [ ] DisputeTimeline
- [ ] RefundTracker
- [ ] ReturnInstructionsCard
- [ ] BuyAgainButton
- [ ] OrderIssueBanner

## I. Messaging
- [ ] InboxLayout
- [ ] ThreadList/Row
- [ ] ThreadHeader
- [ ] PinnedListingCard
- [ ] MessageBubble
- [ ] MessageInput
- [ ] QuickReplies
- [ ] OfferMessageCard
- [ ] OrderEventMessage
- [ ] SafetyBanner
- [ ] ContentWarning
- [ ] AttachmentPreview
- [ ] BlockReportMenu
- [ ] AwayModeBanner
- [ ] TypingIndicator

## J. Account & content
- [ ] SignInSheet/AuthModal
- [ ] AccountHome
- [ ] ProfileForm
- [ ] AddressBook
- [ ] PaymentMethodsList
- [ ] KycStepper
- [ ] LevelBadge
- [ ] VerifiedBadge
- [ ] NewSellerBadge
- [ ] SellerPublicProfile + SellerProfileHeader
- [ ] SellerStats
- [ ] SavedPage + SavedSearchRow
- [ ] NotificationCentre
- [ ] NotificationPreferences
- [ ] HelpCentreHome
- [ ] EscrowExplainerPage
- [ ] PolicyPage template
- [ ] ErrorPages (404, 410, 500, offline)

## K. Seller
- [ ] SellerShell
- [ ] SellerOnboarding
- [ ] PayoutAccountForm
- [ ] CreateListingWizard
- [ ] PhotoUploader
- [ ] CategoryPicker
- [ ] ItemSpecificsForm
- [ ] TitleInput
- [ ] RichTextEditor
- [ ] FormatPicker
- [ ] PriceGuidancePanel
- [ ] FeePreview
- [ ] DeliveryProfileEditor
- [ ] ReturnPolicyPicker
- [ ] ListingLivePreview
- [ ] PublishChecklist
- [ ] ListingsTable
- [ ] BulkActionBar
- [ ] InlineEditCell
- [ ] SellerOrdersTable
- [ ] DispatchSheet
- [ ] PackingSlipView
- [ ] SellerOffersInbox
- [ ] PayoutsPage (BalanceBreakdown, LedgerTable)
- [ ] WithdrawFlow
- [ ] PerformanceDashboard
- [ ] StandardsMeter
- [ ] PromotionWizard
- [ ] AnalyticsDashboard
- [ ] BulkImport

## L. Admin
- [ ] AdminShell
- [ ] ModerationQueue
- [ ] ListingReviewPanel
- [ ] CaseView
- [ ] LedgerViewer
- [ ] UserLookup
- [ ] RiskRulesTable
- [ ] AuditLogTable
- [ ] SupportConsole

## M. Cross-cutting
- [x] Density system (comfortable/compact)
- [x] Manrope + gold token migration
- [x] ~~`--ws-*` ↔ `--cx-*` alias layer~~ (not needed, see Deviations)
- [ ] Missing icons (17.2)
- [ ] Hooks (17.4)
- [ ] State matrix coverage
- [ ] A11y checks
- [ ] Performance budgets
- [ ] Analytics events
- [ ] Copy string table (one source for escrow, delivery, return claims)
