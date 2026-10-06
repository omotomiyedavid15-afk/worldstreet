import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { storyListings } from "@/features/listing-card/story-data";
import { unsaveListing } from "@/features/saved/store";
import { BuyActions } from "./BuyActions";
import { Gallery } from "./Gallery";
import { DemandLine, ReassuranceLine } from "./Lines";
import { StickyBuyBar } from "./StickyBuyBar";

const meta: Meta = {
  title: "Listing detail/Buy box",
  beforeEach: () => storyListings.forEach((l) => unsaveListing(l.id)),
};
export default meta;
type Story = StoryObj;

const sony = storyListings[0];
const kaftan = storyListings[2];

/* Arrows and ← → move the strip; the counter follows; a photo opens full screen and
   closing it gives focus back. */
export const Photos: Story = {
  render: () => (
    <div className="ws-listing" style={{ maxWidth: 640 }}>
      <Gallery listingId={sony.id} title={sony.title} media={sony.media} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const count = canvasElement.querySelector(".ws-gallery__count")!;
    await expect(count).toHaveTextContent(`1 / ${sony.media.length}`);
    await userEvent.click(canvas.getByRole("button", { name: "Next photo" }));
    await waitFor(() => expect(count).toHaveTextContent(`2 / ${sony.media.length}`));
    await userEvent.click(canvas.getByRole("button", { name: "Photo 4 of 6" }));
    await waitFor(() => expect(count).toHaveTextContent("4 / 6"));
    await expect(canvas.getByRole("button", { name: "Photo 4 of 6" })).toHaveAttribute("aria-current", "true");

    const slide = canvas.getByRole("button", { name: "View photo 4 full screen", hidden: true });
    await userEvent.click(slide);
    const dialog = within(canvasElement.ownerDocument.body).getByRole("dialog", { name: `${sony.title}: photos` });
    await waitFor(() => expect(dialog).toHaveAttribute("open"));
    // Synthetic keys don't reach a native dialog's Escape; the e2e presses the real key.
    await userEvent.click(within(dialog).getByRole("button", { name: "Close photos" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
  },
};

/* eBay's order: quantity, Buy it now (the one solid button), Add to cart, Save. The
   quantity rides along to checkout and stops at what's in stock. */
export const Goods: Story = {
  render: () => (
    <section className="ws-buybox" style={{ maxWidth: 380 }}>
      <ReassuranceLine listing={sony} />
      <BuyActions listingId={sony.id} title={sony.title} price_minor={sony.price_minor} available={2} sold={sony.sold_count} kind="goods" offers={false} />
      <DemandLine listing={sony} />
    </section>
  ),
  play: async ({ canvas }) => {
    const buy = canvas.getByRole("link", { name: "Buy it now" });
    await expect(buy).toHaveAttribute("href", `/checkout?listing=${sony.id}`);
    await userEvent.click(canvas.getByRole("button", { name: "One more" }));
    await expect(buy).toHaveAttribute("href", `/checkout?listing=${sony.id}&qty=2`);
    await expect(canvas.getByRole("button", { name: "One more" })).toBeDisabled();
    await expect(canvas.getByRole("link", { name: "Add to cart" })).toHaveAttribute("href", `/cart?listing=${sony.id}&qty=2`);
    await expect(canvas.queryByRole("link", { name: "Make offer" })).toBeNull();
    // Real counts only, and watchers only where the seller allows it (R-025).
    await expect(canvas.getByText(/31 people watching/)).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "How escrow works" })).toBeInTheDocument();
  },
};

/* Vehicles and property have no checkout (PLAN risk 7): Contact seller instead. */
export const Property: Story = {
  render: () => (
    <section className="ws-buybox" style={{ maxWidth: 380 }}>
      <BuyActions listingId={kaftan.id} title={kaftan.title} price_minor={kaftan.price_minor} available={1} kind="property" offers />
    </section>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Contact seller" })).toHaveAttribute("href", `/inbox?listing=${kaftan.id}`);
    await expect(canvas.getByRole("link", { name: "Book a viewing" })).toBeInTheDocument();
    await expect(canvas.queryByRole("link", { name: "Buy it now" })).toBeNull();
  },
};

/* The phone bar stays out of the way (and out of the tab order) while the buy box's
   buttons are on screen. */
export const StickyBar: Story = {
  globals: { viewport: { value: "mobile" } },
  render: () => (
    <div>
      <div id="story-actions">
        <a href="/checkout">Buy it now</a>
      </div>
      <StickyBuyBar watch="story-actions" listingId={sony.id} title={sony.title} price="₦485,000" price_minor={sony.price_minor} total="Total to Lekki ₦489,500" action={{ label: "Buy it now", href: `/checkout?listing=${sony.id}` }} share={{ url: "https://worldstreet.example/listing/204507", title: sony.title, text: sony.title }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector(".ws-stickybuy")!;
    await expect(bar).toHaveAttribute("data-shown", "false");
    await expect(bar).toHaveAttribute("inert");
  },
};
