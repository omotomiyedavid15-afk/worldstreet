import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DotsVerticalIcon, EyeIcon, FlagIcon, ShareIcon } from "@/components/icons";
import { Button } from "./Button";
import { Menu } from "./Menu";
import { ToastViewport, toast } from "./Toast";
import { Tooltip } from "./Tooltip";

const meta: Meta = { title: "UI/Overlays" };
export default meta;
type Story = StoryObj;

export const CardMenu: Story = {
  render: () => (
    <Menu
      label="More actions for Sony WH-1000XM5"
      trigger={<DotsVerticalIcon size={18} />}
      items={[
        { label: "Find similar", icon: <EyeIcon size={18} />, onSelect: () => {} },
        { label: "Share", icon: <ShareIcon size={18} />, onSelect: () => {} },
        "separator",
        { label: "Report listing", icon: <FlagIcon size={18} />, danger: true, onSelect: () => {} },
      ]}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("button", { name: "More actions for Sony WH-1000XM5" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    const menu = within(canvasElement.ownerDocument.body).getByRole("menu");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
    const items = within(menu).getAllByRole("menuitem");
    await waitFor(() => expect(items[0]).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    expect(items[1]).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(items[2]).toHaveFocus(); // wraps to the last item
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    expect(trigger).toHaveFocus();
  },
};

export const Toasts: Story = {
  render: () => (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button variant="ghost" onClick={() => toast({ message: "Added to Saved", action: { label: "View", href: "/saved" } })}>Save</Button>
        <Button variant="ghost" onClick={() => toast({ message: "Offer sent. The seller has 48 hours to reply." })}>Send offer</Button>
        <Button variant="ghost" onClick={() => toast({ tone: "loss", message: "Couldn't save. Try again." })}>Fail</Button>
        <Button variant="ghost" onClick={() => toast({ tone: "warning", message: "Price updated to ₦98,000" })}>Warn</Button>
      </div>
      <ToastViewport />
    </>
  ),
  play: async ({ canvas }) => {
    const region = canvas.getByRole("status", { name: "Notifications" });
    expect(region).toBeEmptyDOMElement(); // the live region exists before any toast
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(region).toHaveTextContent("Added to Saved"));
    expect(within(region).getByRole("link", { name: "View" })).toHaveAttribute("href", "/saved");
  },
};

export const Tooltips: Story = {
  render: () => (
    <div style={{ paddingTop: 48, display: "flex", gap: 12 }}>
      <Tooltip label="Share listing">
        <Button variant="ghost" icon aria-label="Share listing"><ShareIcon size={18} /></Button>
      </Tooltip>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const button = canvas.getByRole("button", { name: "Share listing" });
    await userEvent.tab();
    expect(button).toHaveFocus();
    const tip = canvasElement.querySelector(".cx-tip")!;
    await waitFor(() => expect(getComputedStyle(tip, "::after").opacity).toBe("1"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(getComputedStyle(tip, "::after").opacity).toBe("0"));
    expect(button).toHaveFocus(); // dismissing doesn't move focus
  },
};
