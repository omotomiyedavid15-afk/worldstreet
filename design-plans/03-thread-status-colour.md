# Thread header status uses the positive colour only for a real status

Written against: df1d38e

## Evidence chain

- Surface: thread header (`.ws-chat__who p`)
- Problem: owner screenshot (seller perspective) shows "Saved on this device · demo" in `--cx-gain` green, the colour the same slot uses for "Usually replies within …".
- Design evidence: `--cx-gain` is the DS positive/gain token; the demo note is not a status.
- Owner: `styles/marketplace/negotiation.css` `.ws-chat__who p { color: var(--cx-gain) }`; text from `features/negotiation/Conversation.tsx`.

## Design decision

Default the line to `--cx-text-muted`; only the reply-time line takes `--cx-gain` (via `data-status`).

## Validation

- Buyer view: green reply time. Seller view: muted demo note.
