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

    // ↓ puts the suggestion in the field; ↑ past the top comes back to what was typed.
    const first = canvas.getAllByRole("option")[0];
    await userEvent.keyboard("{ArrowDown}");
    expect(box).toHaveValue("iphone");
    expect(box.getAttribute("aria-activedescendant")).toBe(first.id);
    await userEvent.keyboard("{ArrowUp}");
    expect(box).toHaveValue("");
    expect(box).not.toHaveAttribute("aria-activedescendant");

    // Escape restores the typed text and closes; it never wipes the field.
    await userEvent.type(box, "g");
    await userEvent.keyboard("{Escape}");
    expect(box).toHaveValue("g");
    await userEvent.keyboard("{Escape}");
    expect(box).toHaveValue("g");

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

/* Two letters or more: live rows from /api/suggest, in groups (mocked here). */
export const LiveSuggestions: Story = {
  args: { scopes: [{ id: "electronics", name: "Electronics" }] },
  beforeEach: () => {
    const real = window.fetch;
    window.fetch = async (input, init) =>
      String(input).startsWith("/api/suggest")
        ? Response.json({
            items: [
              { kind: "query", text: "headphones" },
              { kind: "category", text: "head", cat: "electronics", name: "Electronics" },
              { kind: "seller", text: "Gadget Hub Ikeja", href: "/seller/gadgethub-ikeja" },
              { kind: "listing", text: "JBL Tune 520BT On-Ear Headphones", href: "/listing/204508-jbl" },
            ],
          })
        : real(input, init);
    return () => {
      window.fetch = real;
    };
  },
  play: async ({ canvas }) => {
    const box = canvas.getByRole("combobox", { name: "Search for anything" });
    await userEvent.type(box, "head");
    const searches = await canvas.findByRole("group", { name: "Searches" });
    expect(within(searches).getAllByRole("option").map((o) => o.textContent)).toEqual(["headphones", "head in Electronics"]);
    expect(canvas.getByRole("group", { name: "Sellers" })).toBeInTheDocument();
    expect(canvas.getByRole("group", { name: "Listings" })).toBeInTheDocument();
    expect(canvas.getByRole("combobox", { name: "Search in" })).toHaveValue("");
  },
};
