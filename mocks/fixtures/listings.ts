/* MOCK DATA ONLY. Not real people, shops or listings. Imported only by lib/data/index.ts.
   Social-proof numbers here are invented for layout testing (PLAN F7). */

import type { Listing, Review } from "@/lib/data/types";
import { makeListing, makeReviews, withItemRating, type ListingSeed } from "../factories";
import { sellers } from "./sellers";

const seeds: ListingSeed[] = [
  // Phones & tablets
  { id: "204501", title: "iPhone 14 Pro 256GB Deep Purple", category: "phones", seller: "s01", place: "ikeja", condition: "used", price: 845_000, was: 920_000, offers: true, delivery: "lagos", photos: 8, daysAgo: 3, rating: [4.8, 36], sold: 64, watchers: 22, attributes: { Brand: "Apple", Storage: "256GB", "Battery health": "89%" }, notes: "Battery health 89%. Light marks on the frame, screen is perfect. Comes with the box and cable, no charger.", editedDaysAgo: 1 },
  { id: "204502", title: "Samsung Galaxy S23 Ultra 512GB", category: "phones", seller: "s06", place: "wuse", condition: "refurbished", price: 910_000, delivery: "nationwide", photos: 6, daysAgo: 9, rating: [4.6, 18], sold: 21, attributes: { Brand: "Samsung", Storage: "512GB" } },
  { id: "204503", title: "Tecno Camon 20 Pro 8GB/256GB", category: "phones", seller: "s02", place: "yaba", condition: "new", price: 289_000, delivery: "lagos", daysAgo: 1, sold: 112, inCarts: 4, attributes: { Brand: "Tecno", Storage: "256GB" } },
  { id: "204504", title: "Infinix Hot 40i 128GB", category: "phones", seller: "s05", place: "ajah", condition: "like_new", price: 132_000, offers: true, delivery: "pickup", photos: 3, daysAgo: 5, returns: null , attributes: { Brand: "Infinix", Storage: "128GB", "Battery health": "97%" } },
  { id: "204505", title: "iPad Air 5th Gen 64GB Wi-Fi", category: "phones", seller: "s01", place: "ikeja", condition: "used", price: 520_000, delivery: "lagos", daysAgo: 12, rating: [4.9, 11], watchers: 14 , attributes: { Brand: "Apple", Storage: "64GB", "Battery health": "91%" } },
  { id: "204506", title: "Google Pixel 7a 128GB", category: "phones", seller: "s02", place: "yaba", condition: "for_parts", price: 95_000, delivery: "lagos", photos: 2, daysAgo: 20, returns: null, description: "Google Pixel 7a. Screen cracked, boots fine. Sold for parts. Mock listing for development; not a real item." , attributes: { Brand: "Google", Storage: "128GB" } },
  // Electronics
  { id: "204507", title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones", category: "electronics", seller: "s01", place: "ikeja", condition: "new", price: 485_000, was: 560_000, delivery: "free", photos: 6, daysAgo: 2, rating: [4.9, 52], sold: 38, watchers: 31, inCarts: 6, attributes: { Brand: "Sony", Colour: "Black" } },
  { id: "204508", title: "JBL Tune 520BT On-Ear Headphones", category: "electronics", seller: "s02", place: "yaba", condition: "new", price: 58_000, delivery: "lagos", daysAgo: 4, sold: 47 , attributes: { Brand: "JBL", Colour: "Blue" } },
  { id: "204509", title: "Oraimo FreePods 4 Earbuds", category: "electronics", seller: "s05", place: "ajah", condition: "new", price: 24_500, delivery: "pickup", photos: 2, daysAgo: 6 },
  { id: "204510", title: "LG 55\" 4K UHD Smart TV (55UR8050)", category: "electronics", seller: "s04", place: "surulere", condition: "new", price: 615_000, was: 680_000, delivery: "bulky", photos: 5, daysAgo: 8, returns: 14, rating: [4.5, 9] },
  { id: "204511", title: "PlayStation 5 Slim Disc Edition", category: "electronics", seller: "s06", place: "wuse", condition: "like_new", price: 780_000, offers: true, delivery: "nationwide", photos: 7, daysAgo: 2, watchers: 40, status: "reserved" , attributes: { Brand: "Sony", Storage: "1TB" } },
  { id: "204512", title: "Canon EOS 250D DSLR with 18-55mm Lens", category: "electronics", seller: "s02", place: "yaba", condition: "used", price: 465_000, offers: true, delivery: "lagos", photos: 9, daysAgo: 15 },
  { id: "204513", title: "Hisense 2.1 Soundbar HS214", category: "electronics", seller: "s04", place: "surulere", condition: "new", price: 89_000, delivery: "lagos", daysAgo: 11, sold: 9 },
  // Computing
  { id: "204514", title: "MacBook Air M2 13\" 8GB/256GB Midnight", category: "computing", seller: "s01", place: "ikeja", condition: "like_new", price: 1_180_000, was: 1_350_000, offers: true, delivery: "lagos", photos: 8, daysAgo: 6, rating: [5, 7], watchers: 19, attributes: { Brand: "Apple", RAM: "8GB", Storage: "256GB SSD" } },
  { id: "204515", title: "HP EliteBook 840 G6 i5 16GB/512GB", category: "computing", seller: "s02", place: "yaba", condition: "refurbished", price: 365_000, delivery: "lagos", daysAgo: 3, sold: 27, rating: [4.4, 21] , attributes: { Brand: "HP", RAM: "16GB", Storage: "512GB SSD" } },
  { id: "204516", title: "Dell 24\" FHD Monitor P2422H", category: "computing", seller: "s06", place: "garki", condition: "used", price: 118_000, delivery: "nationwide", daysAgo: 18 , attributes: { Brand: "Dell", Size: "24 inch" } },
  { id: "204517", title: "Logitech MX Master 3S Mouse", category: "computing", seller: "s05", place: "ajah", condition: "new", price: 98_000, delivery: "lagos", daysAgo: 2 },
  { id: "204518", title: "Lenovo ThinkPad X1 Carbon Gen 9", category: "computing", seller: "s06", place: "wuse", condition: "used", price: 720_000, delivery: "nationwide", photos: 6, daysAgo: 30, status: "sold" , attributes: { Brand: "Lenovo", RAM: "16GB", Storage: "512GB SSD" }, notes: "Keyboard and screen are perfect. Small dent on the lid corner (photo 4). Charger included." },
  // Fashion
  { id: "204519", title: "Hand-dyed Adire Kaftan, Indigo (Men's L)", category: "fashion", seller: "s03", place: "lekki", condition: "new", price: 45_000, delivery: "lagos", photos: 5, daysAgo: 1, rating: [4.9, 88], sold: 210, attributes: { Size: "L", Material: "Cotton" } },
  { id: "204520", title: "Ankara Wrap Midi Dress (UK 12)", category: "fashion", seller: "s03", place: "lekki", condition: "new", price: 38_500, was: 48_000, delivery: "lagos", photos: 4, daysAgo: 4, sold: 75, attributes: { Size: "UK 12" } },
  { id: "204521", title: "Nike Air Force 1 '07 White (EU 43)", category: "fashion", seller: "s05", place: "ajah", condition: "like_new", price: 72_000, offers: true, delivery: "pickup", daysAgo: 7, attributes: { Size: "EU 43", Brand: "Nike" } },
  { id: "204522", title: "Aso-oke Gele and Ipele Set, Gold", category: "fashion", seller: "s03", place: "lekki", condition: "new", price: 65_000, delivery: "nationwide", photos: 6, daysAgo: 10, rating: [4.8, 23] },
  { id: "204523", title: "Leather Crossbody Bag, Tan", category: "fashion", seller: "s07", place: "vi", condition: "new", price: 29_000, delivery: "lagos", daysAgo: 13, sold: 14 , attributes: { Colour: "Tan", Material: "Leather" } },
  { id: "204524", title: "Casio G-Shock GA-2100 Watch", category: "fashion", seller: "s01", place: "ikeja", condition: "new", price: 135_000, delivery: "free", daysAgo: 5, watchers: 12 },
  // Home & kitchen
  { id: "204525", title: "Non-stick Cookware Set, 10 Pieces", category: "home", seller: "s04", place: "surulere", condition: "new", price: 54_000, was: 62_000, delivery: "lagos", daysAgo: 3, sold: 41 },
  { id: "204526", title: "Binatone 1.7L Electric Kettle", category: "home", seller: "s04", place: "surulere", condition: "new", price: 18_500, delivery: "lagos", daysAgo: 9, sold: 96 },
  { id: "204527", title: "Handwoven Raffia Table Mats (Set of 6)", category: "home", seller: "s03", place: "lekki", condition: "new", price: 12_000, delivery: "lagos", daysAgo: 14 },
  { id: "204528", title: "Ceramic Dinner Set, 24 Pieces", category: "home", seller: "s08", place: "bodija", condition: "new", price: 76_000, delivery: "nationwide", daysAgo: 21, status: "paused" },
  // Appliances
  { id: "204529", title: "Thermocool 150L Chest Freezer", category: "appliances", seller: "s04", place: "surulere", condition: "new", price: 365_000, delivery: "bulky", photos: 5, daysAgo: 6, returns: 14, rating: [4.6, 14] , attributes: { Brand: "Thermocool", Capacity: "150L" } },
  { id: "204530", title: "Firman 3.5kVA Generator SPG3800", category: "appliances", seller: "s02", place: "yaba", condition: "used", price: 245_000, offers: true, delivery: "pickup", daysAgo: 8, returns: null , attributes: { Brand: "Firman", Power: "3.5kVA" } },
  { id: "204531", title: "Nexus 1.5HP Split Air Conditioner", category: "appliances", seller: "s06", place: "garki", condition: "new", price: 420_000, delivery: "nationwide", daysAgo: 4 , attributes: { Brand: "Nexus", Power: "1.5HP" } },
  { id: "204532", title: "Scanfrost 7kg Front-load Washing Machine", category: "appliances", seller: "s04", place: "festac", condition: "refurbished", price: 298_000, delivery: "bulky", daysAgo: 16 , attributes: { Brand: "Scanfrost", Capacity: "7kg" } },
  // Furniture
  { id: "204533", title: "3-Seater Fabric Sofa, Grey", category: "furniture", seller: "s08", place: "bodija", condition: "new", price: 385_000, delivery: "nationwide", photos: 5, daysAgo: 7, returns: 3 , attributes: { Seats: "3", Colour: "Grey" } },
  { id: "204534", title: "Solid Wood Study Desk with Drawer", category: "furniture", seller: "s04", place: "ikorodu", condition: "used", price: 68_000, offers: true, delivery: "pickup", daysAgo: 11, returns: null, notes: "Solid wood. A few scratches on the top from use; drawer runs smoothly. Collect from Ikorodu." },
  { id: "204535", title: "Ergonomic Mesh Office Chair", category: "furniture", seller: "s02", place: "yaba", condition: "new", price: 115_000, was: 135_000, delivery: "lagos", daysAgo: 2, sold: 33 },
  // Health & beauty
  { id: "204536", title: "Shea Butter Body Cream, 500ml", category: "beauty", seller: "s07", place: "vi", condition: "new", price: 9_500, delivery: "lagos", daysAgo: 1, rating: [4.7, 64], sold: 320 },
  { id: "204537", title: "Black Soap and Oil Gift Set", category: "beauty", seller: "s07", place: "vi", condition: "new", price: 16_000, delivery: "nationwide", daysAgo: 5, sold: 58 },
  { id: "204538", title: "Philips Hair Dryer BHD350", category: "beauty", seller: "s05", place: "ajah", condition: "new", price: 27_000, delivery: "lagos", daysAgo: 25, status: "ended" },
  // Vehicles and property: contact + "Book viewing", no checkout (PLAN risk 7)
  { id: "204539", title: "Toyota Corolla 2014 LE, Automatic", category: "vehicles", seller: "s09", place: "gra_ph", condition: "used", price: 9_800_000, offers: true, delivery: "pickup", photos: 12, daysAgo: 10, returns: null, attributes: { Year: "2014", Mileage: "98,000 km", Transmission: "Automatic", Fuel: "Petrol" }, notes: "One owner since import. Full service history, new tyres in June. Small scratch on the rear bumper.", editedDaysAgo: 4 },
  { id: "204540", title: "Honda Accord 2013 EX-L", category: "vehicles", seller: "s09", place: "gra_ph", condition: "used", price: 8_900_000, offers: true, delivery: "pickup", photos: 10, daysAgo: 17, returns: null, attributes: { Year: "2013", Mileage: "121,000 km", Transmission: "Automatic", Fuel: "Petrol" } },
  { id: "204541", title: "2-Bedroom Flat to Let, Ikoyi", period: "year", category: "property", seller: "s10", place: "ikoyi", condition: "new", price: 12_000_000, delivery: "pickup", photos: 9, daysAgo: 6, returns: null, attributes: { Bedrooms: "2", Bathrooms: "2" } },
  { id: "204542", title: "Mini Flat to Let, Yaba", period: "year", category: "property", seller: "s10", place: "yaba", condition: "new", price: 1_800_000, delivery: "pickup", photos: 6, daysAgo: 3, returns: null, attributes: { Bedrooms: "1", Bathrooms: "1" } },
  // Not on sale: one reserved by an accepted offer (R-032), one paused out of stock
  // (R-121), one removed by moderation (A1). Removed pages answer "not found".
  { id: "204543", title: "Nintendo Switch OLED, White", category: "electronics", seller: "s02", place: "yaba", condition: "used", price: 265_000, offers: true, delivery: "lagos", daysAgo: 6, status: "reserved", watchers: 12 },
  { id: "204544", title: "Ankara Print Tote Bag", category: "fashion", seller: "s03", place: "lekki", condition: "new", price: 18_500, delivery: "lagos", daysAgo: 14, status: "paused", qty: 0, sold: 41 },
  { id: "204545", title: "Designer Handbag (removed listing)", category: "fashion", seller: "s05", place: "ajah", condition: "new", price: 95_000, delivery: "lagos", daysAgo: 9, status: "removed" },
];

const joined = new Map(sellers.map((s) => [s.id, s.joined_at]));
/** Generated from each seed's rating (see makeReviews); listing ratings come from these. */
export const reviews: readonly Review[] = seeds.flatMap((s) => makeReviews(s, joined.get(s.seller)!));
export const listings: readonly Listing[] = seeds.map((s) => withItemRating(makeListing(s), reviews));
