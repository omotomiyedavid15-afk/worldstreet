# UI research: best practices and plan (6 Oct 2026)

Web research (Baymard, NN/g, eBay Skin/Playbook, Material, Apple HIG, web.dev and Nigerian market sources) on the Sprint 0 UI, excluding accessibility research by request. 79 findings → 55 distinct gaps → 52 survived a skeptic check of sources and code. Items 1–37 under "Do now" are implemented except those gated on a decision (1 C1, 10 C1, 11 C2, 13's object-fit C4) and Lighthouse CI (deferred, see PROGRESS). Decisions still open are in section 3.


This plan covers 50 verified gaps. Where a gap has a revised recommendation, this plan uses the revision. Items about accessibility are left out. Where a fix used to include accessibility-only parts (focus moves, extra live regions, keyboard parity), those parts have been removed. The existing AA rules still apply as limits: 4.5:1 text, 44px targets, aria-pressed, one h1.

Several fixes add numbers. Those go in `config/marketplace-rules.ts`. Every change that departs from eBay, the DS or a logged decision needs a row in the deviations table of `docs/marketplace/PROGRESS.md`.

---

## 1. Do now

These are ordered by impact, then effort. "Gated (C#)" means the item waits for the owner's answer in section 3.

### High impact

**1. Show free local pickup on the card, and give it its own icon (High / S)**
- In `lib/delivery.ts`, add `pickup: boolean` to the `free` and `paid` summaries. It is true when a `meet_up` option exists and `sameCity !== false`.
- In `features/listing-card/atoms/MetaLines.tsx`, `DeliveryLine` renders a second meta row, "Free local pickup", with `HandshakeAgreementDealIcon`.
  - On cards under 240px wide, show it inline as "· or free pickup". The rail variant may drop it.
- "Pickup only" also changes from `LocationIcon` to `HandshakeAgreementDealIcon`. This removes the two identical pins stacked on the Infinix card.
- Tests in `atoms.test.tsx`:
  - rider plus meet-up
  - meet-up only
  - courier plus meet-up in a different city: no pickup line
- Add "Free local pickup" to spec §5.1 item 6.
- Why: eBay shows "Free local pickup" in search results, and our flows already list it (ux-flows :156/:196, R-036). Today a buyer 1 km away sees only "+₦2,500 delivery". Source: https://www.ebay.com.au/help/buying/shipping-delivery/changing-delivery-address-method/local-pickup?id=4056

**2. Suggestions bold the part the user didn't type, and match the way results do (High / S)**
- In `features/search/GlobalSearchBox.tsx`, change `fits()` to word-prefix matching, the same as `lib/search/query.ts`:
  - Use the same normalisation as the results matcher.
  - Escape the typed text before building a regex, or use split words with `startsWith`.
  - One-letter queries match whole words only.
- Add a new `features/search/SuggestionText.tsx` that uses reverse highlighting:
  - Text before and after the match goes in `<b class="ws-suggest__more">` (700, `--cx-text`).
  - The matched span goes in `.ws-suggest__typed` (400, `--cx-text-2`).
  - An empty query renders the term at normal weight.
- Stories:
  - Typing "ge" gives `<b>nerator</b>`.
  - A match in a later word highlights the text both before and after it.
  - Typing "c++" does not throw.
- Why: this is Baymard autocomplete pattern #3 and an NN/g guideline, and eBay bolds the completion. Sources: https://baymard.com/blog/autocomplete-design, https://www.nngroup.com/articles/site-search-suggestions/, https://github.com/algolia/autocomplete/blob/next/packages/autocomplete-plugin-recent-searches/src/getTemplates.tsx

**3. Dark-mode popovers sit on a lighter surface (High / S)**
- In `styles/marketplace.css`, dark worldstreet block only, set `--cx-elevated: #292524` (stone-800).
- Menus, toasts, tooltips, the suggest panel, the ShipTo sheet, the save circle and the photo pill all step up together.
- Do not fill `.ws-card`. eBay tiles are flat on the page, and the card is translucent by design.
- Afterwards:
  - Re-run Foundations › Colors.
  - Check that hover rows using `--cx-surface-2` and `--cx-surface-3` still show.
  - Log a deviation, and flag it for upstream.
- Why: shadows don't show on dark, and overlays are 1.13:1 against the page today. Material, Apple and eBay all make raised surfaces lighter. Sources: https://raw.githubusercontent.com/material-components/material-components-android/master/docs/theming/Dark.md, https://raw.githubusercontent.com/material-components/material-components-android/master/lib/java/com/google/android/material/elevation/ElevationOverlayProvider.java, https://developer.apple.com/design/human-interface-guidelines/dark-mode, https://registry.npmjs.org/@ebay/skin/-/skin-19.37.0.tgz (evo-dark.css)

**4. Image loading: drop the deprecated `priority`, add AVIF (High / S)**
- In `features/listing-card/ListingCard.tsx`, replace `priority` with `loading` and `fetchPriority` props. Update `app/(shop)/search/page.tsx:113` and `ListingCard.stories.tsx` to match.
  - Cards 1–2 get `fetchPriority="high"` and eager loading.
  - Cards 3–4 get eager loading only.
  - The rest stay lazy.
- In `next.config.ts`, set `images: { formats: ['image/avif','image/webp'], qualities: [60, 75] }`.
  - Use 60 only for compact and rail thumbnails.
- New `rules.media`: `{ thumbQuality: 60, highPriorityCards: 2, eagerCards: 4 }`.
- In `SIZES`, change the phone value to `calc(50vw - 22px)`.
- Defer Save-Data.
- Why: Next 16 deprecates `priority`, and four preloads compete on phones. AVIF is about 20% smaller, and data cost per GB has doubled. Sources: https://raw.githubusercontent.com/GoogleChrome/web.dev/main/src/site/content/en/blog/lcp-lazy-loading/index.md, https://nextjs.org/docs/app/api-reference/components/image (local copy), https://techcabal.com/2026/02/09/how-nigerians-spent-%E2%82%A620-87billion-daily-on-data-in-2025/

**5. Mark the IP-guessed location as a guess on phones too (High / S)**
- In `styles/marketplace/listing.css`, delete the rule that hides `.ws-locbar__hint` below 480px, and let the hint wrap.
- In `features/location/LocationBar.tsx`, when the area is inferred, add a second line: "Based on your connection. Not right?".
  - Colour: `--cx-text-secondary`.
  - The existing Change button stays as the action.
- Radius filtering, distances and the total stay as they are. See C10.
- Why: on mobile, IP location is a median 179–207 km off, and in Africa 66–72% of guesses are more than 100 km off. Sources: https://arxiv.org/pdf/2605.21937, https://ipregistry.co/blog/mobile-ip-geolocation-cgnat

**6. Delivery line: say how long delivery takes, and drop the total that repeats the price (High / M)**
- In `MetaLines.tsx`, show "Total to {city}" only when `buyerTotal(...) !== price_minor`.
  - This removes one line from every free-delivery card.
  - Gated (C6) only for the deviation note.
- Add `deliveryEstimate(option)` to `lib/delivery.ts`:
  - `min = eta[0] + rules.delivery.typicalHandlingDays` (new, 1)
  - `max = eta[1] + rules.orders.handlingDays`
- Use eBay's wording on the existing line: "Free delivery in 2–4 days", "+₦2,500 delivery in 1–2 days", "Delivery in 1 day".
  - Add a `formatDayRange()` helper in `lib/format.ts`.
- No "Get it by" dates on cards yet.
- Under 240px wide, show "· 2–4 days". If the 375px card grows past about 410px, hide it.
- Pickup and meet-up lines don't change.
- Tests: mock ETA sets [1,2], [3,5] and [2,4], plus the case where min equals max.
- Why: eBay tiles show delivery time, and spec "eBay patterns" #3 asks for it. Sources: https://www.ebay.com/shop/track-tile, https://baymard.com/blog/shipping-speed-vs-delivery-date, https://www.emarketer.com/content/extra-costs-are-the-top-reason-consumers-abandon-online-carts

**7. Taps get instant feedback, and network failures show a retry (High / M)**
- Same-route changes (sort, chips, Clear all, widen radius, Remove filter, Show more):
  - Use a pending signal (`useLinkStatus` in each Link, or `startTransition` + `router.push`).
  - While pending, dim the results.
  - After about 300ms, fade in a `ListingCardSkeleton` grid.
  - Show more appends skeleton cards instead.
  - The search box, location bar and h1 stay on screen.
- Location Apply: use `useFormStatus` to make the button pending.
- Add `app/(shop)/search/loading.tsx` for arrivals from other routes only. Remove it if it blanks the search box on same-route changes.
- Add `app/(shop)/listing/[slug]/loading.tsx`.
- In `styles/marketplace.css`, add a gap fix: `@media (prefers-reduced-motion: reduce){.cx-skel{animation:none}}`. Log the deviation.
- Add an `error.tsx` to both segments:
  - A DS EmptyState: "Couldn't load these results. Check your connection.", or the offline wording when offline.
  - A "Try again" button that calls `router.refresh(); reset()`.
  - A plain `<form action="/search">`.
- Why: on high-latency networks a server round trip with no feedback looks like a dead tap. Spec §16.7 and §16.8 already ask for this. Sources: https://www.nngroup.com/articles/skeleton-screens/, https://www.nngroup.com/articles/progress-indicators/, https://nextjs.org/docs/app/guides/instant-navigation, https://nextjs.org/docs/app/api-reference/file-conventions/loading

**8. One source for escrow copy, and stop over-claiming (High / S)**
- Create the escrow copy source (for example `lib/copy/escrow.ts`). It holds:
  - The short claim, including "…or the inspection window ends without a problem report".
  - The coverage note: delivery and meet-ups bought through checkout are covered; off-platform payments are not; vehicles and property have no escrow checkout.
- Change "Every deal protected by escrow" in `app/page.tsx` (and in the metadata, if users see it) to a string from the table.
- Add the claim under DeliveryLine on the listing stub, as the start of the Phase 3 ProtectionPanel.
- No badges on goods cards.
- The line on the search page is C8.
- Why: our own rules K6/K7 exclude vehicles and property, so the current claim is false for them. Sources: https://techcabal.com/2026/06/30/why-nigerians-keep-getting-scammed-buying-online-and-how-escrow-fixes-it/, https://alejandrorioja.com/facebook-marketplace/, https://android.com.pl/tech/572151-olx-zwroty-pakiet-ochronny/

**9. Link previews that work in WhatsApp (High / M)**
- In `app/layout.tsx`, add `metadataBase` and a default `openGraph` (`siteName`, `locale: 'en_NG'`).
- In `app/(shop)/listing/[slug]/page.tsx`, `generateMetadata` returns:
  - a canonical URL
  - `openGraph` with description `"{formatCurrency} · {condition} · {area}, {city}"`
  - `twitter: summary_large_image`
  - noindex for unknown listings
- Add `opengraph-image.tsx` (an ImageResponse PNG, 1200×630) with the photo, the gold price and the area.
- Never include phone numbers or exact addresses.
- Why: this is blueprint F16 (S3). SVG mocks don't render as previews. Sources: blueprint F16 / :378, https://www.visa.com.ng/about-visa/newsroom/press-releases/prl-11062026.html (the statistics are unverified, so don't quote them)

