import {
  AccountIcon,
  BellIcon,
  ChatDotsIcon,
  HandshakeAgreementDealIcon,
  MenuSquareIcon,
  PackageIcon,
  PencilEditIcon,
  StoreIcon,
  WalletIcon,
} from "@/components/icons";

/*
 * Pages that links will point to before they're built (audit F5: no dead links, no
 * badge without a panel). Each says which build phase brings it (PLAN §3) and what it
 * will do, so a tap never ends on a 404. Routes follow flows Part F.
 */

export type ComingId = keyof typeof COMING;

export const COMING = {
  categories: { title: "All categories", icon: MenuSquareIcon, phase: 2, body: "Every category and subcategory, with how many listings each has near you." },
  notifications: { title: "Notifications", icon: BellIcon, phase: 1, body: "Offers, messages, order updates and price drops, newest first." },
  inbox: { title: "Inbox", icon: ChatDotsIcon, phase: 4, body: "Messages with buyers and sellers, each pinned to its listing." },
  offers: { title: "Offers", icon: HandshakeAgreementDealIcon, phase: 4, body: "Offers you've made and received, with counter-offers and deadlines." },
  account: { title: "Your account", icon: AccountIcon, phase: 4, body: "Sign in, your profile, addresses and payment methods." },
  orders: { title: "Orders", icon: PackageIcon, phase: 6, body: "Tracking, delivery codes, the inspection countdown, returns and reviews." },
  sellStart: { title: "Start selling", icon: StoreIcon, phase: 7, body: "Set up your shop, verify your ID and add a payout account." },
  sellNew: { title: "Create a listing", icon: PencilEditIcon, phase: 7, body: "Photos, details, price and delivery in a few steps, saved as you go." },
  vendor: { title: "Seller Hub", icon: WalletIcon, phase: 7, body: "Listings, orders, offers, payouts and performance for your shop." },
} as const;
