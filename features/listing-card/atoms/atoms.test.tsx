import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ToastViewport } from "@/components/ui";
import { signIn, signOut } from "@/features/auth/session";
import { saveListing, unsaveListing } from "@/features/saved/store";
import type { DeliveryOption, Place } from "@/lib/data/types";
import { toMinor } from "@/lib/money";
import { ConditionChip, DeliveryLine, DiscountChip, FormatChip, LocationLine, PriceBlock, RatingStars, SaveButton, SellerMini, socialSignals } from "./index";

const NOW = Date.parse("2026-10-06T09:00:00Z");
const hoursFromNow = (h: number) => new Date(NOW + h * 3_600_000).toISOString();

describe("PriceBlock", () => {
  it("shows the price, the was price and eBay's '% off'", () => {
    render(<PriceBlock price_minor={toMinor(485_000)} was_minor={toMinor(560_000)} />);
    expect(screen.getByText("₦485,000")).toHaveClass("ws-price__now");
    expect(screen.getByText("₦560,000").tagName).toBe("S");
    expect(screen.getByText("13% off")).toHaveClass("cx-chip--gain");
  });

  it("spells out the saving on the detail page", () => {
    render(<PriceBlock variant="detail" price_minor={toMinor(485_000)} was_minor={toMinor(560_000)} />);
    expect(screen.getByText("Save ₦75,000 (13% off)")).toBeInTheDocument();
  });

  it("hides a was price that isn't a real reduction", () => {
    render(<PriceBlock price_minor={toMinor(100_000)} was_minor={toMinor(100_000)} />);
    expect(screen.queryByText(/Was/)).toBeNull();
  });

  it("adds 'or Best offer', unit price and the total to the buyer's area (R-003)", () => {
    render(
      <PriceBlock
        price_minor={toMinor(100_000)}
        bestOffer
        unitPrice={{ amount_minor: toMinor(1_200), unit: "kg" }}
        delivery_minor={toMinor(3_000)}
        showTotalTo="Lekki"
      />,
    );
    expect(screen.getByText("or Best offer")).toBeInTheDocument();
    expect(screen.getByText("(₦1,200/kg)")).toBeInTheDocument();
    expect(screen.getByText(/Total to Lekki/)).toHaveTextContent("Total to Lekki ₦103,000");
  });

  it("needs both delivery and an area before showing a total", () => {
    render(<PriceBlock price_minor={toMinor(100_000)} showTotalTo="Lekki" />);
    expect(screen.queryByText(/Total to/)).toBeNull();
  });
});

describe("chips", () => {
  it("uses eBay's condition names", () => {
    const { container } = render(
      <>
        <ConditionChip condition="new" />
        <ConditionChip condition="used" />
        <ConditionChip condition="for_parts" />
        <ConditionChip condition="refurbished" certified />
      </>,
    );
    expect(container).toHaveTextContent("Brand new");
    expect(container).toHaveTextContent("Pre-owned");
    expect(screen.getByText("For parts or not working")).toHaveClass("cx-chip--warning");
    expect(screen.getByText("Certified refurbished")).toHaveClass("cx-chip--brand");
  });

  it("never shows a discount chip without a real cut, and never in red", () => {
    const { container } = render(<DiscountChip price_minor={toMinor(120_000)} was_minor={toMinor(100_000)} />);
    expect(container).toBeEmptyDOMElement();
    render(<DiscountChip price_minor={toMinor(77_000)} was_minor={toMinor(100_000)} />);
    expect(screen.getByText("23% off")).not.toHaveClass("cx-chip--loss");
  });

  it("shows auction time left, then ended", () => {
    render(<FormatChip format="auction" endsAt={hoursFromNow(52)} now={NOW} />);
    expect(screen.getByText("Auction · 2d 4h")).toBeInTheDocument();
    render(<FormatChip format="auction" endsAt={hoursFromNow(-1)} now={NOW} />);
    expect(screen.getByText("Auction ended")).toBeInTheDocument();
  });
});

