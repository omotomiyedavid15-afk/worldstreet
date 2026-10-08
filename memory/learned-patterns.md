# Learned Patterns
<!-- Updated by self-learning skill -->
<!-- Last updated: 2026-10-08 -->

## Naming Conventions
- React components use PascalCase; helpers and state use camelCase.
- Marketplace CSS uses `ws-` component classes and existing `--cx-*` tokens.

## Code Organization
- Server route files compose client feature components.
- Seller flows are concentrated in `features/sell/` and share `SellerShell`.
- Existing design-system primitives from `components/ui` are preferred.

## Error Handling
- Seller model commands throw rule messages; `useRun()` renders them beside the action.
- Browser persistence is explicitly treated as fallible in device-local flows.

## Testing Approach
- Pure seller rules use colocated Vitest tests.
- Complete user flows and responsive behavior use Playwright in `e2e/`.
- Affected seller routes include axe checks for serious and critical violations.
