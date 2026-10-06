/* Writes the MOCK placeholder photos in public/mock/img/ (one per category), each built
   from that category's Atlas icon in components/icons/atlas.generated.ts, so even
   placeholders use the one icon set. Run after `npm run icons`:
     node scripts/gen-mock-photos.mjs */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const generated = fs.readFileSync(path.join(root, "components/icons/atlas.generated.ts"), "utf8");
const markup = (name) => {
  const match = generated.match(new RegExp(`createIcon\\("${name}", (".*?")\\);`));
  if (!match) throw new Error(`${name} is not in the Atlas subset; add it to components/icons/icons.json`);
  return JSON.parse(match[1]);
};

const categories = {
  phones: ["Phones", "MobilePortrait"],
  electronics: ["Electronics", "Headphones"],
  computing: ["Computing", "Laptop"],
  fashion: ["Fashion", "ClothingHanger"],
  home: ["Home", "CookingStation"],
  appliances: ["Appliances", "WashingMachine"],
  furniture: ["Furniture", "Couch"],
  beauty: ["Beauty", "Lotion"],
  vehicles: ["Vehicles", "CarFront"],
  property: ["Property", "HouseRealEstate"],
};

const outDir = path.join(root, "public/mock/img");
fs.mkdirSync(outDir, { recursive: true });
Object.entries(categories).forEach(([id, [label, icon]], i) => {
  const h = 28 + i * 9; // a slightly different warm stone per category, mid-tone so it doesn't glare on dark
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><!-- MOCK PHOTO: placeholder for development, not a real item. Icon: Atlas ${icon} (ISC). --><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h} 10% 62%)"/><stop offset="1" stop-color="hsl(${h} 8% 50%)"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><g transform="translate(260 230) scale(11.667)" fill="none" stroke="hsl(${h} 10% 22%)" stroke-width="1.2" stroke-miterlimit="10">${markup(icon)}</g><text x="400" y="650" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="600" fill="hsl(${h} 10% 18%)">${label} · mock</text></svg>\n`;
  fs.writeFileSync(path.join(outDir, `${id}.svg`), svg);
});
console.log(`${Object.keys(categories).length} mock photos → public/mock/img/`);