describe("RatingStars", () => {
  it("names the rating kind for screen readers", () => {
    render(<RatingStars value={4.86} count={52} />);
    expect(screen.getByRole("img", { name: "Item rating 4.9 out of 5, 52 ratings" })).toHaveTextContent("(52)");
  });

  it("renders nothing without ratings (PLAN F7)", () => {
    const { container } = render(<RatingStars value={5} count={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});

const lagos: Place = { area: "Ikeja GRA", city: "Lagos", state: "Lagos", lat: 6.58, lng: 3.36 };
const option = (method: DeliveryOption["method"], naira: number, coverage: DeliveryOption["coverage"]): DeliveryOption => ({
  method,
  fee_minor: toMinor(naira),
  eta_days: [1, 2],
  coverage,
});

describe("DeliveryLine", () => {
  const options = [option("rider", 2_500, "same_city"), option("courier", 4_500, "nationwide")];

  it("shows the fee and the total to the buyer's area", () => {
    const { container } = render(<DeliveryLine options={options} price_minor={toMinor(100_000)} listingCity="Lagos" buyer={{ city: "Lagos", label: "Lekki" }} />);
    expect(container).toHaveTextContent("+₦2,500 deliveryTotal to Lekki ₦102,500");
  });

  it("uses only options that reach the buyer's city", () => {
    const { container } = render(<DeliveryLine options={options} price_minor={toMinor(100_000)} listingCity="Lagos" buyer={{ city: "Abuja", label: "Wuse 2" }} />);
    expect(container).toHaveTextContent("+₦4,500 deliveryTotal to Wuse 2 ₦104,500");
  });

  it("covers free, pickup-only and no delivery", () => {
    render(<DeliveryLine options={[option("courier", 0, "nationwide")]} price_minor={toMinor(1_000)} listingCity="Lagos" />);
    expect(screen.getByText("Free delivery")).toHaveClass("ws-delivery__free");
    render(<DeliveryLine options={[option("meet_up", 0, "same_city")]} price_minor={toMinor(1_000)} listingCity="Lagos" buyer={{ city: "Lagos", label: "Yaba" }} />);
    expect(screen.getByText("Pickup only")).toBeInTheDocument();
    expect(screen.queryByText(/Total to Yaba/)).toBeNull();
    render(<DeliveryLine options={[option("rider", 15_000, "same_city")]} price_minor={toMinor(1_000)} listingCity="Lagos" buyer={{ city: "Abuja", label: "Garki" }} />);
    expect(screen.getByText("Doesn't deliver to Abuja")).toBeInTheDocument();
  });
});

describe("LocationLine", () => {
  it("shows area, distance and age, with words for screen readers", () => {
    const { container } = render(<LocationLine place={lagos} distanceKm={4.24} postedAt={hoursFromNow(-72)} now={NOW} />);
    expect(container).toHaveTextContent("Ikeja GRA·4.2 km away·3d agoListed 3 days ago");
    expect(screen.getByText("3d ago")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("time")).toHaveAttribute("dateTime", hoursFromNow(-72));
  });

  it("names the city when the item is far or there's no anchor", () => {
    render(<LocationLine place={lagos} distanceKm={528} />);
    expect(screen.getByText("Ikeja GRA, Lagos")).toBeInTheDocument();
  });
});

describe("socialSignals", () => {
  it("leads with scarcity, then sales, at most two", () => {
    expect(socialSignals({ qty: 1, sold_count: 64, watchers: 22, in_carts: 4 }, { showWatchers: true })).toEqual([
      { text: "Last one", urgent: true },
      { text: "64 sold" },
    ]);
    expect(socialSignals({ qty: 3, sold_count: 5 })[0]).toEqual({ text: "Almost gone", urgent: true });
  });

  it("keeps watchers private unless shown and over the threshold (R-025)", () => {
    expect(socialSignals({ qty: 5, watchers: 22 })).toEqual([]);
    expect(socialSignals({ qty: 5, watchers: 10 }, { showWatchers: true })).toEqual([]);
    expect(socialSignals({ qty: 5, watchers: 11, in_carts: 1 }, { showWatchers: true })).toEqual([{ text: "11 watchers" }, { text: "In 1 cart" }]);
  });

  it("says nothing without data, even for a single used item (PLAN F7)", () => {
    expect(socialSignals({ qty: 1 })).toEqual([]);
  });
});

describe("SellerMini", () => {
  const seller = { shop_name: "Gadget Hub Ikeja", handle: "gadgethub-ikeja", verified: true, top_rated: true, feedback: { positive_percent: 99.2, count: 1284 } };

  it("shows eBay's feedback line, verified tick and top-rated badge", () => {
    const { container } = render(<SellerMini seller={seller} />);
    expect(container).toHaveTextContent("Seller feedback: 99.2% positive (1,284)");
    expect(screen.getByRole("img", { name: "Verified seller" })).toBeInTheDocument();
    expect(screen.getByText("Top rated")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull(); // cards have one link
  });

  it("links to the shop when asked", () => {
    render(<SellerMini seller={{ ...seller, verified: false, top_rated: false }} link />);
    expect(screen.getByRole("link", { name: "Gadget Hub Ikeja" })).toHaveAttribute("href", "/seller/gadgethub-ikeja");
  });
});

describe("SaveButton", () => {
  beforeEach(() => {
    act(() => {
      signOut();
      unsaveListing("204507");
    });
  });

  const setup = () => {
    const user = userEvent.setup();
    render(
      <>
        <SaveButton listingId="204507" title="Sony WH-1000XM5" />
        <ToastViewport />
      </>,
    );
    return { user, button: screen.getByRole("button", { name: "Save Sony WH-1000XM5" }), toasts: screen.getByRole("status", { name: "Notifications" }) };
  };

  it("asks a guest to sign in, then completes the save (R-004)", async () => {
    const { user, button, toasts } = setup();
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(within(toasts).getByRole("button", { name: "Sign in" }));
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(toasts).toHaveTextContent("Added to Saved");
    expect(within(toasts).getByRole("link", { name: "View" })).toHaveAttribute("href", "/saved");
  });

  it("toggles for a signed-in buyer, keeps its name, and can undo a removal", async () => {
    act(() => signIn());
    const { user, button, toasts } = setup();
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveAccessibleName("Save Sony WH-1000XM5");
    await user.click(within(toasts).getAllByRole("button", { name: "Undo" }).at(-1)!);
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("refuses to save past the cap instead of dropping old saves (R-027)", async () => {
    act(() => {
      signIn();
      for (let i = 0; i < 500; i++) saveListing(`filler${i}`);
    });
    const { user, button, toasts } = setup();
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(toasts).toHaveTextContent("Saved is full (500 listings)");
    act(() => {
      for (let i = 0; i < 500; i++) unsaveListing(`filler${i}`);
    });
  });
});
