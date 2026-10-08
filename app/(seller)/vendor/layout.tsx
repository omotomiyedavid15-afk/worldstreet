import type { ReactNode } from "react";
import { SellerShell } from "@/features/sell/SellerHub";

export default function VendorLayout({ children }: { children: ReactNode }) {
  return <SellerShell>{children}</SellerShell>;
}
