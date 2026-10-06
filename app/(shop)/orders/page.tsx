import { ComingSoon, comingMetadata } from "@/features/placeholder/ComingSoon";

export const metadata = comingMetadata("orders");

export default function Page() {
  return <ComingSoon id="orders" />;
}
