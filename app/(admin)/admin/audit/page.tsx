import type { Metadata } from "next";
import { AuditPage } from "@/features/admin/AdminConsole";

export const metadata: Metadata = { title: "Audit log · Staff console" };

export default function Page() {
  return <AuditPage />;
}
