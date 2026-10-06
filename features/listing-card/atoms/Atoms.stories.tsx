import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ToastViewport } from "@/components/ui";
import { signIn, signOut } from "@/features/auth/session";
import { saveListing, unsaveListing } from "@/features/saved/store";
import type { DeliveryOption, Place } from "@/lib/data/types";
import { toMinor } from "@/lib/money";
import { ConditionChip, DeliveryLine, DiscountChip, FormatChip, LocationLine, PriceBlock, RatingStars, SaveButton, SellerMini, SocialProof } from "./index";

/* Story data is inline on purpose: features/ may not import mocks/ (PLAN §2.2). */
const NOW = Date.parse("2026-10-06T09:00:00Z");
const ago = (days: number) => new Date(NOW - days * 86_400_000).toISOString();
const ikeja: Place = { area: "Ikeja GRA", city: "Lagos", state: "Lagos", lat: 6.5833, lng: 3.3557 };
const wuse: Place = { area: "Wuse 2", city: "Abuja", state: "FCT", lat: 9.0801, lng: 7.4694 };
const opt = (method: DeliveryOption["method"], naira: number, coverage: DeliveryOption["coverage"]): DeliveryOption => ({
  method,
  fee_minor: toMinor(naira),
  eta_days: [1, 2],
  coverage,
});
const lagosDelivery = [opt("rider", 2_500, "same_city"), opt("meet_up", 0, "same_city"), opt("courier", 4_500, "nationwide")];
const gadgetHub = { shop_name: "Gadget Hub Ikeja", handle: "gadgethub-ikeja", verified: true, top_rated: true, feedback: { positive_percent: 99.2, count: 1284 } };

const meta: Meta = { title: "Listing card/Atoms" };
export default meta;
type Story = StoryObj;

