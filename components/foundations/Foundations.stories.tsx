import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect } from "storybook/test";
import { composite, contrastRatio, parseRgb } from "@/lib/contrast";

/* Foundations as the marketplace consumes them: DS tokens under the WorldStore brand,
   plus the marketplace density layer. The Colors story is also the AA gate for tokens
   (PLAN S0.1): its play step measures every text token on every surface in both themes. */

const meta: Meta = { title: "Foundations", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const TEXT_TOKENS = ["--cx-text", "--cx-text-2", "--cx-text-muted", "--cx-ember-text", "--cx-gain", "--cx-loss", "--cx-warning"];
// Surfaces text sits on: page, raised card, and the translucent fills over each.
const SURFACES: [name: string, fill: string | null, under: string][] = [
  ["bg", null, "--cx-bg"],
  ["elevated", null, "--cx-elevated"],
  ["surface on bg", "--cx-surface", "--cx-bg"],
  ["surface-2 on elevated", "--cx-surface-2", "--cx-elevated"],
  ["surface-3 on elevated", "--cx-surface-3", "--cx-elevated"],
];
/* Not checked as text: --cx-text-3 (50% alpha, 3.9:1 on white) and --cx-text-disabled
   are DS tokens the marketplace keeps off readable text; disabled text is exempt (1.4.3). */

/** Resolves a colour token to a computed rgb() string by painting a probe with it. */
function resolve(token: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

type Row = { theme: string; text: string; surface: string; ratio: number };

function measure(theme: "dark" | "light"): Row[] {
  const html = document.documentElement;
  const before = html.dataset.theme;
  html.dataset.theme = theme;
  const rows: Row[] = [];
  for (const [surface, fill, under] of SURFACES) {
    const base = parseRgb(resolve(under));
    const bg = fill ? composite(parseRgb(resolve(fill)), base) : base;
    for (const text of TEXT_TOKENS) rows.push({ theme, text, surface, ratio: contrastRatio(parseRgb(resolve(text)), bg) });
  }
  if (before) html.dataset.theme = before;
  return rows;
}

const SWATCHES = ["--cx-bg", "--cx-elevated", "--cx-ember", "--cx-ember-text", "--cx-gain", "--cx-loss", "--cx-warning", "--cx-text", "--cx-text-muted", "--cx-hairline"];

function ContrastTable() {
  // Stories render only in the browser, so the measurement can run in the initializer.
  const [rows] = useState<Row[]>(() => [...measure("dark"), ...measure("light")]);
  return (
    <table className="cx-small" data-testid="contrast">
      <caption className="cx-sr-only">Contrast of each text token on each surface</caption>
      <thead>
        <tr><th scope="col">Theme</th><th scope="col">Text</th><th scope="col">Surface</th><th scope="col">Ratio</th></tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={`${r.theme}${r.text}${r.surface}`}>
            <td>{r.theme}</td><td><code>{r.text}</code></td><td>{r.surface}</td>
            <td className="cx-num" data-ratio={r.ratio.toFixed(2)}>{r.ratio.toFixed(2)}:1</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const Colors: Story = {
  render: () => (
    <div className="cx-container" style={{ display: "grid", gap: "var(--cx-s-7)", paddingBlock: "var(--cx-s-7)" }}>
      <h1 className="cx-h3">Colour</h1>
      <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "var(--cx-s-4)", padding: 0, margin: 0, listStyle: "none" }}>
        {SWATCHES.map((t) => (
          <li key={t} style={{ display: "grid", gap: "var(--cx-s-2)" }}>
            <span aria-hidden="true" style={{ height: 56, borderRadius: "var(--cx-r-md)", background: `var(${t})`, boxShadow: "inset 0 0 0 1px var(--cx-hairline)" }} />
            <code className="cx-small">{t}</code>
          </li>
        ))}
      </ul>
      <ContrastTable />
    </div>
  ),
  play: async ({ canvas }) => {
    const table = await canvas.findByTestId("contrast");
    const cells = [...table.querySelectorAll<HTMLElement>("[data-ratio]")];
    expect(cells.length).toBe(TEXT_TOKENS.length * SURFACES.length * 2);
    const failing = cells.filter((c) => Number(c.dataset.ratio) < 4.5).map((c) => c.closest("tr")?.textContent);
    expect(failing).toEqual([]);
  },
};

const TYPE = [
  ["cx-h1", "Buy and sell near you"],
  ["cx-h2", "Deals ending soon"],
  ["cx-h3", "₦185,000.00"],
  ["cx-h4", "Sony WH-1000XM5 headphones"],
  ["cx-lead", "Every deal is protected by escrow."],
  ["cx-body-lg", "Delivered to Lekki between Thu 8 and Sat 10 Oct."],
  ["", "Body. Seller usually replies within 2 hours."],
  ["cx-small", "Small. Lekki, Lagos · 3.2 km · 2h ago"],
  ["cx-caption", "Caption · Like new"],
] as const;

export const Typography: Story = {
  render: () => (
    <div className="cx-container" style={{ display: "grid", gap: "var(--cx-s-6)", paddingBlock: "var(--cx-s-7)" }}>
      {TYPE.map(([cls, text], i) =>
        i === 0 ? <h1 key={cls} className={cls}>{text}</h1> : <p key={cls || "body"} className={cls}>{text}</p>,
      )}
      <p className="cx-balance">₦18,420.55</p>
    </div>
  ),
};

const SPACE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const RADII = ["xs", "sm", "icon", "md", "card", "lg", "pill"];

export const SpaceAndRadius: Story = {
  render: () => (
    <div className="cx-container" style={{ display: "grid", gap: "var(--cx-s-7)", paddingBlock: "var(--cx-s-7)" }}>
      <h1 className="cx-h3">Space and radius</h1>
      <ul style={{ display: "grid", gap: "var(--cx-s-2)", padding: 0, margin: 0, listStyle: "none" }}>
        {SPACE.map((n) => (
          <li key={n} style={{ display: "flex", alignItems: "center", gap: "var(--cx-s-4)" }}>
            <code className="cx-small" style={{ width: 80 }}>--cx-s-{n}</code>
            <span aria-hidden="true" style={{ height: 12, width: `var(--cx-s-${n})`, background: "var(--cx-ember)", borderRadius: 2 }} />
          </li>
        ))}
      </ul>
      <ul style={{ display: "flex", flexWrap: "wrap", gap: "var(--cx-s-4)", padding: 0, margin: 0, listStyle: "none" }}>
        {RADII.map((r) => (
          <li key={r} style={{ display: "grid", gap: "var(--cx-s-2)", justifyItems: "center" }}>
            <span aria-hidden="true" style={{ width: 72, height: 72, borderRadius: `var(--cx-r-${r})`, background: "var(--cx-surface-2)", boxShadow: "inset 0 0 0 1px var(--cx-hairline)" }} />
            <code className="cx-small">{r}</code>
          </li>
        ))}
      </ul>
    </div>
  ),
};

function DensityDemo({ density }: { density: "comfortable" | "compact" }) {
  return (
    <section data-density={density} aria-label={`${density} density`} style={{ display: "grid", gap: "var(--cx-gap-grid)", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
      {[1, 2].map((n) => (
        <div key={n} style={{ padding: "var(--cx-density-pad)", borderRadius: "var(--cx-r-card)", background: "var(--cx-elevated)", boxShadow: "inset 0 0 0 1px var(--cx-hairline)" }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Listing title</p>
          <p className="cx-num" style={{ margin: 0, fontSize: "var(--cx-price-size)", fontWeight: 600 }}>₦185,000</p>
          <p style={{ margin: 0, fontSize: "var(--cx-meta)", color: "var(--cx-text-muted)" }}>Lekki, Lagos · 3.2 km</p>
        </div>
      ))}
    </section>
  );
}

/** Spec §1.3: compact changes padding, row height, meta size and gaps only. */
export const Density: Story = {
  render: () => (
    <div className="cx-container" style={{ display: "grid", gap: "var(--cx-s-7)", paddingBlock: "var(--cx-s-7)" }}>
      <h1 className="cx-h3">Density</h1>
      <h2 className="cx-h4">Comfortable</h2>
      <DensityDemo density="comfortable" />
      <h2 className="cx-h4">Compact</h2>
      <DensityDemo density="compact" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const pad = (d: string) => getComputedStyle(canvasElement.querySelector(`[data-density=${d}] > div`)!).paddingTop;
    expect(pad("comfortable")).not.toBe(pad("compact"));
    expect(pad("compact")).toBe("12px");
  },
};
