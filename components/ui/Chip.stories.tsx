import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Chip, Count, DeltaChip } from "./Chip";

const meta: Meta<typeof Chip> = { title: "UI/Chip", component: Chip };
export default meta;
type Story = StoryObj<typeof Chip>;

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Chip>Used</Chip>
      <Chip tone="gain">−23%</Chip>
      <Chip tone="loss">Payment failed</Chip>
      <Chip tone="warning">Ending soon</Chip>
      <Chip tone="brand">Top rated</Chip>
      <Chip tone="gain" dot>Verified</Chip>
    </div>
  ),
};

export const Delta: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <DeltaChip value={2.14} />
      <DeltaChip value={-0.86} />
    </div>
  ),
  play: async ({ canvas }) => {
    expect(canvas.getByText("up 2.14%")).toHaveClass("cx-sr-only");
    expect(canvas.getByText("down 0.86%")).toBeInTheDocument();
  },
};

export const Counts: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Count value={3} />
      <Count value={140} />
      <Count dot />
      <Count value={0} />
    </div>
  ),
  play: async ({ canvas }) => {
    expect(canvas.getByText("99+")).toBeInTheDocument();
    expect(canvas.queryByText("0")).toBeNull(); // zero renders nothing
  },
};
