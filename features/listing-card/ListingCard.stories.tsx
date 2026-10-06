import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ToastViewport } from "@/components/ui";
import { signOut } from "@/features/auth/session";
import { unsaveListing } from "@/features/saved/store";
import { ListingCard, ListingCardSkeleton } from "./ListingCard";
import { STORY_NOW, lekkiAnchor, storyListings } from "./story-data";

const meta: Meta<typeof ListingCard> = {
  title: "Listing card/ListingCard",
  component: ListingCard,
  beforeEach: () => {
    signOut();
    storyListings.forEach((l) => unsaveListing(l.id));
  },
};
export default meta;
type Story = StoryObj<typeof ListingCard>;

export const Grid: Story = {
  render: () => (
    <>
      <div className="ws-card-grid">
        {storyListings.map((l, i) => (
          <ListingCard key={l.id} listing={l} anchor={lekkiAnchor} now={STORY_NOW} priority={i < 4} />
        ))}
      </div>
      <ToastViewport />
    </>
  ),
  play: async ({ canvasElement }) => {
    const cards = within(canvasElement).getAllByRole("article");
    expect(cards).toHaveLength(storyListings.length);
    for (const [i, card] of cards.entries()) {
      const l = storyListings[i];
      // One link per card, to /listing/:id-:slug (spec §16.6, R-011).
      const links = within(card).getAllByRole("link");
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute("href", `/listing/${l.id}-${l.slug}`);
      expect(links[0]).toHaveAccessibleName(l.title);
      // Save is its own button, named for this listing.
      expect(within(card).getByRole("button", { name: `Save ${l.title}` })).toHaveAttribute("aria-pressed", "false");
      // The photo fills the card's width.
      const photo = card.querySelector(".ws-card__media")!;
      expect(Math.round(photo.getBoundingClientRect().width)).toBe(Math.round(card.getBoundingClientRect().width));
    }
  },
};

export const GridMobile: Story = {
  ...Grid,
  globals: { viewport: { value: "mobile", isRotated: false } },
};

export const NoAnchor: Story = {
  name: "Without a buyer location",
  render: () => (
    <div className="ws-card-grid" style={{ maxWidth: 640 }}>
      <ListingCard listing={storyListings[0]} now={STORY_NOW} />
      <ListingCard listing={storyListings[5]} now={STORY_NOW} />
    </div>
  ),
};

export const Compact: Story = {
  name: "Compact density",
  render: () => (
    <div className="ws-card-grid" data-density="compact" style={{ maxWidth: 720 }}>
      {storyListings.slice(0, 3).map((l) => (
        <ListingCard key={l.id} listing={l} anchor={lekkiAnchor} now={STORY_NOW} />
      ))}
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="ws-card-grid" role="status" aria-busy="true" aria-label="Loading listings">
      <ListingCard listing={storyListings[0]} anchor={lekkiAnchor} now={STORY_NOW} />
      <ListingCardSkeleton />
      <ListingCardSkeleton />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // The skeleton occupies the same box as a real card (no layout shift, spec §5.2).
    const [card, skeleton] = canvasElement.querySelectorAll<HTMLElement>(".ws-card");
    const media = (el: HTMLElement) => el.querySelector(".ws-card__media")!.getBoundingClientRect();
    expect(media(skeleton).height).toBe(media(card).height);
  },
};
