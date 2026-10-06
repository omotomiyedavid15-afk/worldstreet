import { ComingSoon, comingMetadata } from "@/features/placeholder/ComingSoon";

export const metadata = comingMetadata("notifications");

export default function Page() {
  return <ComingSoon id="notifications" />;
}
