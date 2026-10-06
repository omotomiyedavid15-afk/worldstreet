import { ESCROW } from "@/lib/copy/escrow";

// Placeholder until S0.10 builds the real home (flows B1).
export default function Home() {
  return (
    <main id="main" className="cx-container" style={{ paddingBlock: "var(--cx-s-10)" }}>
      <h1 className="cx-h2">WorldStreet Marketplace</h1>
      <p className="cx-lead cx-muted">{ESCROW.tagline}</p>
    </main>
  );
}
