import Link from "next/link";
import { ArrowRightIcon, MagnifyingGlassIcon } from "@/components/icons";
import { EmptyState, buttonClass } from "@/components/ui";

/* SCR-029 404 (R-007): say what happened and give a way on, never a dead end. */
export default function NotFound() {
  return (
    <main id="main" className="cx-container ws-page">
      <div className="ws-coming">
        <EmptyState
          icon={<MagnifyingGlassIcon />}
          title="We can't find that page"
          headingLevel="h1"
          action={
            <Link href="/" className={buttonClass({ variant: "ghost", arrow: true })}>
              Back to shopping
              <ArrowRightIcon />
            </Link>
          }
        >
          The link may be old or mistyped. Start again from the home page, where search is at the top.
        </EmptyState>
      </div>
    </main>
  );
}
