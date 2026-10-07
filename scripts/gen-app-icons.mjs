/* Writes the app icons (favicon, icon.svg, apple-icon, manifest PNGs) from the supplied
   WorldStore SVG mark. Rasterised with sharp (installed with Next).
   Run: node scripts/gen-app-icons.mjs */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(root, "public/worldstore-mark.svg");
const source = fs.readFileSync(sourcePath);

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
fs.copyFileSync(sourcePath, path.join(root, "app/icon.svg"));
fs.writeFileSync(path.join(root, "app/apple-icon.png"), await png(source, 180));
fs.writeFileSync(path.join(root, "public/icons/icon-192.png"), await png(source, 192));
fs.writeFileSync(path.join(root, "public/icons/icon-512.png"), await png(source, 512));
const mask = await png(source, 320);
const maskable = await sharp({ create: { width: 512, height: 512, channels: 4, background: "#FFD332" } })
  .composite([{ input: mask, gravity: "centre" }])
  .png()
  .toBuffer();
fs.writeFileSync(path.join(root, "public/icons/maskable-512.png"), maskable);
const small = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(source, size) })));
fs.writeFileSync(path.join(root, "app/favicon.ico"), ico(small));
console.log("App icons → app/{favicon.ico,icon.svg,apple-icon.png}, public/icons/");