**10. Step through photos from the results card (High / M; cheap first step S). Gated (C1)**
- Cheap step:
  - On desktop hover only, mount `media[1]` on `pointerenter` and swap to it.
  - The pill becomes PhotoCount "1/N" per spec §5.3.
- Full version, in a new `features/listing-card/CardPhotos.tsx`:
  - Applies to the grid card, and to the list card at 768px and wider.
  - `rules.card.photosMax = 4`.
  - Pointer devices get hover arrows (Atlas `ArrowLeft`/`ArrowRight`, 44px hit area, z-index 2) and an indicator dot row.
  - Touch devices get a scroll-snap strip, mounted on first touch, with `overscroll-behavior-x: contain`. A tap that doesn't scroll still opens the listing.
  - On touch, the position indicator is the "2/6" pill, not dots.
  - Extra slides use `alt=""` and `tabIndex=-1`.
  - `media[0]` stays the server-rendered LCP image.
- Fixtures need a different image per photo index.
- Why: Baymard says buyers need access to 3+ images, and eBay steps through up to 4 on hover. Sources: https://baymard.com/blog/secondary-hover-information, https://www.valueaddedresource.net/ebay-image-scrolling-in-search-results/, https://www.valueaddedresource.net/etsy-tests-scrolling-thumbnails-showing-all-images-in-search

