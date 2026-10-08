import type { Metadata } from "next";
import { CaseView } from "@/features/admin/AdminConsole";

export const metadata: Metadata = { title: "Case · Staff console" };

export default async function Page({ params }: PageProps<"/admin/cases/[id]">) {
  return <CaseView id={(await params).id} />;
}
