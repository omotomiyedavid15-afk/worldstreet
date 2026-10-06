# WorldStreet Marketplace — Progress

Plan: [PLAN.md](PLAN.md). Each phase ends with a report below. Items are ticked in the master
checklist (component spec, Part X) when they meet the spec row, have stories and a test, and
pass `npm run check`.

## Phase reports

_Phase 0 in progress on `phase/0-foundations`._

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
| 6 Oct | Tooling | Local browser tests drive installed Chrome | Playwright has no Chromium build for macOS 13; CI uses bundled Chromium |

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
- [ ] ListingCard: grid, list, rail, compact, sponsored, deal, auction, vehicle, property, service, skeleton, unavailable
- [ ] ConditionChip
- [ ] FormatChip
- [ ] DiscountChip
- [ ] UrgencyBadge
- [ ] SponsoredLabel
- [ ] VerifiedTick
- [ ] TopRatedBadge
- [ ] RatingStars (read + input)
- [ ] PriceBlock (card/detail/cart/sticky)
- [ ] DeliveryLine (+ Total to city)
- [ ] LocationLine
- [ ] SocialProof
- [ ] SellerMini
- [ ] SaveButton
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
