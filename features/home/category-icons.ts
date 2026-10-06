import { CarFrontIcon, ClothingHangerIcon, CookingStationIcon, CouchIcon, HeadphonesIcon, HouseRealEstateIcon, LaptopIcon, LotionIcon, MobilePortraitIcon, WashingMachineIcon } from "@/components/icons";
import type { CategoryId } from "@/lib/data/types";

/** Each category's Atlas glyph: the same ones the mock photos are drawn from. */
export const CATEGORY_ICONS: Record<CategoryId, typeof MobilePortraitIcon> = {
  phones: MobilePortraitIcon,
  electronics: HeadphonesIcon,
  computing: LaptopIcon,
  fashion: ClothingHangerIcon,
  home: CookingStationIcon,
  appliances: WashingMachineIcon,
  furniture: CouchIcon,
  beauty: LotionIcon,
  vehicles: CarFrontIcon,
  property: HouseRealEstateIcon,
};
