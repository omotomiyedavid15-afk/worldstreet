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

export const Weights: Story = {
  render: () => {
    const { HeartIcon } = icons;
    return (
      <div style={{ display: "flex", gap: "var(--cx-s-6)", alignItems: "center" }}>
        <HeartIcon weight="thin" size={32} />
        <HeartIcon weight="medium" size={32} />
        <HeartIcon weight="bold" size={32} />
        <HeartIcon size={32} label="Saved" style={{ color: "var(--cx-ember-text)" }} />
      </div>
    );
  },
  play: async ({ canvas }) => {
    expect(canvas.getByRole("img", { name: "Saved" })).toBeInTheDocument();
  },
};
