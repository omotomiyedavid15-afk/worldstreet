import type { Metadata } from "next";
import { RiskPage } from "@/features/admin/AdminConsole";

export const metadata: Metadata = { title: "Risk · Staff console" };

export default function Page() {
  return <RiskPage />;
}
