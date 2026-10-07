import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import * as icons from "./atlas.generated";

const meta: Meta = { title: "Foundations/Icons", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const entries = Object.entries(icons);

export const Gallery: Story = {
  render: () => (
    <div className="cx-container" style={{ paddingBlock: "var(--cx-s-7)", display: "grid", gap: "var(--cx-s-6)" }}>
      <h1 className="cx-h3">Icons</h1>
      <p className="cx-small">Atlas Icons, medium weight, currentColor. Generated subset: add names to components/icons/icons.json.</p>
      <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "var(--cx-s-3)", padding: 0, margin: 0, listStyle: "none" }}>
        {entries.map(([name, Icon]) => (
          <li key={name} style={{ display: "grid", justifyItems: "center", gap: "var(--cx-s-2)", padding: "var(--cx-s-4)", borderRadius: "var(--cx-r-md)", background: "var(--cx-surface)" }}>
            <Icon />
            <code className="cx-small" style={{ fontSize: 12 }}>{name.replace(/Icon$/, "")}</code>
          </li>
        ))}
      </ul>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svgs = canvasElement.querySelectorAll("svg");
    expect(svgs.length).toBe(entries.length);
    // Decorative by default, and no ids that could collide when an icon repeats.
    expect(canvasElement.querySelectorAll("svg[aria-hidden=true]").length).toBe(entries.length);
    expect(canvasElement.querySelectorAll("svg [id]").length).toBe(0);
  },
};

/* Two weights by role (styles/marketplace.css): linear for reading, bold for acting
   and for state. The play step checks the rule, not just the picture. */
export const Weights: Story = {
  render: () => {
    const { HeartIcon, ShareIcon, DeliveryTruckIcon, LocationIcon } = icons;
    return (
      <div style={{ display: "grid", gap: "var(--cx-s-5)" }}>
        <p className="cx-small" style={{ display: "flex", gap: "var(--cx-s-3)", alignItems: "center" }}>
          <DeliveryTruckIcon size={20} /> Free delivery in 2–4 days · <LocationIcon size={20} /> Lekki
        </p>
        <div style={{ display: "flex", gap: "var(--cx-s-3)", alignItems: "center" }}>
          <button type="button" className="cx-btn cx-btn--ghost cx-btn--icon" aria-label="Share listing">
            <ShareIcon />
          </button>
          <button type="button" className="cx-btn cx-btn--ghost cx-btn--icon" aria-pressed="true" aria-label="Saved">
            <HeartIcon />
          </button>
          <button type="button" className="cx-btn cx-btn--ghost" aria-label="Save listing">
            <HeartIcon /> Save
          </button>
          <HeartIcon weight="thin" size={32} label="Thin, set explicitly" />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement, canvas }) => {
    const width = (el: Element) => getComputedStyle(el).strokeWidth;
    const svg = (sel: string) => canvasElement.querySelector(`${sel} svg`)!;
    expect(width(svg("p"))).toBe("1.5px"); // linear: a meta line
    expect(width(svg(".cx-btn--icon:not([aria-pressed])"))).toBe("2px"); // bold: an icon button
    expect(width(svg("[aria-pressed=true]"))).toBe("2px"); // bold: state
    expect(width(svg(".cx-btn--ghost:not(.cx-btn--icon)"))).toBe("1.5px"); // linear: a text button
    expect(width(canvas.getByRole("img", { name: "Thin, set explicitly" }))).toBe("1px"); // the prop wins
  },
};
