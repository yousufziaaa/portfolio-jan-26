// Builds data/placeholders.json: a tiny blurred preview for every image in
// public/, keyed by its URL path, so next/image can show it while the real
// image loads. Run after adding images: `node scripts/placeholders.mjs`.
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const pub = path.join(root, "public");
const files = (await readdir(pub)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));

const out = {};
for (const f of files.sort()) {
  const buf = await sharp(path.join(pub, f))
    .rotate()
    .resize(12, 12, { fit: "inside" })
    .removeAlpha()
    .webp({ quality: 50 })
    .toBuffer();
  out[`/${f}`] = `data:image/webp;base64,${buf.toString("base64")}`;
}
await writeFile(path.join(root, "data/placeholders.json"), JSON.stringify(out, null, 0) + "\n");
console.log(`wrote ${files.length} placeholders`);
