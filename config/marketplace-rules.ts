/**
 * Every rule number in the marketplace lives here. Values come from the docs
 * (docs/marketplace/worldstreet-ux-flows.md, worldstreet-ebay-component-spec.md) and
 * are proposed defaults until the owner of each decision (flows Part K) signs off.
 *
 * Money is integer kobo (₦1 = 100 kobo). Durations are in the unit named by the key.
 */

const NAIRA = 100;

export const rules = {
  money: {
    currency: "NGN", // R-002, EC-028: one currency, no mixed lists
    minorPerMajor: NAIRA,
  },
  location: {
    radiiKm: [5, 10, 25] as const, // R-001; "nationwide" is null
    defaultRadiusKm: 25,
  },
  search: {
    debounceMs: 150, // B2
    minChars: 2, // B2
    pageSize: 24, // §16.7
    maxSuggestions: 10, // spec §6 search box
    recentShown: 5, // Baymard/NN/g: a short list scans; research 6 Oct
    trendingShown: 5,
    recentStored: 8,
    maxSuggestionsPhone: 6, // the Phase 1 full-screen phone search
  },
  home: {
    maxHeroSlides: 3, // R-015 (stricter than spec §4, PLAN C6)
    minRailItems: 4, // R-014
  },
  card: {
    maxFacts: 3, // subtitle line facts after the condition (Baymard: show category attributes)
    maxFactsNarrow: 1, // under 240px
    photosMax: 4, // photos a buyer can step through from a card (eBay steps up to 4)
  },
  hidden: {
    maxListings: 200, // "Not interested"; oldest drop off first (kept in a cookie for the server)
    maxSellers: 50, // "Hide seller"
  },
  saved: {
    maxListings: 500, // R-027
    maxSearches: 50, // R-027
    retainSoldDays: 30, // R-026, §6.6
  },
  offers: {
    validityHours: 48, // §6.6
    payWindowHours: 24, // R-034, §6.6
    floorPercent: 50, // B6 step 2: offers ≥ 50% of list price
    perListing: 3, // R-030 (expired offers still count, B6)
    maxOpen: 5, // R-030
  },
  cart: {
    maxItems: 50, // R-039
    maxSellers: 10, // R-039
  },
  checkout: {
    lockMinutes: 10, // R-041
    bankTransferMinutes: 30, // B9, §6.6
    pollSeconds: 60, // B9
  },
  delivery: {
    typicalHandlingDays: 1, // research 6 Oct: lower end of the delivery-time range on cards
  },
  trust: {
    newSellerFeedbackCount: 10, // spec §440: "New seller" under this many ratings; best match weights feedback fully from here
  },
  media: {
    thumbQuality: 60, // rail and compact thumbnails only (research 6 Oct; 45 judged too lossy)
    highPriorityCards: 2, // fetchpriority="high" on the first N result photos (LCP)
    eagerCards: 4, // loading="eager" on the first N; the rest are lazy
  },
  three: {
    // 3D (home hero, listing viewer) only where it won't hurt: many buyers are on
    // budget Android phones and metered data (spec §16.7). Below these, the static
    // fallback shows instead.
    minDeviceMemoryGb: 4, // navigator.deviceMemory; unknown counts as enough
    minCores: 4, // navigator.hardwareConcurrency
    maxPixelRatio: 1.75, // render-size cap; sharper isn't worth the fill rate
    maxFps: 60,
  },
  orders: {
    sellerConfirmHours: 12, // §6.6
    handlingDays: 2, // R-061
    deliveryReattempts: 2, // R-064
  },
  escrow: {
    // L4: hours after Delivered; null = no auto-release (manual / milestone)
    inspectionHours: {
      default: 48,
      fashion: 48,
      home: 48,
      electronics: 72,
      phones: 72,
      appliances: 72,
      furniture: 72,
      vehicles: null,
      property: null,
      services: null,
      meetUp: 24,
    },
    extensionHours: 24, // L4
    remindersBeforeHours: [24, 2] as const, // R-211 (plus one at delivery)
    // L4 risk-tiered payout delay after release
    payoutDelay: {
      new: { delayHours: 48, reservePercent: 10, reserveDays: 14, firstOrders: 10 },
      standard: { delayHours: 24, reservePercent: 0, reserveDays: 0 },
      trusted: { delayHours: 0, reservePercent: 0, reserveDays: 0 },
    },
    highValueMinor: 500_000 * NAIRA, // L4: above this, +24 h and KYC L2+
    highValueExtraHours: 24,
    missingProofCaseHours: 72, // R-210
  },
  protection: {
    anyIssueDays: 14, // L7
    counterfeitSafetyDays: 45, // L7, R-242
    fundCapMinor: null as number | null, // L15: business decision, not shown as a number
  },
  disputes: {
    sellerResponseHours: 48, // §6.6
    opsSlaBusinessDays: 3, // §6.6
    appealDays: 7, // R-082
    returnShipDays: 5, // §6.6
  },
  reviews: {
    editDays: 7, // R-071
  },
  seller: {
    titleMax: 80, // S2 step 3
    descriptionMax: 5_000, // S2 step 3
    photosMax: 12, // S2 step 1
    photoMinPx: 600, // R-114
    photoMaxMb: 10, // R-114
    durationDays: 30, // R-115
    priceWarnAbovePercent: 30, // S2 step 4: more than 30% above the comparable median
    priceWarnBelowPercentOfMedian: 40, // EC-027: price under 40% of the comparable median
  },
  fees: {
    finalValuePercent: 5, // S2 step 7, K4
    paymentPercent: 1.5, // S2 step 7, K4
    minWithdrawalMinor: 1_000 * NAIRA, // S6
  },
  limits: {
    l1CapMinor: 200_000 * NAIRA, // K3 placeholder
    l2CapMinor: 5_000_000 * NAIRA, // K3 placeholder
  },
  messaging: {
    maxChars: 1_000, // B5 step 2
    maxPhotos: 3, // B5 step 2
    newThreadsPerDay: 20, // R-053 (L1 buyers)
  },
  demand: {
    watchersThreshold: 10, // R-025, PLAN C7
  },
  tracking: {
    requiredAboveMinor: 20_000 * NAIRA, // R-141
  },
  notifications: {
    quietHours: { start: "22:00", end: "07:00" }, // Part D
  },
  flags: {
    autoDecideDisputes: false, // PLAN F1
    payOnDelivery: false, // K5
    auctions: false, // Phase 9
  },
} as const;

export type MarketplaceRules = typeof rules;
