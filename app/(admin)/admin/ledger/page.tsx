import type { Metadata } from "next";
import { LedgerPage } from "@/features/admin/AdminConsole";

export const metadata: Metadata = { title: "Ledger · Staff console" };

export default function Page() {
  return <LedgerPage />;
}
