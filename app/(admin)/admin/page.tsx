import type { Metadata } from "next";
import { AdminOverview } from "@/features/admin/AdminConsole";

export const metadata: Metadata = { title: "Staff console" };

export default function Page() {
  return <AdminOverview />;
}
