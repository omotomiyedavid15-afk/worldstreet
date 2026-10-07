import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { STORY_NOW, lekkiAnchor, storyListings } from "@/features/listing-card/story-data";
import { CopyField, DescriptionBlock } from "./About";
import { DeliveryPanel, ItemSpecifics, PaymentsPanel, ProtectionPanel, ReturnsPanel, SafetyTipsCard } from "./Panels";
import { ReportButton, ReportListingModal } from "./ReportListing";
import type { ReportState } from "./report-action";
import { SHARE_ID, ShareSheet } from "./ShareSheet";

const meta: Meta = { title: "Listing detail/Panels" };
export default meta;
type Story = StoryObj;

const sony = storyListings[0];
const kaftan = storyListings[2]; // rider, meet-up and courier, in Lekki
const infinix = storyListings[3]; // meet-up only, no returns
const abuja = storyListings.find((l) => l.location.city === "Abuja")!;
const lekkiTotal = "Total to Lekki ₦47,500";

/* Every method with its cost and dates to the buyer's area; same-city methods say
   they don't reach a buyer in another city; Change opens the area picker. */
export const Delivery: Story = {
  render: () => (
    <div className="ws-listing__panels" style={{ maxWidth: 440 }}>
      <DeliveryPanel listing={kaftan} anchor={lekkiAnchor} total={lekkiTotal} now={STORY_NOW} returnTo="/listing/x" action={fn()} />
      <ReturnsPanel listing={kaftan} />
      <PaymentsPanel listing={kaftan} />
    </div>
  ),
  play: async ({ canvas }) => {
    // STORY_NOW is Tue 6 Oct: 1–3 days in transit + 1–2 handling → Thu 8 – Tue 13 Oct.
    await expect(canvas.getByText("Rider delivery")).toBeInTheDocument();
    await expect(canvas.getAllByText(/^Arrives/)[0].textContent).toBe("Arrives Thu 8 – Tue 13 Oct");
    await expect(canvas.getByText(lekkiTotal)).toBeInTheDocument();
    await expect(canvas.getByText("Agree a time and a public place with the seller")).toBeInTheDocument();
    await userEvent.click(canvas.getByText("Returns"));
    await expect(canvas.getByText(/Faulty or not as described: the seller pays return delivery/)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Change delivery location" }));
    await waitFor(() => expect(canvas.getByRole("dialog", { name: "Choose your location" })).toBeVisible());
    await expect(canvas.queryByRole("group", { name: "Distance" })).toBeNull();
  },
};

export const DeliveryOtherCity: Story = {
  render: () => (
    <div className="ws-listing__panels" style={{ maxWidth: 440 }}>
      <DeliveryPanel listing={kaftan} anchor={{ ...lekkiAnchor, id: "wuse", label: "Wuse", city: "Abuja" }} now={STORY_NOW} returnTo="/listing/x" action={fn()} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText("Not available").length).toBeGreaterThan(0);
    await expect(canvas.getAllByText("Only within Lagos").length).toBeGreaterThan(0);
  },
};

export const NoReturnsPickupOnly: Story = {
  render: () => (
    <div className="ws-listing__panels" style={{ maxWidth: 440 }}>
      <DeliveryPanel listing={{ ...infinix, return_days: null }} anchor={lekkiAnchor} now={STORY_NOW} returnTo="/listing/x" action={fn()} />
      <ReturnsPanel listing={{ ...infinix, return_days: null }} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Pickup only")).toBeInTheDocument();
    await expect(canvas.getByText("No returns")).toBeInTheDocument();
  },
};

/* Shop with confidence and safety tips; Report opens the report dialog. */
export const ConfidenceAndReport: Story = {
  render: () => {
    const submit = async (_: ReportState, form: FormData): Promise<ReportState> =>
      form.get("reason") ? { status: "sent" } : { status: "error", field: "reason", message: "Choose a reason." };
    return (
      <div style={{ display: "grid", gap: 24, maxWidth: 440 }}>
        <ProtectionPanel listing={abuja} report={<ReportButton className="ws-protect__report" />} />
        <SafetyTipsCard listing={abuja} />
        <ReportListingModal listingId={abuja.id} title={abuja.title} submit={submit} />
      </div>
    );
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText(/within 14 days of delivery/)).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "How escrow works" })).toHaveAttribute("href", "/help/escrow");
    await userEvent.click(canvas.getByRole("button", { name: "Report this listing" }));
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog", { name: "Report this listing" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Send report" }));
    await expect(await within(dialog).findByText("Choose a reason.")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("radio", { name: /Fake or counterfeit/ }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Send report" }));
    await expect(await within(dialog).findByText(/reviews reports within 24 hours/)).toBeInTheDocument();
  },
};

/* Vehicles and property: no escrow claim, inspection-first tips. */
export const ConfidenceNoEscrow: Story = {
  render: () => {
    const car = { ...sony, category: { ...sony.category, kind: "vehicle" as const } };
    return (
      <div style={{ display: "grid", gap: 24, maxWidth: 440 }}>
        <ProtectionPanel listing={car} report={null} />
        <SafetyTipsCard listing={car} />
      </div>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/No escrow checkout for this category/)).toBeInTheDocument();
    await expect(canvas.queryByText(/within 14 days of delivery/)).toBeNull();
    await expect(canvas.getByText(/with a mechanic/)).toBeInTheDocument();
  },
};

/* Item specifics with the condition definition; long descriptions clamp with Read more. */
export const AboutThisItem: Story = {
  render: () => {
    const many = { ...sony, attributes: Array.from({ length: 10 }, (_, i) => ({ key: `Spec ${i + 1}`, value: `Value ${i + 1}` })) };
    const long = Array.from({ length: 8 }, (_, i) => `Paragraph ${i + 1}. Bought last year, used at home and in the office, always kept in its case. Battery still lasts a full working day.`).join("\n\n");
    return (
      <section className="ws-about" style={{ maxWidth: 640 }}>
        <ItemSpecifics listing={many} />
        <DescriptionBlock text={long} />
        <CopyField label="item number" value={sony.id} />
      </section>
    );
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByText("Spec 10")).not.toBeVisible();
    await userEvent.click(canvas.getByText("Show all 12"));
    await expect(canvas.getByText("Spec 10")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "What Brand new means" }));
    const pop = within(canvasElement.ownerDocument.body).getByRole("dialog", { name: "Condition: Brand new" });
    await waitFor(() => expect(pop).toBeVisible());
    await userEvent.click(within(pop).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(pop).not.toBeVisible());

    const more = canvas.getByRole("button", { name: "Read more" });
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(more);
    await expect(canvas.getByRole("button", { name: "Show less" })).toHaveAttribute("aria-expanded", "true");
  },
};

/* The fallback share sheet (where the phone has no share sheet of its own). */
export const Share: Story = {
  render: () => <ShareSheet url="https://worldstore.example/listing/204507-sony" title={sony.title} text={`${sony.title}, ₦485,000 on WorldStore`} />,
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    (doc.getElementById(SHARE_ID) as HTMLDialogElement).showModal();
    const dialog = within(doc.body).getByRole("dialog", { name: "Share this listing" });
    const wa = within(dialog).getByRole("link", { name: /WhatsApp/ });
    await expect(wa.getAttribute("href")).toContain("https://wa.me/?text=");
    await expect(decodeURIComponent(wa.getAttribute("href")!)).toContain("https://worldstore.example/listing/204507-sony");
    await expect(within(dialog).getByRole("link", { name: /Telegram/ })).toHaveAttribute("target", "_blank");
    await expect(within(dialog).getByRole("button", { name: "Copy link" })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
  },
};
