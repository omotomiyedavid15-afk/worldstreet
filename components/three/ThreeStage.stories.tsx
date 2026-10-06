import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { storyListings } from "@/features/listing-card/story-data";
import { HeroStage } from "./HeroStage";
import { PhotoViewer3D } from "./PhotoViewer3D";

const meta: Meta = { title: "Motion/3D", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;

const listing = storyListings.find((l) => l.media.length >= 4) ?? storyListings[0];

/* The home hero backdrop with the headline over it, as S0.10 will use it. */
export const Hero: Story = {
  render: () => (
    <div style={{ position: "relative", height: 520 }}>
      <HeroStage className="ws-hero__stage" />
      <div style={{ position: "relative", display: "grid", placeItems: "center", height: "100%", textAlign: "center", pointerEvents: "none" }}>
        <h1 className="cx-h1">Buy and sell near you</h1>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // The fallback is in the page from the first render, 3D or not.
    await expect(canvasElement.querySelector(".ws-stage__glow")).not.toBeNull();
  },
};

/* The Phase 3 listing viewer: drag to turn the photos. */
export const ListingViewer: Story = {
  render: () => (
    <div style={{ maxWidth: 640, margin: "24px auto", padding: "0 16px" }}>
      <PhotoViewer3D media={listing.media} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("figcaption")?.textContent).toMatch(/^Photo 1 of \d+/);
  },
};