**11. Condition and key facts as one subtitle line (High / M). Gated (C2)**
- The `KeyFacts` line replaces the `.ws-card__chips` row. It is not an added row.
- Format: "{condition} · {fact} · {fact}", built with `MetaList`, in `--cx-text-muted` at meta size.
- Store `cardFacts` per category in `mocks/fixtures/categories.ts` and the Category type:
  - Phones: Battery, Storage
  - Computing: RAM, Storage
  - Vehicles: Mileage, Transmission, Fuel, Year
  - Property: "2 bed · 2 bath"
  - Fashion: Size
- Drop any fact whose value already appears in the title.
- Rules: `card.maxFacts = 3`, `card.maxFactsNarrow = 1`.
- Clamp to 1 line (2 in list view), with `min-height: 1lh`.
- "For parts" and "Certified refurbished" show inline in the warning and gold text tokens.
- The compact variant uses the same text.
- Keep `ConditionChip` everywhere outside the card.
- Tests: the title dedupe and the formatters.
- Why: Baymard finds 50% of sites show too few attributes, and eBay's item tile uses a subtitle line. Sources: https://raw.githubusercontent.com/eBay/evo-web/main/packages/skin/src/sass/item-tile/stories/item-tile.stories.js, https://raw.githubusercontent.com/eBay/evo-web/main/packages/skin/src/sass/item-tile/item-tile.scss, https://baymard.com/blog/product-listing-information, https://baymard.com/guidelines/2281-category-specific-product-attributes

### Medium impact, small effort

**12. Rent prices say what period they cover**
- Add `price_period?: 'night'|'month'|'year'` to `lib/data/types.ts`. Map the mocks to it, and remove "(per year)" from the mock titles.
- `PriceBlock` takes a `period` prop and renders `<span class="ws-price__period"> per year</span>` inside `.ws-price__now`. Use a muted, regular-weight class of its own, not `.ws-price__note`.
- Pass it in every variant, including under 240px.
- Skip `DeliveryLine` for `kind==='property'`, and log it.
- Test that the price is announced as "₦1,800,000 per year" exactly once.
- Source: https://baymard.com/blog/price-per-unit

**13. Photo treatment in `listing.css`, plus a placeholder colour**
- Add `.ws-card__media::after` and `.ws-listing-stub__media::after`:
  - `--ws-photo-scrim` at 5% black, 8% in dark
  - `--ws-photo-edge` inset at 8% foreground in dark, transparent in light
- Give `.ws-card__photos` `z-index: 1`.
- Regenerate the mock SVGs on a mid-tone backdrop.
- Fit and sizes:
  - `object-fit: contain`: Gated (C4).
  - Fix `SIZES.grid` to `'(min-width:1380px) 312px, (min-width:1200px) calc(25vw - 33px), (min-width:768px) 33vw, 50vw'`.
- Placeholder:
  - Add `dominant?` and `blurDataURL?` to `ListingMedia`.
  - The mocks get their dominant colour from `gen-mock-photos.mjs`.
  - `.ws-card__media { background: var(--ws-media-bg, var(--cx-surface-2)) }`.
