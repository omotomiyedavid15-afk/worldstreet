import type { Metadata } from "next";
import { ToastViewport } from "@/components/ui";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "WorldStreet Marketplace", template: "%s · WorldStreet Marketplace" },
  description: "Buy and sell near you. Every deal protected by escrow.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme must sit on an ancestor of data-brand: the DS light-theme selector is
    // "[data-theme=light] [data-brand=worldstreet]".
    <html lang="en" data-theme="dark" className={fontVariables}>
      <body className="cx-root" data-brand="worldstreet">
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}
