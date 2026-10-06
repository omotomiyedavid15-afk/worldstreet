import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { MagnifyingGlassIcon, CheckShieldIcon, WarningIcon } from "@/components/icons";
import { Button } from "./Button";
import { Avatar, Badge, Card, EmptyState, IconTile, Skeleton, initials } from "./Surfaces";

const meta: Meta = { title: "UI/Surfaces" };
export default meta;
type Story = StoryObj;

const Body = () => (
  <>
    <IconTile><CheckShieldIcon size={28} /></IconTile>
    <h3 className="cx-h4" style={{ marginTop: 16 }}>Protected by escrow</h3>
    <p className="cx-small">Your money is released to the seller only after you confirm.</p>
  </>
);

export const Cards: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
      <Card><Body /></Card>
      <Card orb="tr"><Body /></Card>
      <Card elevated><Body /></Card>
      <Card interactive><Body /></Card>
    </div>
  ),
};

export const CardHover: Story = { ...Cards, parameters: { pseudo: { hover: true } } };

export const CardCompact: Story = {
  render: () => (
    <div data-density="compact" style={{ maxWidth: 280 }}>
      <Card><Body /></Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    expect(getComputedStyle(canvasElement.querySelector(".cx-card")!).paddingTop).toBe("12px");
  },
};

export const Avatars: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar size="sm" name="Tobi Adeyemi" />
      <Avatar name="Tobi Adeyemi" status />
      <Avatar size="lg" name="Adaeze" brand />
      <Avatar size="xl" name="Kemi Bello Shop" />
    </div>
  ),
  play: async ({ canvas }) => {
    expect(canvas.getAllByRole("img", { name: "Tobi Adeyemi" })).toHaveLength(2);
    expect(initials("Kemi Bello Shop")).toBe("KS");
    expect(initials(" adaeze ")).toBe("A");
  },
};

export const Badges: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Badge icon={<CheckShieldIcon size={16} />}>Escrow on every deal</Badge>
      <Badge>Near you</Badge>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <Card role="status" aria-busy="true" aria-label="Loading balance" style={{ maxWidth: 380 }}>
      <div style={{ display: "grid", gap: 14 }}>
        <Skeleton width={96} height={12} />
        <Skeleton width="70%" height={40} radius={10} />
        <Skeleton width={120} height={20} radius={999} />
      </div>
    </Card>
  ),
};

export const Empty: Story = {
  render: () => (
    <EmptyState icon={<MagnifyingGlassIcon size={28} />} title="No results for “phone case”" action={<Button size="sm" variant="ghost">Widen to 25 km</Button>}>
      Try a different spelling, or search a wider area.
    </EmptyState>
  ),
  play: async ({ canvas }) => {
    expect(canvas.getByRole("heading", { level: 2 })).toHaveTextContent("No results");
  },
};

export const Error: Story = {
  render: () => (
    <EmptyState tone="error" icon={<WarningIcon size={28} />} title="Couldn't load listings" action={<Button size="sm" variant="ghost">Try again</Button>}>
      Check your connection and try again.
    </EmptyState>
  ),
};
