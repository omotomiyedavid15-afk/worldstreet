import { createMemoryRepos } from "./memory";
import { categories } from "@/mocks/fixtures/categories";
import { listings } from "@/mocks/fixtures/listings";
import { sellers } from "@/mocks/fixtures/sellers";

/*
 * The one place the app picks its data adapter (PLAN §2.2). Only this file may import
 * mocks/ (ESLint enforces it), so switching to a real backend changes this file only.
 */
export const repos = createMemoryRepos({ categories, sellers, listings });

export type { ListingFilter, Repos } from "./repo";
export { BUYER_VISIBLE, listingPath, parseListingParam } from "./repo";
export type * from "./types";