const stack = { display: "grid", gap: 24, alignItems: "start" } as const;
const row = { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" } as const;

export const Prices: Story = {
  render: () => (
    <div style={{ ...stack, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
      <PriceBlock price_minor={toMinor(485_000)} was_minor={toMinor(560_000)} delivery_minor={toMinor(2_500)} showTotalTo="Lekki" />
      <PriceBlock price_minor={toMinor(845_000)} bestOffer />
      <PriceBlock variant="detail" price_minor={toMinor(485_000)} was_minor={toMinor(560_000)} bestOffer delivery_minor={toMinor(0)} showTotalTo="Lekki" />
      <PriceBlock variant="cart" price_minor={toMinor(54_000)} was_minor={toMinor(62_000)} unitPrice={{ amount_minor: toMinor(5_400), unit: "piece" }} />
      <PriceBlock variant="sticky" price_minor={toMinor(485_000)} was_minor={toMinor(560_000)} delivery_minor={toMinor(2_500)} showTotalTo="Lekki" />
      <PriceBlock price_minor={toMinor(1_250.5)} />
    </div>
  ),
  play: async ({ canvas }) => {
    expect(canvas.getByText("Save ₦75,000 (13% off)")).toBeInTheDocument();
    expect(canvas.getAllByText("13% off")[0]).toHaveClass("cx-chip--gain");
    expect(canvas.getByText("₦1,250.50")).toBeInTheDocument();
  },
};

export const Chips: Story = {
  render: () => (
    <div style={stack}>
      <div style={row}>
        <ConditionChip condition="new" />
        <ConditionChip condition="like_new" />
        <ConditionChip condition="refurbished" />
        <ConditionChip condition="refurbished" certified />
        <ConditionChip condition="used" />
        <ConditionChip condition="for_parts" />
      </div>
      <div style={row}>
        <FormatChip format="buy_now" />
        <FormatChip format="best_offer" />
        <FormatChip format="auction" endsAt={new Date(NOW + 52 * 3_600_000).toISOString()} now={NOW} />
        <FormatChip format="auction" endsAt={ago(1)} now={NOW} />
      </div>
      <div style={row}>
        <DiscountChip price_minor={toMinor(77_000)} was_minor={toMinor(100_000)} />
        <DiscountChip price_minor={toMinor(38_500)} was_minor={toMinor(48_000)} />
      </div>
    </div>
  ),
};

export const Ratings: Story = {
  render: () => (
    <div style={stack}>
      <RatingStars value={4.9} count={52} />
      <RatingStars value={4.5} count={9} />
      <RatingStars value={3.2} count={1284} />
      <RatingStars value={5} count={7} size="lg" />
      <RatingStars value={4.8} count={36} kind="seller" />
      <RatingStars value={4} count={0} />
    </div>
  ),
  play: async ({ canvas }) => {
    expect(canvas.getByRole("img", { name: "Item rating 4.9 out of 5, 52 ratings" })).toBeInTheDocument();
    expect(canvas.getByRole("img", { name: "Seller rating 4.8 out of 5, 36 ratings" })).toBeInTheDocument();
    expect(canvas.getAllByRole("img", { name: /rating/ })).toHaveLength(5); // zero ratings render nothing
  },
};

export const MetaLines: Story = {
  render: () => (
    <div style={stack}>
      <DeliveryLine options={lagosDelivery} price_minor={toMinor(100_000)} listingCity="Lagos" buyer={{ city: "Lagos", label: "Lekki" }} />
      <DeliveryLine options={lagosDelivery} price_minor={toMinor(100_000)} listingCity="Lagos" buyer={{ city: "Abuja", label: "Wuse 2" }} />
      <DeliveryLine options={[opt("courier", 0, "nationwide")]} price_minor={toMinor(485_000)} listingCity="Lagos" buyer={{ city: "Lagos", label: "Lekki" }} />
      <DeliveryLine options={[opt("meet_up", 0, "same_city")]} price_minor={toMinor(132_000)} listingCity="Lagos" />
      <DeliveryLine options={[opt("rider", 15_000, "same_city")]} price_minor={toMinor(365_000)} listingCity="Lagos" buyer={{ city: "Abuja", label: "Garki" }} />
      <LocationLine place={ikeja} distanceKm={4.2} postedAt={ago(3)} now={NOW} />
      <LocationLine place={wuse} distanceKm={528} postedAt={ago(0.02)} now={NOW} />
      <LocationLine place={ikeja} postedAt={ago(40)} now={NOW} />
      <SocialProof listing={{ qty: 1, sold_count: 64, watchers: 22 }} showWatchers />
      <SocialProof listing={{ qty: 12, sold_count: 38, watchers: 31, in_carts: 6 }} showWatchers />
      <SocialProof listing={{ qty: 20, in_carts: 4 }} />
    </div>
  ),
};

export const Sellers: Story = {
  render: () => (
    <div style={stack}>
      <SellerMini seller={gadgetHub} />
      <SellerMini seller={gadgetHub} avatar link />
      <SellerMini seller={{ shop_name: "Tunde's Corner", handle: "tunde-sells", verified: false, top_rated: false, feedback: { positive_percent: 100, count: 4 } }} />
    </div>
  ),
};

/** The heart over a photo, as on eBay's cards. */
const Photo = ({ id, title }: { id: string; title: string }) => (
  <div style={{ position: "relative", width: 220, aspectRatio: "1", borderRadius: "var(--cx-r-md)", overflow: "hidden" }}>
    {/* eslint-disable-next-line @next/next/no-img-element -- story fixture, not app code */}
    <img src="/mock/img/electronics.svg" alt="" width={220} height={220} style={{ width: "100%", height: "100%" }} />
    <div style={{ position: "absolute", top: 8, right: 8 }}>
      <SaveButton listingId={id} title={title} />
    </div>
  </div>
);

export const Save: Story = {
  beforeEach: () => {
    signOut();
    unsaveListing("story-1");
    unsaveListing("story-2");
    saveListing("story-2");
  },
  render: () => (
    <>
      <div style={row}>
        <Photo id="story-1" title="Sony WH-1000XM5" />
        <Photo id="story-2" title="JBL Tune 520BT" />
      </div>
      <ToastViewport />
    </>
  ),
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const sony = canvas.getByRole("button", { name: "Save Sony WH-1000XM5" });
    expect(canvas.getByRole("button", { name: "Save JBL Tune 520BT" })).toHaveAttribute("aria-pressed", "true");

    // Guest: asked to sign in, and the save happens after (R-004).
    sony.focus();
    await userEvent.keyboard("{Enter}");
    expect(sony).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(await body.findByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(sony).toHaveAttribute("aria-pressed", "true"));
    await waitFor(() => expect(body.getByRole("status", { name: "Notifications" })).toHaveTextContent("Added to Saved"));

    // Signed in: Space toggles it back off.
    sony.focus();
    await userEvent.keyboard(" ");
    await waitFor(() => expect(sony).toHaveAttribute("aria-pressed", "false"));
  },
};

export const SignedInSave: Story = {
  beforeEach: () => {
    signIn();
    unsaveListing("story-3");
  },
  render: () => (
    <>
      <Photo id="story-3" title="Oraimo FreePods 4" />
      <ToastViewport />
    </>
  ),
};
