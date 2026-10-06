# WorldStreet Marketplace — Progress

Plan: [PLAN.md](PLAN.md). Each phase ends with a report below. Items are ticked in the master
checklist (component spec, Part X) when they meet the spec row, have stories and a test, and
pass `npm run check`.

## Phase reports

_Phase 0 in progress on `phase/0-foundations`: S0.0–S0.5 done; S0.6 (ListingCard) in progress: grid and skeleton done, list/rail/compact next. Components mirror eBay, styled with the DS (your direction, 6 Oct)._

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
| 6 Oct | Tooling | `PW_CHROMIUM_PATH` lets story tests use a preinstalled Chromium; Testing Library cleanup is explicit in `vitest.setup.ts` | Cloud containers ship a different Chromium build; auto-cleanup needs Vitest globals, which are off |

## Master checklist (266 items, spec Part X)

## A. Shell
- [ ] AppHeader (W two-row, M single-row)
- [ ] UtilityBar (W)
- [ ] ShipToSelector (W popover, M sheet)
- [ ] LocationBar inline
- [ ] CategoryMenuButton + MegaMenu (W)
- [ ] Category drill-down drawer (M)
- [ ] CategoryRail
- [ ] GlobalSearchBox with scope select + camera
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
- [ ] ListingCard: grid, list, rail, compact, sponsored, deal, auction, vehicle, property, service, skeleton, unavailable (grid + skeleton done)
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
- [ ] Card overflow menu (Hide/Report)

## D. Search & filters
- [ ] ResultsHeader
- [ ] SaveSearchButton
- [ ] SortMenu
- [ ] ViewToggle
- [ ] FilterRail (W)
- [ ] FilterSheet (M)
- [ ] FilterGroup
- [ ] FacetCheckbox (counts)
- [ ] CategoryTree
- [ ] PriceRangeFilter
- [ ] ConditionFilter
- [ ] FormatFilter
- [ ] LocationRadiusFilter
- [ ] DeliveryFilter
- [ ] SellerFilter
- [ ] ColorSwatchFilter
- [ ] SizeFilter
- [ ] BrandFilter
- [ ] ActiveFilterChips
- [ ] PopularFilterChips
- [ ] RelatedSearches
- [ ] IncludeDescriptionToggle
- [ ] SpellCorrection
- [ ] ZeroResults
- [ ] ResultsGrid/List
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
