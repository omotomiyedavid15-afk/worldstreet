import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { SiteFooter } from "./SiteFooter";

const meta: Meta = { title: "Shell", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

export const Header: Story = {
  render: () => <AppHeader trending={["iphone", "generator", "sofa"]} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("combobox", { name: "Search for anything" })).toBeInTheDocument();
    await expect(c.getByRole("link", { name: "WorldStreet home" })).toHaveAttribute("href", "/");
  },
};

export const Footer: Story = {
  render: () => <SiteFooter />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("navigation", { name: "Footer" })).toBeInTheDocument();
  },
};

export const PhoneNav: Story = {
  globals: { viewport: { value: "mobile" } },
  render: () => <BottomNav />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("link")).toHaveLength(5);
  },
};
