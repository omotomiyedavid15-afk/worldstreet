import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ToastViewport } from "@/components/ui";
import { signOut } from "@/features/auth/session";
import { unhide } from "@/features/hidden/store";
import { unsaveListing } from "@/features/saved/store";
import { ListingCard, ListingCardSkeleton } from "./ListingCard";
import { STORY_NOW, lekkiAnchor, storyListings } from "./story-data";

const meta: Meta<typeof ListingCard> = {
  title: "Listing card/ListingCard",
  component: ListingCard,
  beforeEach: () => {
    signOut();
    storyListings.forEach((l) => {
      unsaveListing(l.id);
      unhide("listing", l.id);
      unhide("seller", l.seller.id);
    });
  },
};
export default meta;
type Story = StoryObj<typeof ListingCard>;

export const Grid: Story = {
  render: () => (
    <>
      <div className="ws-card-grid">
        {storyListings.map((l, i) => (
          <ListingCard key={l.id} listing={l} anchor={lekkiAnchor} now={STORY_NOW} load={i < 2 ? "high" : "eager"} />
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
      // Save and the ⋮ menu are their own buttons, named for this listing.
      expect(within(card).getByRole("button", { name: `Save ${l.title}` })).toHaveAttribute("aria-pressed", "false");
      expect(within(card).getByRole("button", { name: `More actions for ${l.title}` })).toBeInTheDocument();
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

export const CompactDensity: Story = {
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

export const List: Story = {
  render: () => (
    <div className="ws-card-list" style={{ maxWidth: 900 }}>
      {storyListings.slice(0, 4).map((l) => (
        <ListingCard key={l.id} variant="list" listing={l} anchor={lekkiAnchor} now={STORY_NOW} />
      ))}
    </div>
  ),
};

export const ListMobile: Story = {
  ...List,
  globals: { viewport: { value: "mobile", isRotated: false } },
};

export const Rail: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--cx-s-4)", overflowX: "auto", paddingBlockEnd: 8 }}>
      {storyListings.map((l) => (
        <ListingCard key={l.id} variant="rail" listing={l} anchor={lekkiAnchor} now={STORY_NOW} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Rails drop the seller row and its menu; Save stays.
    const card = within(canvasElement).getAllByRole("article")[0];
    expect(within(card).queryByRole("button", { name: /More actions/ })).toBeNull();
    expect(within(card).getByRole("button", { name: /^Save / })).toBeInTheDocument();
  },
};

export const Compact: Story = {
  name: "Compact row",
  render: () => (
    <div className="ws-card-list" style={{ maxWidth: 360 }}>
      {storyListings.slice(0, 3).map((l) => (
        <ListingCard key={l.id} variant="compact" listing={l} />
      ))}
    </div>
  ),
};

export const HideAndUndo: Story = {
  render: () => (
    <div className="ws-card-grid" style={{ maxWidth: 960 }}>
      {storyListings.slice(0, 3).map((l) => (
        <ListingCard key={l.id} listing={l} anchor={lekkiAnchor} now={STORY_NOW} />
      ))}
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const sony = storyListings[0];
    await userEvent.click(canvas.getByRole("button", { name: `More actions for ${sony.title}` }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Not interested" }));
    const undo = await canvas.findByRole("button", { name: "Undo" });
    await waitFor(() => expect(undo).toHaveFocus()); // keyboard users aren't dropped
    expect(canvas.getByText("Hidden. You won't see this listing again.")).toBeInTheDocument();
    await userEvent.click(undo);
    await waitFor(() => expect(canvas.getByRole("link", { name: sony.title })).toBeInTheDocument());

    // Hiding a seller removes all their cards; only the one used offers Undo.
    await userEvent.click(canvas.getByRole("button", { name: `More actions for ${sony.title}` }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Hide Gadget Hub Ikeja" }));
    await waitFor(() => expect(canvas.queryByRole("link", { name: storyListings[1].title })).toBeNull());
    expect(canvas.getAllByRole("button", { name: "Undo" })).toHaveLength(1);
    expect(canvas.getByRole("link", { name: storyListings[2].title })).toBeInTheDocument();
  },
};
