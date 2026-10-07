import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { OfferCard } from "./OfferCard";
import { OfferForm } from "./OfferForm";
import { SignInSheet } from "@/features/auth/SignInSheet";
import { requireAuth, signOut } from "@/features/auth/session";
import { buttonClass } from "@/components/ui";

const meta = {
  title: "Offers and messaging/Negotiation",
  component: OfferCard,
  decorators: [(Story) => <div className="ws-deal-page" style={{ maxWidth: 620 }}><Story /></div>],
  args: {
    offer: { id: "example", listing_id: "204501", amount_minor: 45_000_000, qty: 1, attempts: 1, status: "pending", expires_at: Date.parse("2026-10-09T12:00:00Z") },
    role: "seller", escrow: true, blocked: false, run: fn(),
  },
} satisfies Meta<typeof OfferCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Pending: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Accept offer" }));
    await expect(args.run).toHaveBeenCalledWith(expect.objectContaining({ type: "respond", event: "accept" }));
  },
};
export const Countered: Story = { args: { role: "buyer", offer: { ...meta.args.offer, status: "countered" } } };
export const PaymentRequest: Story = { args: { role: "buyer", offer: { ...meta.args.offer, status: "accepted" }, request: { offer_id: "example", delivery_minor: 200_000, total_minor: 45_200_000, outcome: "unpaid" } } };
export const PaymentFailed: Story = { args: { ...PaymentRequest.args, request: { ...PaymentRequest.args!.request!, outcome: "declined" } } };
export const Expired: Story = { args: { offer: { ...meta.args.offer, status: "expired" } } };
export const Blocked: Story = { args: { blocked: true } };
export const MakeOffer: Story = {
  render: () => <OfferForm price={48_500_000} qty={1} available={2} left={3} run={fn()} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "₦436,500" }));
    await expect(canvas.getByLabelText("Your offer per item (NGN)")).toHaveValue(436500);
  },
};
export const SignIn: Story = {
  beforeEach: () => signOut(),
  render: () => <><button className={buttonClass({})} onClick={() => requireAuth("make an offer", fn())}>Make offer</button><SignInSheet /></>,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Make offer" }));
    await expect(canvas.getByRole("dialog", { name: "Sign in" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("dialog", { name: "Sign in" })).toBeNull();
  },
};
