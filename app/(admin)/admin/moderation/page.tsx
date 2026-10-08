import type { Metadata } from "next";
import { ModerationPage } from "@/features/admin/AdminConsole";

export const metadata: Metadata = { title: "Moderation · Staff console" };

export default function Page() {
  return <ModerationPage />;
}