- Sources: https://developer.apple.com/design/human-interface-guidelines/dark-mode; eBay Skin `mixins/public/_utility.scss` `image-treatment`; https://registry.npmjs.org/@ebay/skin/-/skin-19.37.0.tgz; https://nextjs.org/docs/app/api-reference/components/image

**14. Rating stars in the text colour, so the price is the main gold element**
- Set `.ws-stars__fill { color: var(--cx-text) }`.
- Keep the track on `--cx-text-muted`.
- Check partial stars and the light theme.
- Top rated badge: C5.
- Sources: https://raw.githubusercontent.com/eBay/evo-web/main/packages/skin/src/sass/star-rating/star-rating.scss, https://baymard.com/blog/list-item-design-ecommerce

**15. Visited listing titles look different**
- Add `--ws-title-visited` (#d6d3d1 dark, #57534e light) and `.ws-card__link:visited { color: … }`.
- Keep card hrefs canonical, with no tracking params.
- Sources: https://raw.githubusercontent.com/eBay/evo-web/main/packages/skin/src/sass/item-tile/item-tile.scss, https://www.nngroup.com/articles/change-the-color-of-visited-links/

**16. Text tiers you can tell apart in dark**
- In `styles/marketplace.css`:
  `[data-brand=worldstreet]:not([data-theme=light],[data-theme=light] *){--cx-text:#f5f5f4;--cx-text-2:#d6d3d1}`
- No component changes are needed; secondary text already uses `--cx-text-2`.
- Log the deviation.
- Sources: eBay evo-dark (#f7f7f7 / #8f8f8f) at https://registry.npmjs.org/@ebay/skin/-/skin-19.37.0.tgz, https://registry.npmjs.org/@primer/primitives/-/primitives-11.10.0.tgz, https://raw.githubusercontent.com/material-components/material-components-android/master/lib/java/com/google/android/material/color/res/values/dimens.xml

**17. Hover effects only on hover devices, plus a press state**
- Wrap `.ws-card:hover .ws-card__title` in `@media (hover:hover) and (pointer:fine)`.
- In `styles/marketplace.css`, add `@media (hover:none){.cx-card--interactive:hover{transform:none}.cx-card--interactive:hover::before{opacity:var(--cx-wash-opacity)}}`.
- Press state: `.ws-card:has(.ws-card__link:active)::before { opacity: calc(var(--cx-wash-opacity)*2.5) }`.
  - An optional `scale(.98)` goes under `prefers-reduced-motion: no-preference`.
- Test on iOS and Android before adding any touchstart hack.
- Log it as a DS gap fix.
- Sources: https://css-tricks.com/solving-sticky-hover-states-with-media-hover-hover/, https://baymard.com/blog/list-items-hover-and-hit-area, https://developer.apple.com/design/human-interface-guidelines/buttons

**18. One h1 that carries the count and the query; "no results" said once**
- `ResultsHeader` h1:
  - With results: `"{plural(total,'result')} for “q”"`.
  - Zero results: `"No results for “q” near {area}"`.
  - Browse: `"{n} listings near {area}"`.
- Remove the separate count line. Keep "Showing 24 of 32".
- The ZeroResults title names the next step: "Try a wider area" / "Try removing a filter" / "Try a different word or browse a category".
- The prohibited h1 is "No results for “pistol”", with no second heading (EC-004).
- Sources: spec §6 (:242), https://www.nngroup.com/articles/search-no-results-serp/

**19. Show more: pending state, progress and end-of-list line**
- Keep the `?page=N` link.
- A `<ShowMorePending/>` child component shows "Loading more…" plus a spinner and blocks a double tap. A skeleton row is optional and needs a `useTransition` wrapper.
- Above the button: "You've viewed 24 of 32 results" (muted, tabular-nums).
- When everything is loaded and total > pageSize: "You've seen all 32 results".
- Sources: https://github.com/bbc/gel/blob/master/_content/components/load-more.md, https://baymard.com/blog/number-of-items-loaded-by-default, https://www.nngroup.com/articles/infinite-scrolling-tips/

**20. Offer a wider radius when the list runs out**
- Add `widerRadius(radius, counts, current)` to `lib/search/radius.ts`, with tests. ZeroResults shares it.
- After a complete, non-empty list, show:
  - "That's everything within 25 km."
  - A ghost sm link: "3 more results nationwide".
  - Use `plural()`. Leave the radius param out when the target is the default of 25.
- Give `.ws-results-more--wider` a column layout.
- Source: https://www.nngroup.com/articles/scoped-search/

**21. Phones can tell when a non-default sort is on**
- Replace `display:none` on `.ws-sort__current` below 480px with `cx-sr-only`.
- When `current !== 'best'`, show a small gold dot on the trigger (`aria-hidden`).
- A full visible label on phones is C7.
- Source: https://baymard.com/blog/current-state-product-list-and-filtering

**22. Applied-filter chips: full-height targets and one scrolling row on phones**
- Set `.ws-filter-chip` and `.ws-filter-chips__clear` to `min-height: var(--cx-touch)` (real height, not a `::before` hit area).
- Below 767px the row doesn't wrap: `overflow-x:auto`, edge bleed using the gutter token, a fade on the trailing edge, "Clear all" last.
- Remove-link text: "Remove filter: {label}".
- Don't switch to the DS Chip.
- Sources: https://baymard.com/blog/how-to-design-applied-filters, spec §6 :260

**23. Pickup station isn't door delivery**
- In `summariseDelivery`, the headline is the cheapest door option.
- A listing with only a station gets kind `station`: "+₦3,000 pickup station" / "Free pickup station", with "Total with pickup ₦X".
- A ₦0 station never shows as "Free delivery".
- No extra line on the card.
- Log the deviation.
- Source: https://www.naijatechguide.com/5-ways-jumia-makes-online-shopping-safer-less-risky.html (unverified); our flows :196/:351/:516

**24. "New seller" badge**
- `rules.trust.newSellerFeedbackCount = 10`. `sort.ts:65` reads it too.
- Build `NewSellerBadge` as a neutral Chip with an Atlas icon.
- Show it when the seller is not top rated and count < 10. At count 0, show "New seller" with no percentage.
- Don't use `SellerProfile.level`.
- No joined date on cards.
- Stories: 0, 4 and 10 ratings, plus top rated with a low count.
- Source: spec §440. The cited trust sources are weak (https://academicnewsletter.sufe.edu.cn/info/407816).

**25. A verified-ID icon that isn't the escrow shield**
- Swap `VerifiedTick` to Atlas `UserCheck` (or `IdCard`) through the icons pipeline. Keep the shield and lock icons for escrow, including the "Escrow on every deal" story.
- Accessible name: "Verified ID".
- No hover tooltip on cards.
- A visible label is C14.
- Sources: https://jiji.co.ke/faq/153, https://jiji.com.gh/faq/123

**26. Search box: the highlighted suggestion goes into the field**
- Split the state into `typed` (filters the list) and `value` (shown in the field).
- Arrow keys set `value` to the highlighted option, and wrapping past either end goes back to `typed`.
- Escape restores `typed` and closes. When the list is collapsed, Escape also calls `preventDefault` so the field isn't wiped.
- Left, Right, Home and End commit the value.
- Enter submits natively and still calls `close()`.
- Stories:
  - `toHaveValue('generator')`, then `'ge'` after wrapping.
  - Escape restores the typed text.
- Sources: https://baymard.com/blog/copy-search-suggestion-to-search-field, https://ebay.gitbook.io/mindpatterns/input/combobox, https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/, https://github.com/w3c/aria-practices/issues/1066

**27. Search box: one highlighted row, and a clear marker on it**
- `[aria-selected=true]` gets `box-shadow: inset 3px 0 0 var(--cx-ember-text)`.
- Gate `:hover` behind `(hover:hover)`, or drop it.
- `onMouseMove` sets `active`, so the pointer and keyboard share one highlight.
- Add a forced-colors outline.
- Sources: https://baymard.com/blog/autocomplete-design, https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast

**28. Search box: a real Clear button**
- Hide `::-webkit-search-cancel-button`.
- Add an `inputRef`.
- Render `{value && <button class="ws-search__clear" aria-label="Clear search">}` with `XmarkCircleIcon`:
  - 44px hit area, with negative margins so the pill keeps its height
  - `onMouseDown` calls `preventDefault`
  - clicking clears the field, keeps focus and opens recents
- Add a story for it.
- Sources: https://playbook.ebay.com/design-system/components/search-field, https://developer.apple.com/design/human-interface-guidelines/search-fields

**29. Search box: suggestion counts come from config**
- Add `rules.search.recentShown: 5`, `trendingShown: 5`, `recentStored: 8` and `maxSuggestionsPhone: 6`.
- `recent.ts` and `GlobalSearchBox` use them.
- Trim the options array, never hide rows with CSS.
- The cap for phones arrives with the Phase 1 overlay.
- Sources: https://baymard.com/blog/autocomplete-design, https://www.nngroup.com/articles/site-search-suggestions/

**30. Search box: synonyms help suggestions too**
- Move `SYNONYMS`, `normalise` and `words` into a client-safe `lib/search/synonyms.ts`. `PROHIBITED` stays on the server.
- `fits()` matches the raw text OR the synonym expansion of the last word. The expansion is extra and never replaces the raw text.
- Sources: https://baymard.com/blog/offer-autocomplete-suggestions-for-misspellings; EC-003

**31. Browser toolbar matches the dark page**
- In `app/layout.tsx`: `export const viewport: Viewport = { themeColor: '#0c0a09', colorScheme: 'dark' }`.
- Source: https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/html/reference/elements/meta/name/theme-color/index.md

**32. ShipTo sheet slides up**
- In `listing.css`, below 767px with `no-preference` motion: `translateY(100%)`, then none, with `@starting-style` and `allow-discrete`. Fade `::backdrop` the same way.
- An X button at the top is optional.
- Check Android Back (CloseWatcher) on a device. Don't add a history hack.
- Source: https://raw.githubusercontent.com/material-components/material-components-android/master/docs/components/BottomSheet.md

**33. Test on a 360px Android profile, and add Lighthouse CI**
- In `playwright.config.ts`, add an `android-360` project (DPR 2, `isMobile`) with no-horizontal-scroll checks, plus a 320px smoke test.
- Add `@lhci/cli` and `lighthouserc.json` for `/search?q=head`, mobile preset. Assertions: LCP ≤ 2500, CLS ≤ 0.1, TBT, perf ≥ 0.9, script ≤ 200 KB.
- Add `npm run perf` and a CI step.
- Sources: spec §16.7, PLAN S0.0; https://www.gsma.com/r/wp-content/uploads/2024/10/The-State-of-Mobile-Internet-Connectivity-Report-2024.pdf

### Medium impact, medium effort

**34. Recent searches can be removed, and never store prohibited terms**
- Move `onBlur` to the Form, closing only when focus leaves the form.
- Add `removeRecentSearch()`. Per-row removal:
  - Shift+Delete on the active row
  - a pointer-only X button
- On the prohibited branch, render `<GlobalSearchBox suggestions={false} forget={raw}/>`. It suppresses trending too and deletes the term from recents.
- Replace `TagIcon` on Trending with Atlas `ArrowUpGraphIncrease` via `icons.json`.
- Sources: https://github.com/algolia/autocomplete/blob/next/packages/autocomplete-plugin-recent-searches/src/createRecentSearchesPlugin.ts, https://www.nngroup.com/articles/enriched-site-search-suggestions/; EC-004

**35. Stop weak matches crowding price sorts**
- In `lib/search/query.ts`, the shop name alone can't satisfy a search word. Require at least one hit in the title or category.
- An optional `rules.search.minRelevance` applies to every sort.
- Keep the global monotonic-price tests.
- Optional: a quiet "Sort {Category} by price" link when 70% or more of results share a category.
- Source: https://baymard.com/blog/faceted-sorting

**36. Sort opens as a bottom sheet on phones**
- In `Menu.tsx`, add `presentation:"sheet-on-phone"`:
  - a wrapper popover with an h2 "Sort by" and an inner `role=menu`
  - clear inline positioning on phones
- CSS: `.cx-menu.ws-sheet[popover]{position:fixed;position-area:none;position-try-fallbacks:none;inset:auto 0 0;…}` with a backdrop and 52px rows.
- Sources: spec §6/:535, https://raw.githubusercontent.com/material-components/material-components-android/master/docs/components/BottomSheet.md

**37. Hidden cards stay out of the server render (Low–Medium / S–M)**
- Mirror hides into a `ws_hidden` cookie, including existing localStorage hides on first load.
- Add `rules.hidden.maxListings` and `rules.hidden.maxSellers` with oldest-first eviction.
- `getHidden()` feeds `runSearch`, so counts and pages leave hidden cards out.
- Playwright: no layout shift on reload.
- Why: spec §16.7 CLS budget and correct counts. The Baymard source doesn't apply here.

---

## 2. Later

**Phase 1 (header and global search)**
- **Full-screen mobile search:**
  - The sheet is a dialog with `inert` on the background.
  - Field row: clear button, gold Search, quiet "Cancel" that restores the query.
  - Suggestions scroll, sized from `visualViewport`.
  - Trending shows as chips, capped by `maxSuggestionsPhone`.
  - Don't make `interactiveWidget` site-wide until the header and bottom nav are checked.
  - Sources: https://baymard.com/blog/autocomplete-design, https://playbook.ebay.com/design-system/components/search-field, https://developer.chrome.com/blog/viewport-resize-behavior
- **Scope select:**
  - Defaults to "All categories" and reflects `cat=`.
  - Up to 2 scope rows: "q in Category", with the category name semibold and muted. The cap goes in config.
  - Sources: https://www.nngroup.com/articles/scoped-search/, https://baymard.com/blog/search-scope
- **Live suggestions** through server `repos.search.suggest`:
  - word prefix plus Damerau-Levenshtein distance 1 for words of 4+ characters (threshold in config)
  - B2 types: completions, categories, sellers, titles
  - the EC-004 check runs on both raw and corrected words
  - falls back to recents
  - Reuse `SuggestionText`.
- **Theme switch:** `generateViewport` reads the theme cookie and emits the matching `themeColor`. Don't use a prefers-color-scheme array.
- **AppHeader:** sticky and shrinks on scroll, per spec. It sets `--cx-sticky-offset`.

**Phase 2 (results tooling)**
- **Sticky "Filters · Sort" bar and FilterSheet:**
  - Sticky below 768px, inline from 768–1023px.
  - FilterSheet has a batch "Show N results" button and Clear.
  - No Filters button until the sheet works (F5). Use the gutter token.
  - Sources: https://baymard.com/blog/ecommerce-filter-ui, https://www.nngroup.com/articles/mobile-faceted-search/, https://github.com/w3c/wcag/blob/main/understanding/22/focus-not-obscured-minimum.html
- **ViewToggle:**
  - A Server Action sets a `ws-view` cookie and returns through `return-path.ts`.
  - Buttons use `aria-pressed`, `GridIcon` and `ListIcon`.
  - Default is grid. Hide the toggle on zero results.
  - Sources: https://baymard.com/blog/product-listing-page-plp-ux, https://www.nngroup.com/articles/item-list-view-all/
- **Zero results:**
  - "Results matching fewer words": drop raw words inside the radius only, with sr text "without".
  - `spell.ts` gives a "Did you mean…" link.
  - Show up to 4 categories related to the query.
  - Leave a slot for SaveSearchButton. All numbers go in config.
  - Sources: https://www.nngroup.com/articles/search-no-results-serp/, https://baymard.com/blog/no-results-page
- **InfiniteLoader:** auto-load desktop results up to `search.autoLoadUntil.desktop = 60` with a client append and `replaceState`. Phones keep 24 (C11). Sources: https://baymard.com/blog/number-of-items-loaded-by-default, eBay 60/page.
- **`content-visibility:auto`:**
  - Applies to `.ws-results > li` from the 9th item, using measured heights and an 8px bleed.
  - Measure INP first.
  - Source: https://raw.githubusercontent.com/GoogleChrome/web.dev/main/src/site/content/en/blog/content-visibility/index.md
- **AreaCombobox:** a progressive enhancement over the native select, built with the LGA dataset and LocationRadiusFilter. "Use my location" stays a separate button. Source: https://www.privateinternetaccess.com/blog/how-to-change-location-on-facebook-marketplace/
- **Shared `.ws-sheet` primitive:** swipe-to-dismiss and a grabber, shared by FilterSheet, Sort and ShipTo.
- **Filters:**
  - DeliveryFilter "Pickup" uses the pickup flag from Do now #1.
  - SellerFilter is labelled "Verified ID".
  - Add facet prefixes on chips only for values that are ambiguous on their own.
- **Optional, list view:**
  - Two-column list via a results-column container query (cards ≥472px).
  - Hide the photo-count pill on the 112px phone thumbnail.

**Phase 3 (listing detail)**
- **ShareSheet:**
  - Uses `navigator.share`, falling back to WhatsApp, then Copy link, Telegram, X and SMS.
  - Uses `WhatsappIcon`. Escrow copy comes from the single source.
  - Fires `evt_share`.
- **SafetyTipsCard:** shown when a listing has meet-up or pickup.
  - Escrow categories say "check the item before you scan the handover code".
  - Vehicles and property get inspection tips with no escrow claim.
  - The 24h window comes from config.
- **LocalPickupMap:** draws an area circle. Update flows :217.
- **DeliveryPanel and DeliverySelector:** dated ranges ("Thu 8 – Sat 10 Oct to Lekki") once a quote provider, holiday list and cut-off exist.
- **Trust surfaces:**
  - ProtectionPanel.
  - A "Verified ID" chip with a button disclosure.
  - Joined date in SellerCard and SellerStats.
  - Vehicle and property variants get "Contact seller / Book viewing" and "Inspect before you pay · no escrow checkout".
- **Listing page polish:**
  - Listing skeleton, if not already done.
  - Optional suggested meet-up spots per area. This needs a [WS] spec entry first.

**Phase 5 (seller tools)**
- Server-side resize to about a 1600px long edge.
- Generate `blurDataURL` at upload.
- Suggest a square cover photo.
- A period field for property.
- A title hint: brand, model and key spec first.

---

## 3. Conflicts to decide

| # | Question for the owner | Recommendation |
|---|---|---|
| C1 | Add hover and swipe photo stepping to cards? This departs from spec §5.1 overlays and blueprint X3 (no hover-only features). | **Yes.** Ship the cheap desktop step now and the full version next. Log X3: the listing gallery is the keyboard route. eBay does the same. |
| C2 | Replace the condition chip with an eBay-style subtitle line? This goes against spec §5.1-2, §5.3, "ConditionChip everywhere" and blueprint C2. | **Yes.** eBay's own tile uses subtitle text, and the card doesn't get taller. |
| C3 | Three-line titles on grid cards below 768px? This reverses PROGRESS rows 42/44 and spec :191/:554, and adds about 19px per phone card. | **Yes**, with `min-height:3lh`, matching eBay Skin. Add a baseline+24px height test. |
| C4 | Photos `object-fit: contain` inside the 1:1 box? Seller photos are no longer cropped, and the letterbox needs a colour. | **Yes.** Use the `--cx-surface-2` letterbox plus the 5% scrim (eBay `image-treatment`). Don't add a "cover" band for near-square photos. |
| C5 | Make the Top rated chip neutral? The DS defines brand tone as "programme labels". | **Not yet.** Change the stars first, and re-check only if gold still competes with the price. |
| C6 | Drop "Total to {city}" when it equals the price (R-003 says "must be able to show"), and show day ranges instead of the spec's "date" on cards? | **Yes to both.** Dates move to Phase 3 DeliveryPanel. |
| C7 | Always show "Sort: {short}" on phones? The spec's mobile bar reads "Filters · Sort". | **No.** Use the sr-only text plus a dot for a non-default sort (Do now #21). |
| C8 | Show a quiet escrow line on /search? eBay shows no guarantee on results pages. | **Yes**, one dismissible caption line backed by spec §785 #3, results pages only. |
| C9 | Add a 50 km radius? R-001, S0.8 and the spec say 5/10/25/Nationwide. | **Yes.** Use `[5,10,25,50]`, update the `?radius` format and docs, and add a 25–50 km mock listing. |
| C10 | When the location is only guessed, default to city-wide scope and hide km and the total? | **No for now.** Revisit when real IP geolocation replaces the Lagos mock. |
| C11 | Auto-load desktop up to 60? Spec §16.7 says ≤24 cards before Load more. | **Yes in Phase 2.** Read the limit as applying to the first server render; the mobile Lighthouse budget doesn't change. |
| C12 | Make "Load more button first" permanent? Spec §6 and B2 step 7 say infinite scroll first. | **Yes.** Amend the spec: no auto-append past the button on phones. |
| C13 | Rank price sorts by relevance tiers? This breaks the "monotonic in price_minor" guardrail and e2e test. | **No.** Fix matching instead (Do now #35). |
| C14 | Visible "Verified" text on cards? eBay shows no such label. | **List view only.** Grid cards at 240px or wider are the owner's call. |
| C15 | DS overrides in marketplace.css: `--cx-elevated`, the text tiers, `.cx-skel` reduced motion, the `.cx-card` hover gate. | **Yes.** Log each one and raise it upstream. |
| C16 | Auto-correct spelling (eBay) or a "Did you mean…" link (spec)? | **The link.** |
| C17 | Follow the OS theme? Apple HIG says yes; the 6 Oct decision is dark-first. | **Keep dark.** |
| C18 | Store the grid/list choice in a cookie rather than the URL (an exception to R-011)? | **Yes.** It's a display preference, the same as ws-area. |
| C19 | Add rating and best-selling sorts? They're not in eBay's set (spec §6). | **Defer.** If one is added, label it "Seller rating: highest first". |
| C20 | Spec §16.7 says "virtualise lists > 100". | **Amend** to "content-visibility first; virtualise only if INP fails", once measured. |
| C21 | Hide the header on scroll down? The spec says it shrinks; hiding on scroll belongs to the BottomNav. | **Follow the spec.** |

---

## 4. Already right

- **Ratings show the average and the count.** https://baymard.com/blog/sort-by-customer-ratings, https://baymard.com/blog/user-perception-of-product-ratings
- **The discount sits next to the price, once.** https://baymard.com/blog/product-page-price-discounts
- **The query stays in the box, and Back returns to the same place** (cumulative `?page=N`). https://baymard.com/blog/persist-search-queries, https://baymard.com/blog/return-same-place, https://github.com/bbc/gel/blob/master/_content/components/load-more.md
- **Search field basics:** a wide field, "Search for anything", an adjacent Search button, the search keyboard. https://www.nngroup.com/articles/magnifying-glass-icon/, https://baymard.com/blog/mobile-search-submit-button, https://playbook.ebay.com/design-system/components/search-field, https://baymard.com/blog/ecommerce-search-query-types
- **Two-column grid on phones, with a list variant ready.** https://www.nngroup.com/articles/image-vs-list-mobile-navigation/, https://baymard.com/blog/ecommerce-category-page, https://baymard.com/blog/list-item-design-ecommerce
- **The dark base is stone grey, not pure black.** https://raw.githubusercontent.com/material-components/material-components-android/master/docs/theming/Dark.md, https://raw.githubusercontent.com/material-components/material-components-android/master/lib/java/com/google/android/material/color/res/values/colors.xml, https://developer.apple.com/design/human-interface-guidelines/dark-mode, https://registry.npmjs.org/@ebay/skin/-/skin-19.37.0.tgz
- **Accent tones are lightened for dark.** Same Material, eBay and Apple sources.
- **Device location is requested only on tap, with a manual alternative.** https://web.dev/articles/permissions-best-practices, https://web.dev/articles/user-location, https://unlighthouse.dev/learn-lighthouse/best-practices/geolocation-on-start
- **Prices are shown as the all-in naira total.** https://www.emarketer.com/content/extra-costs-are-the-top-reason-consumers-abandon-online-carts, https://www.northumbriajournals.co.uk/index.php/jbdi/article/download/1807/1976/6183
- **"Show more" is a button with a count, not infinite scroll.** https://smashingmagazine.com/2016/03/pagination-infinite-scrolling-load-more-buttons, https://Baymard.com/blog/external-load-more-vs-pagination-vs-infinite-scrolling
- **The site works without JavaScript** (Opera users, slow first loads). https://gs.statcounter.com/browser-market-share/mobile-tablet/nigeria, https://intelpoint.co/insights/chrome-alone-accounts-for-two-third-of-all-web-traffic-across-all-devices-outpacing-safari-and-edge/
- **Delivery cost and reversible Save/Hide on cards:** the stretched-link single hit area and the Undo toasts are already in place.

---

## 5. Rejected

- **Hairlines for dividers, stronger strokes for fields:** our screenshots show the field and button outlines clearly, the controls already pass via their text and icons, and a 22% stroke matches neither eBay (#707070) nor the DS. If wanted, decide it in the DS when checkout forms are built.
- **Distances should look approximate:** the blueprint (:122) specifies "3.2 km". The eBay and ipregistry sources don't cover card distance, and privacy is already handled because only the area is shown.
- **Say plainly how fresh a listing is:** the sources were unverifiable and contradicted the recommendation (7 vs 30 days). Age is already shown per spec §5.1-7. "Listed" would cause wrapping. Listings expire at 30 days. eBay cards show no age.
- **Two-column list view at 1280px via a media query:** it breaks the "no new breakpoints" rule (PLAN :40). The halves (~455px) would fall into the narrow trim. Spec §5.2 defines a single-column list. A container-query version is a possible Phase 2 option.
- **Save-Data "lite" mode now:** the header has barely any reach since Chrome Android dropped Lite mode, and reading `headers()` in the shop layout would make every route dynamic. Deferred.
- **Quality 45 for card photos:** too lossy for judging an item's condition. 60 is used for thumbnails only.
- **`useLinkStatus` pending bar on card links:** it is skipped for prefetched links, so it would rarely show. Use the listing `loading.tsx` instead.