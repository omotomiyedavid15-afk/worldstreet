import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { addRecentSearch, clearRecentSearches } from "./recent";
import { GlobalSearchBox } from "./GlobalSearchBox";

const meta: Meta<typeof GlobalSearchBox> = {
  title: "Search/GlobalSearchBox",
  component: GlobalSearchBox,
  args: { trending: ["iphone", "headphones", "generator", "laptop", "adire"] },
  beforeEach: () => clearRecentSearches(),
  decorators: [(Story) => <div style={{ minHeight: 420 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof GlobalSearchBox>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const box = canvas.getByRole("combobox", { name: "Search for anything" });
    expect(box).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(box);
    expect(box).toHaveAttribute("aria-expanded", "true");
    expect(within(canvas.getByRole("group", { name: "Trending" })).getAllByRole("option")).toHaveLength(5);

    // Typing narrows by word prefix; the part not typed is bold.
    await userEvent.type(box, "ge");
    const generator = canvas.getByRole("option", { name: "generator" });
    expect(canvas.getAllByRole("option")).toEqual([generator]);
    expect(generator.querySelector("b")).toHaveTextContent("nerator");

    // ↓ puts the suggestion in the field; past the end comes back to what was typed.
    await userEvent.keyboard("{ArrowDown}");
    expect(box).toHaveValue("generator");
    expect(box.getAttribute("aria-activedescendant")).toBe(generator.id);
    await userEvent.keyboard("{ArrowDown}");
    expect(box).toHaveValue("ge");
    expect(box).not.toHaveAttribute("aria-activedescendant");

    // Escape restores the typed text and closes; it never wipes the field.
    await userEvent.keyboard("{ArrowDown}{Escape}");
    expect(box).toHaveValue("ge");
    expect(box).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{Escape}");
    expect(box).toHaveValue("ge");

    // Clear empties the field and keeps focus.
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    expect(box).toHaveValue("");
    expect(box).toHaveFocus();
  },
};

export const RecentSearches: Story = {
  beforeEach: () => {
    clearRecentSearches();
    addRecentSearch("adire kaftan");
    addRecentSearch("ps5");
  },
  play: async ({ canvas }) => {
    const box = canvas.getByRole("combobox", { name: "Search for anything" });
    await userEvent.click(box);
    const recent = () => within(canvas.getByRole("group", { name: "Recent searches" }));
    expect(recent().getAllByRole("option").map((o) => o.textContent)).toEqual(["ps5", "adire kaftan"]);
    // Trending doesn't repeat a recent search.
    expect(within(canvas.getByRole("group", { name: "Trending" })).queryByRole("option", { name: "adire" })).not.toBeNull();
    // Shift+Delete removes the highlighted recent search.
    await userEvent.keyboard("{ArrowDown}{Shift>}{Delete}{/Shift}");
    expect(recent().getAllByRole("option").map((o) => o.textContent)).toEqual(["adire kaftan"]);
  },
};

export const WithQuery: Story = { args: { defaultValue: "headphones" } };
