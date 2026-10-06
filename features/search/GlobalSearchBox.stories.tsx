import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { clearRecentSearches } from "./recent";
import { GlobalSearchBox } from "./GlobalSearchBox";

const meta: Meta<typeof GlobalSearchBox> = {
  title: "Search/GlobalSearchBox",
  component: GlobalSearchBox,
  args: { trending: ["iphone", "headphones", "generator", "laptop", "adire"] },
  beforeEach: () => clearRecentSearches(),
  decorators: [(Story) => <div style={{ minHeight: 380 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof GlobalSearchBox>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const box = canvas.getByRole("combobox", { name: "Search for anything" });
    expect(box).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(box);
    expect(box).toHaveAttribute("aria-expanded", "true");
    const trending = canvas.getByRole("group", { name: "Trending" });
    expect(within(trending).getAllByRole("option")).toHaveLength(5);

    // Typing narrows the list; arrows move the highlight via aria-activedescendant.
    await userEvent.type(box, "ge");
    expect(within(trending).getAllByRole("option").map((o) => o.textContent)).toEqual(["generator"]);
    await userEvent.keyboard("{ArrowDown}");
    expect(box.getAttribute("aria-activedescendant")).toBe(canvas.getByRole("option", { name: "generator" }).id);
    expect(canvas.getByRole("option", { name: "generator" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowDown}");
    expect(box).not.toHaveAttribute("aria-activedescendant"); // wrapped back to the text

    await userEvent.keyboard("{Escape}");
    expect(box).toHaveAttribute("aria-expanded", "false");
  },
};

export const WithQuery: Story = { args: { defaultValue: "headphones" } };
