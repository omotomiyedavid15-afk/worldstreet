import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { SortMenu } from "./SortMenu";

const meta: Meta<typeof SortMenu> = {
  title: "Search/SortMenu",
  component: SortMenu,
  args: { current: "price_asc", pathname: "/search", params: { q: "headphones", sort: "price_asc", radius: "10" } },
};
export default meta;
type Story = StoryObj<typeof SortMenu>;

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("button", { name: /Sort/ });
    await userEvent.click(trigger);
    const menu = within(canvasElement.ownerDocument.body).getByRole("menu");
    const current = within(menu).getByRole("menuitemradio", { name: "Price: lowest first" });
    expect(current).toHaveAttribute("aria-checked", "true");
    await waitFor(() => expect(current).toHaveFocus()); // opens on the current order
    // Every order is a link that keeps the other filters (R-011).
    expect(within(menu).getByRole("menuitemradio", { name: "Newly listed" })).toHaveAttribute("href", "/search?q=headphones&radius=10&sort=newest");
    expect(within(menu).getByRole("menuitemradio", { name: "Best match" })).toHaveAttribute("href", "/search?q=headphones&radius=10");
    await userEvent.keyboard("{Escape}");
  },
};

export const BestMatch: Story = { args: { current: "best", params: {} } };
