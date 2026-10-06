# WorldStreet Marketplace — Progress

Plan: [PLAN.md](PLAN.md). Each phase ends with a report below. Items are ticked in the master
checklist (component spec, Part X) when they meet the spec row, have stories and a test, and
pass `npm run check`.

## Phase reports

_Phase 0 in progress on `phase/0-foundations`: S0.0–S0.9 done; next S0.10 (home, placeholder routes, a11y pass). Building in dark mode (your direction, 6 Oct). Sprint 0 checks #1–#4 pass end to end (e2e/search.spec.ts, 375 and 1280). Components mirror eBay, styled with the DS (your direction, 6 Oct)._

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
| 6 Oct | Tooling | `PW_CHROMIUM_PATH` lets story tests use a preinstalled Chromium; Testing Library cleanup is explicit in `vitest.setup.ts` | Cloud containers ship a different Chromium build; auto-cleanup needs Vitest globals, which are off |

## Master checklist (266 items, spec Part X)

## A. Shell
- [ ] AppHeader (W two-row, M single-row)
- [ ] UtilityBar (W)
- [x] ShipToSelector (W popover, M sheet)
- [x] LocationBar inline
- [ ] CategoryMenuButton + MegaMenu (W)
- [ ] Category drill-down drawer (M)
- [ ] CategoryRail
- [ ] GlobalSearchBox with scope select + camera (Sprint 0 box with recents/trending done; scope, camera and live suggestions in Phase 1)
- [ ] SearchSuggestPanel
- [ ] Mobile search overlay
- [ ] ImageSearchButton
- [ ] NotificationBell + Panel (W) / page (M)
- [ ] CartButton + MiniCart
- [ ] AccountMenu (W) / Account tab (M)
- [ ] WalletBalanceChip
- [ ] SellButton
- [ ] BottomNav 5 tabs (M)
- [ ] HelpBubble
- [ ] SkipLinks
- [ ] SiteFooter (accordion M)
- [ ] CookieConsent
- [ ] AppInstallBanner
- [ ] SystemBanner

## B. Home
- [ ] HeroCarousel w/ pause + counter
- [ ] PromoCouponCard
- [ ] TrustStrip
- [ ] CategoryTiles
- [ ] ProductRail
- [ ] DealsRail
- [ ] TrendingTabs
- [ ] RecentlyViewedRail
- [ ] BecauseYouSavedRail
- [ ] NearYouRail
- [ ] EditorialTile
- [ ] SponsoredSellerBanner
- [ ] SignInNudge
- [ ] SellCTABlock
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
