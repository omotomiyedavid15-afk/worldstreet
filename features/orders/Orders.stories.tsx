import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OrderDetail } from "./OrderDetail";
import { OrdersPage } from "./OrdersPage";
import { ReportProblemWizard } from "./ReportProblemWizard";
import { ReviewForm } from "./ReviewForm";

const meta = { title: "Orders/Buyer orders", component: OrdersPage, args: { serverNow: Date.parse("2026-10-07T20:00:00Z") } } satisfies Meta<typeof OrdersPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {};
export const Delivered: Story = { render: () => <OrderDetail id="WS-84291" serverNow={Date.parse("2026-10-07T20:00:00Z")} /> };
export const InTransit: Story = { render: () => <OrderDetail id="WS-84276" serverNow={Date.parse("2026-10-07T20:00:00Z")} /> };
export const Problem: Story = { render: () => <ReportProblemWizard id="WS-84291" /> };
export const Review: Story = { render: () => <ReviewForm id="WS-84017" /> };
