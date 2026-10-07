import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Tabs } from "@/components/ui";
import { STORY_NOW, storyListings } from "@/features/listing-card/story-data";
import type { Review, ReviewTopic } from "@/lib/data/types";
import { dimensionAverages } from "@/lib/reviews";
import { ReviewsSection } from "./Reviews";
import { SellerCard } from "./SellerCard";

const meta: Meta = { title: "Listing detail/Seller and reviews" };
export default meta;
type Story = StoryObj;

const sony = storyListings[0];
const day = 86_400_000;

/* Story data: a handful of fictional reviews, enough to page and filter. */
function review(i: number, rating: Review["rating"], topics: ReviewTopic[], listing_id = sony.id, extra: Partial<Review> = {}): Review {
  return {
    id: `story-r${i}`,
    listing_id,
    seller_id: sony.seller_id,
    buyer: ["o***a", "c***a", "t***e", "a***a", "e***a"][i % 5],
    buyer_feedback_count: 10 + i * 7,
    rating,
    dimensions: { accuracy: rating, delivery: 5, communication: 5, packaging: Math.max(1, rating - 1) },
    text: `Review ${i + 1}: ${rating >= 4 ? "Happy with it." : "Not as described."}`,
    topics,
    created_at: new Date(STORY_NOW - i * 20 * day).toISOString(),
    ...extra,
  };
}

const itemReviews: Review[] = Array.from({ length: 8 }, (_, i) =>
  review(i, i === 6 ? 2 : i % 3 === 0 ? 4 : 5, i % 2 ? ["delivery"] : ["as_described", "quality"], sony.id, i === 6 ? { reply: { text: "Sorry, we've refunded you.", created_at: new Date(STORY_NOW).toISOString() } } : {}),
);
const sellerReviews: Review[] = [...itemReviews, review(20, 5, ["value"], "204501"), review(21, 4, ["packaging"], "204501")];
const titles = Object.fromEntries(storyListings.map((l) => [l.id, l.title]));

export const Reviews: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <ReviewsSection itemReviews={itemReviews} sellerReviews={sellerReviews} shopName={sony.seller.shop_name} titles={titles} now={STORY_NOW} />
    </div>
  ),
  play: async ({ canvas }) => {
    // This item first, showing 5 of 8 with "Show 3 more".
    const itemTab = canvas.getByRole("tab", { name: /This item \(8\)/ });
    await expect(itemTab).toHaveAttribute("aria-selected", "true");
    const panel = canvas.getByRole("tabpanel");
    await expect(within(panel).getAllByRole("article")).toHaveLength(5);
    await expect(within(panel).getAllByText("Verified purchase")).toHaveLength(5);
    // R-073: the summary names whose rating it is.
    await expect(within(panel).getByRole("img", { name: /^Item rating 4\.\d out of 5, 8 ratings$/ })).toBeInTheDocument();

    await userEvent.click(within(panel).getByRole("button", { name: "Show 3 more reviews" }));
    await expect(within(panel).getAllByRole("article")).toHaveLength(8);
    await expect(canvas.getByRole("status")).toHaveTextContent("3 more reviews shown");

    // Topic chips are toggles that filter the list.
    const delivery = within(panel).getByRole("button", { name: "Delivery (4)" });
    await userEvent.click(delivery);
    await expect(delivery).toHaveAttribute("aria-pressed", "true");
    await expect(within(panel).getAllByRole("article")).toHaveLength(4);

    // Arrow keys move between tabs (ARIA tabs), and the seller tab says what was bought.
    itemTab.focus();
    await userEvent.keyboard("{ArrowRight}");
    const sellerTab = canvas.getByRole("tab", { name: `All items from ${sony.seller.shop_name} (10)` });
    await expect(sellerTab).toHaveFocus();
    await expect(sellerTab).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(canvas.getByRole("img", { name: /^Seller rating/ })).toBeInTheDocument());
    await expect(canvas.getAllByText(/^Bought: /).length).toBeGreaterThan(0);
  },
};

export const NoReviewsYet: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <ReviewsSection itemReviews={[]} sellerReviews={sellerReviews} shopName={sony.seller.shop_name} titles={titles} now={STORY_NOW} />
    </div>
  ),
};

export const ItemWithoutReviews: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <ReviewsSection itemReviews={[]} sellerReviews={[]} shopName={sony.seller.shop_name} titles={titles} now={STORY_NOW} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 3, name: "No reviews of this item yet" })).toBeInTheDocument();
  },
};

export const AboutTheSeller: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <SellerCard seller={sony.seller} listingId={sony.id} dimensions={dimensionAverages(sellerReviews)} ratingCount={sellerReviews.length} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /Visit shop/ })).toHaveAttribute("href", `/seller/${sony.seller.handle}`);
    await expect(canvas.getByText(/positive/)).toBeInTheDocument();
    for (const label of ["Accurate description", "Delivery speed", "Communication", "Packaging"]) await expect(canvas.getByText(label)).toBeInTheDocument();
    await expect(canvas.getByText("Average from 10 reviews of this seller's items")).toBeInTheDocument();
  },
};

function TabsDemo({ slide }: { slide?: boolean }) {
  const [v, setV] = useState("1w");
  const items = ["1d", "1w", "1m", "1y", "all"].map((value) => ({ value, label: value.toUpperCase() }));
  return <Tabs aria-label="Chart range" items={items} value={v} onChange={setV} slide={slide} />;
}

export const TabsSegmented: Story = {
  render: () => <TabsDemo slide />,
  play: async ({ canvas }) => {
    const tabs = canvas.getAllByRole("tab");
    await expect(tabs[1]).toHaveAttribute("tabindex", "0");
    await expect(tabs[0]).toHaveAttribute("tabindex", "-1"); // roving focus
    tabs[1].focus();
    await userEvent.keyboard("{End}");
    await expect(tabs[4]).toHaveFocus();
    await expect(tabs[4]).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowRight}");
    await expect(tabs[0]).toHaveAttribute("aria-selected", "true"); // wraps
  },
};
