import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { storyListings } from "@/features/listing-card/story-data";
import { kobo } from "@/lib/money";
import { RevisionHistory, SellerNotes } from "./RevisionHistory";
import { UnavailableState } from "./Unavailable";

const meta: Meta = { title: "Listing detail/Unavailable and history" };
export default meta;
type Story = StoryObj;

const sony = storyListings[0];
const common = { listingId: sony.id, title: sony.title, price_minor: sony.price_minor, similarHref: "#rail-similar", shopHref: "/seller/gadgethub-ikeja", messageHref: "/inbox?seller=gadgethub-ikeja" };

export const Sold: Story = {
  render: () => <div style={{ maxWidth: 420 }}><UnavailableState availability="sold" {...common} /></div>,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("This item has sold")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "See similar items" })).toHaveAttribute("href", "#rail-similar");
    await expect(canvas.queryByRole("button", { name: /Save/ })).toBeNull(); // nothing to save for
  },
};
export const Ended: Story = { render: () => <div style={{ maxWidth: 420 }}><UnavailableState availability="ended" {...common} /></div> };
export const OutOfStock: Story = {
  render: () => <div style={{ maxWidth: 420 }}><UnavailableState availability="paused" {...common} /></div>,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: `Save ${sony.title}` })).toBeInTheDocument();
  },
};
export const OfferPending: Story = {
  render: () => <div style={{ maxWidth: 420 }}><UnavailableState availability="reserved" {...common} /></div>,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Offer pending")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "Message seller" })).toBeInTheDocument();
  },
};

export const History: Story = {
  render: () => (
    <RevisionHistory
      listedAt="2026-09-20T09:00:00Z"
      revisions={[
        { at: "2026-09-25T09:00:00Z", change: "price", from_minor: kobo(56_000_000), to_minor: kobo(48_500_000) },
        { at: "2026-10-01T09:00:00Z", change: "description" },
      ]}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    const button = canvas.getByRole("button", { name: "View history (2)" });
    await userEvent.click(button);
    const dialog = within(canvasElement.ownerDocument.body).getByRole("dialog", { name: "Revision history" });
    const rows = within(dialog).getAllByRole("listitem");
    await expect(rows.map((r) => r.textContent)).toEqual([expect.stringContaining("Description edited"), expect.stringContaining("Price lowered from ₦560,000 to ₦485,000"), expect.stringContaining("Listed")]);
    // A scripted Escape is untrusted, so the native dialog ignores it (the e2e test presses
    // the real key). Close with the button; the dialog hands focus back either way.
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await expect(button).toHaveFocus();
  },
};

export const Notes: Story = {
  render: () => <div style={{ maxWidth: 560 }}><SellerNotes notes="Battery health 89%. Light marks on the frame, screen is perfect." shopName="Gadget Hub Ikeja" /></div>,
};
