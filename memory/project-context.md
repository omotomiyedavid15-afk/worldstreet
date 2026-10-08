# Project Context
<!-- Updated by self-learning skill -->
<!-- Last updated: 2026-10-08 -->

## Purpose
WorldStore is a local-first Nigerian marketplace prototype for buyer, seller, and staff workflows.

## Tech Stack
- Language: TypeScript
- Framework: Next.js 16.3.8 with React 19
- Styling: global WorldStreet design-system CSS using `--cx-*` tokens
- Testing: Vitest, Storybook, Playwright, and axe

## Architecture
- App Router routes live under `app/`.
- Domain UI and local state live under `features/`.
- Marketplace rules are centralized in `config/marketplace-rules.ts`.
- Money is integer kobo and rendered through `formatCurrency()`.

## Key Dependencies
- Atlas Icons through `components/icons`
- GSAP and Motion for existing motion surfaces
