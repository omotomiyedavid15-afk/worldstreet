import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { findArea } from "@/lib/areas";
import { LocationBar } from "./LocationBar";

const meta: Meta<typeof LocationBar> = {
  title: "Search/LocationBar",
  component: LocationBar,
  args: { anchor: findArea("lekki")!, inferred: false, radius: 10, returnTo: "/search?q=phone&radius=10", action: fn() },
};
export default meta;
type Story = StoryObj<typeof LocationBar>;

export const Chosen: Story = {
  play: async ({ args, canvas, canvasElement }) => {
    expect(canvas.getByText(/Showing items near/)).toHaveTextContent("Showing items near Lekki · within 10 km");
    // Inline, not a modal: nothing blocks the page until the buyer asks.
    const dialog = within(canvasElement.ownerDocument.body).getByRole("dialog", { hidden: true });
    expect(dialog).not.toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Change location" }));
    await waitFor(() => expect(dialog).toBeVisible());
    const form = within(dialog);
    expect(form.getByRole("combobox", { name: "Area" })).toHaveValue("lekki");
    expect(form.getByRole("radio", { name: "10 km" })).toBeChecked();

    await userEvent.selectOptions(form.getByRole("combobox", { name: "Area" }), "yaba");
    await userEvent.click(form.getByRole("radio", { name: "Nationwide" }));
    await userEvent.click(form.getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(args.action).toHaveBeenCalledTimes(1));
    const data = (args.action as ReturnType<typeof fn>).mock.calls[0][0] as FormData;
    expect(Object.fromEntries(data)).toEqual({ return: "/search?q=phone&radius=10", area: "yaba", radius: "all" });
  },
};

export const Inferred: Story = {
  args: { anchor: findArea("lagos")!, inferred: true, radius: 25, returnTo: "/" },
};

export const Nationwide: Story = {
  args: { anchor: findArea("wuse")!, radius: null },
};

export const SelectorOpen: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Change location" }));
  },
};

export const SelectorOpenMobile: Story = {
  ...SelectorOpen,
  globals: { viewport: { value: "mobile", isRotated: false } },
};
