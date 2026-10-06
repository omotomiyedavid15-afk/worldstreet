import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import type { Category } from "@/lib/data/types";
import type { CategoryTile } from "@/lib/home";
import { HERO_SLIDES } from "@/lib/copy/trust";
import { lekkiAnchor, STORY_NOW, storyListings } from "@/features/listing-card/story-data";
import { CategoryTiles } from "./CategoryTiles";
import { HeroCarousel } from "./HeroCarousel";
import { ProductRail } from "./ProductRail";
import { SellCta } from "./SellCta";
import { TrustStrip } from "./TrustStrip";

const meta: Meta = { title: "Home/Modules" };
export default meta;
type Story = StoryObj;

export const Trust: Story = {
  render: () => <TrustStrip />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("link", { name: "How escrow works" })).toHaveAttribute("href", "/help/escrow");
    await expect(c.getByText(/₦20,000/)).toBeInTheDocument();
  },
};

/* The APG carousel: rotation control first, "2 / 3" counter, slides labelled "n of 3". */
export const Hero: Story = {
  render: () => <HeroCarousel slides={HERO_SLIDES} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const hero = c.getByRole("region", { name: "Highlights" });
    const buttons = within(hero).getAllByRole("button");
    await expect(buttons[0]).toHaveAccessibleName(/slides$/);
    await userEvent.click(within(hero).getByRole("button", { name: "Pause slides" }));
    await expect(within(hero).getByRole("button", { name: "Play slides" })).toBeInTheDocument();
    await userEvent.click(within(hero).getByRole("button", { name: "Next slide" }));
    await expect(within(hero).getByRole("group", { name: "2 of 3" })).toBeInTheDocument();
    await expect(within(hero).getByText("2 / 3")).toBeInTheDocument();
  },
};

const cats = [...new Map(storyListings.map((l) => [l.category.id, l.category])).values()] as Category[];
const tiles: CategoryTile[] = cats.map((category, i) => ({ category, count: i === cats.length - 1 ? 3 : storyListings.filter((l) => l.category.id === category.id).length, scope: i === cats.length - 1 ? "nationwide" : "radius" }));

export const Categories: Story = {
  render: () => <CategoryTiles tiles={tiles} radius={25} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByText(/nearby$/).length).toBeGreaterThan(0);
    await expect(c.getByText("3 nationwide")).toBeInTheDocument();
  },
};

export const Rail: Story = {
  render: () => (
    <ProductRail
      id="story"
      eyebrow="Within 25 km of Lekki"
      title="Near you"
      seeAll={{ href: "/search?sort=nearest", srLabel: "listings near Lekki, nearest first" }}
      listings={storyListings.slice(0, 8)}
      anchor={lekkiAnchor}
      now={STORY_NOW}
    />
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("link", { name: "See all listings near Lekki, nearest first" })).toBeInTheDocument();
    await expect(c.getByRole("list", { name: "Near you" })).toBeInTheDocument();
  },
};

export const Sell: Story = {
  render: () => <SellCta />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("link", { name: "Start selling" })).toHaveAttribute("href", "/sell/start");
  },
};
