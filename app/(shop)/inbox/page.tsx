import { ComingSoon, comingMetadata } from "@/features/placeholder/ComingSoon";

export const metadata = comingMetadata("inbox");

export default function Page() {
  return <ComingSoon id="inbox" />;
}
