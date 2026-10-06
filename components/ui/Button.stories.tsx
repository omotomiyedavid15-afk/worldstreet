import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { ArrowRightIcon, HeartIcon, ShareIcon } from "@/components/icons";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: { children: "Buy now", onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Solid: Story = {};
export const Ghost: Story = { args: { variant: "ghost", children: "Add to cart" } };
export const Quiet: Story = { args: { variant: "quiet", children: "Make offer" } };
export const Danger: Story = { args: { variant: "danger", children: "End listing" } };
export const Arrow: Story = { args: { arrow: true, children: <>Start selling <ArrowRightIcon size={18} /></> } };
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
export const IconOnly: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Button variant="ghost" icon aria-label="Save listing"><HeartIcon size={18} /></Button>
      <Button variant="quiet" size="sm" icon aria-label="Share listing"><ShareIcon size={18} /></Button>
    </div>
  ),
  play: async ({ canvas }) => {
    // The 36px small button still offers a 44px target.
    const small = canvas.getByRole("button", { name: "Share listing" });
    const hit = getComputedStyle(small, "::before");
    expect(small.getBoundingClientRect().height).toBe(36);
    expect(hit.inset).toBe("-4px");
  },
};
export const Hover: Story = { parameters: { pseudo: { hover: true } } };
export const FocusVisible: Story = { parameters: { pseudo: { focusVisible: true } } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = {
  args: { loading: true, children: "Pay ₦103,000" },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole("button", { name: "Pay ₦103,000" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(getComputedStyle(button).pointerEvents).toBe("none"); // DS: no clicks while busy
    button.focus();
    expect(button).toHaveFocus(); // still focusable while busy
    await userEvent.keyboard("{Enter}");
    expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const AsLink: Story = {
  args: { href: "/sell/new", variant: "ghost", children: "Create listing" },
  play: async ({ canvas }) => {
    expect(canvas.getByRole("link", { name: "Create listing" })).toHaveAttribute("href", "/sell/new");
  },
};
