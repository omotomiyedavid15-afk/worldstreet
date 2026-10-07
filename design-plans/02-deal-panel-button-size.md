# One button size in the deal panel

Written against: df1d38e

## Evidence chain

- Surface: deal panel (`aside#deal-panel`) on Inbox and Offers
- Problem: owner screenshot shows Accept / Counter / Decline offer at the default size (`--cx-control-h`, 18px) beside Visit shop, Block seller and Report at `size: "sm"` (15px) in the same 340px panel.
- Design evidence: direct contradiction within one panel; the panel's own actions are `sm`.
- Owner: `features/negotiation/OfferCard.tsx`, `features/negotiation/OfferForm.tsx` call `buttonClass({...})` without `size`.
- Uncertainty: none.

## Design decision

All deal-panel actions use `buttonClass({ size: "sm" })`; variants (solid / ghost / quiet) are unchanged, so emphasis still comes from fill, not scale.

## Changes

1. OfferCard.tsx and OfferForm.tsx: add `size: "sm"` to every `buttonClass` call. Preserve labels (e2e uses them).

## Validation

- `npm run check`; negotiation stories and e2e pass.
