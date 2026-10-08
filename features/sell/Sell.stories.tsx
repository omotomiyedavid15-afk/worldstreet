import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SellerOnboarding } from "./SellerOnboarding";
import { SellerHub, SellerShell } from "./SellerHub";

const categories = [
  { id: "phones", name: "Phones & tablets", inspection: "phones", kind: "goods" },
  { id: "fashion", name: "Fashion", inspection: "fashion", kind: "goods" },
] as const;

const meta = { title: "Sell/Seller onboarding", component: SellerOnboarding, args: { categories, taken: ["chidi_phones"] } } satisfies Meta<typeof SellerOnboarding>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Intro: Story = {};
export const Hub: Story = { render: () => <SellerShell><SellerHub /></SellerShell> };
