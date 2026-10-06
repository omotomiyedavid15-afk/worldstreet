import { ComingSoon, comingMetadata } from "@/features/placeholder/ComingSoon";

export const metadata = comingMetadata("checkout");

export default function Page() {
  return <ComingSoon id="checkout" />;
}
