<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# WorldStreet Marketplace

- Build plan and progress: `docs/marketplace/PLAN.md`, `docs/marketplace/PROGRESS.md`. UI research and open UI decisions: `docs/marketplace/UI-RESEARCH.md`.
- Design system: rebuilt from https://worldstreet-design-system.vercel.app (`--cx-*` tokens under `data-brand="worldstreet"`). Icons: Atlas Icons via `components/icons` only.
- Money is integer kobo (`price_minor`), shown only through `formatCurrency()`.
- Every rule number lives in `config/marketplace-rules.ts`.
- Before committing: `npm run check`.
