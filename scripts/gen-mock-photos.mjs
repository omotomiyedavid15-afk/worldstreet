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
// Four views per category, so cards can step through photos: same item, different
// framing and light. `{id}.svg` is view 1.
const VIEWS = [
  { dl: 0, scale: 11.667, x: 260, y: 230 },
  { dl: 6, scale: 15, x: 220, y: 150 },
  { dl: -6, scale: 8.5, x: 298, y: 270 },
  { dl: 3, scale: 12.5, x: 250, y: 205 },
];
Object.entries(categories).forEach(([id, [label, icon]], i) => {
  const h = 28 + i * 9; // a slightly different warm stone per category, mid-tone so it doesn't glare on dark
  VIEWS.forEach((v, n) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><!-- MOCK PHOTO: placeholder for development, not a real item. Icon: Atlas ${icon} (ISC). --><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h} 10% ${62 + v.dl}%)"/><stop offset="1" stop-color="hsl(${h} 8% ${50 + v.dl}%)"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><g transform="translate(${v.x} ${v.y}) scale(${v.scale})" fill="none" stroke="hsl(${h} 10% 22%)" stroke-width="${(14 / v.scale).toFixed(2)}" stroke-miterlimit="10">${markup(icon)}</g><text x="400" y="700" text-anchor="middle" font-family="sans-serif" font-size="32" font-weight="600" fill="hsl(${h} 10% 18%)">${label} · mock · photo ${n + 1}</text></svg>\n`;
    fs.writeFileSync(path.join(outDir, `${id}-${n + 1}.svg`), svg);
    if (n === 0) fs.writeFileSync(path.join(outDir, `${id}.svg`), svg);
  });
});
console.log(`${Object.keys(categories).length * VIEWS.length} mock photos → public/mock/img/`);
