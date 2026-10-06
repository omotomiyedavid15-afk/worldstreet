/* Writes the app icons (favicon, icon.svg, apple-icon, manifest PNGs) from the Atlas
   ShopBag glyph on the WorldStreet gold tile, so the brand mark uses the one icon set
   too. Rasterised with sharp (installed with Next). Run: node scripts/gen-app-icons.mjs */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const generated = fs.readFileSync(path.join(root, "components/icons/atlas.generated.ts"), "utf8");
const glyph = JSON.parse(generated.match(/createIcon\("ShopBag", (".*?")\);/)[1]);

const GOLD = "#eab308"; // --ws-gold
const INK = "#1c1917"; // --ws-ink, 9.1:1 on gold

/** `pad` is the safe-zone inset as a fraction of the size (maskable icons need ~10%+). */
const svg = ({ radius = 0.22, pad = 0.2, background = true } = {}) => {
  const s = 24 / (1 - pad * 2);
  const o = -s * pad;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${o} ${o} ${s} ${s}">${
    background ? `<rect x="${o}" y="${o}" width="${s}" height="${s}" rx="${s * radius}" fill="${GOLD}"/>` : ""
  }<g fill="none" stroke="${INK}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${glyph}</g></svg>`;
};

const png = (markup, size) => sharp(Buffer.from(markup), { density: 72 * Math.ceil(size / 24) }).resize(size, size).png().toBuffer();

/** An .ico holding PNG images (supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
}

fs.mkdirSync(path.join(root, "public/icons"), { recursive: true });
fs.writeFileSync(path.join(root, "app/icon.svg"), svg() + "\n");
fs.writeFileSync(path.join(root, "app/apple-icon.png"), await png(svg({ radius: 0, pad: 0.22 }), 180));
fs.writeFileSync(path.join(root, "public/icons/icon-192.png"), await png(svg(), 192));
fs.writeFileSync(path.join(root, "public/icons/icon-512.png"), await png(svg(), 512));
fs.writeFileSync(path.join(root, "public/icons/maskable-512.png"), await png(svg({ radius: 0, pad: 0.3 }), 512));
const small = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(svg({ pad: 0.12 }), size) })));
fs.writeFileSync(path.join(root, "app/favicon.ico"), ico(small));
console.log("App icons → app/{favicon.ico,icon.svg,apple-icon.png}, public/icons/");
