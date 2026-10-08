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
const request = {
  id: "request-example",
  offer_id: "example",
  unit_minor: 45_000_000,
  qty: 1,
  item_subtotal_minor: 45_000_000,
  delivery_minor: 200_000,
  total_minor: 45_200_000,
  status: "unpaid" as const,
  attempts: 0,
  last_attempted_at: null,
  inventory_lock_expires_at: null,
  paid_at: null,
};
export const Pending: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Accept offer" }));
    await expect(args.run).toHaveBeenCalledWith(expect.objectContaining({ type: "respond", event: "accept" }));
  },
};
export const Countered: Story = { args: { role: "buyer", offer: { ...meta.args.offer, status: "countered" } } };
export const PaymentRequest: Story = { args: { role: "buyer", offer: { ...meta.args.offer, status: "accepted" }, request } };
export const PaymentDeclined: Story = { args: { ...PaymentRequest.args, request: { ...request, status: "declined", attempts: 1 } } };
export const PaymentTimedOut: Story = { args: { ...PaymentRequest.args, request: { ...request, status: "timed_out", attempts: 1 } } };
export const PaymentComplete: Story = { args: { ...PaymentRequest.args, offer: { ...meta.args.offer, status: "paid" }, request: { ...request, status: "paid", attempts: 1, paid_at: Date.parse("2026-10-07T12:05:00Z") } } };
export const PaymentExpired: Story = { args: { ...PaymentRequest.args, offer: { ...meta.args.offer, status: "lapsed" }, request: { ...request, status: "expired" } } };
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
    // A scripted Escape is untrusted, so the native dialog ignores it (the e2e presses the real key).
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.queryByRole("dialog", { name: "Sign in" })).toBeNull();
  },
};
