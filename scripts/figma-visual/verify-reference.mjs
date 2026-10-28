import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "docs/design/figma-reference.json"), "utf8"));
if (manifest.screens.length !== 28) throw new Error(`Expected 28 screens, found ${manifest.screens.length}`);
const seen = new Set();
for (const screen of manifest.screens) {
  if (seen.has(screen.nodeId)) throw new Error(`Duplicate node ID ${screen.nodeId}`);
  seen.add(screen.nodeId);
  if (screen.fileKey !== "Gmzxui5petX6JblbBjAaYP") throw new Error(`${screen.name}: wrong file key`);
  if (!screen.referencePath || !screen.normalizedReferencePath) throw new Error(`${screen.name}: missing reference path`);
  if (!screen.anchors?.header?.id || !screen.anchors?.footer?.id) throw new Error(`${screen.name}: missing exact header/footer anchor IDs`);
  if (screen.anchors.header.width !== screen.width || screen.anchors.footer.width !== screen.width) throw new Error(`${screen.name}: shell anchor width mismatch`);
  const native = await sharp(path.join(root, screen.referencePath)).metadata();
  const normalized = await sharp(path.join(root, screen.normalizedReferencePath)).metadata();
  if (native.width !== screen.width || native.height !== screen.figmaHeight) {
    throw new Error(`${screen.name}: native ${native.width}x${native.height}, expected ${screen.width}x${screen.figmaHeight}`);
  }
  const expectedHeight = screen.figmaHeight - screen.osInsetTop;
  if (normalized.width !== screen.width || normalized.height !== expectedHeight) {
    throw new Error(`${screen.name}: normalized ${normalized.width}x${normalized.height}, expected ${screen.width}x${expectedHeight}`);
  }
}
console.log(JSON.stringify({screens: manifest.screens.length, uniqueNodeIds: seen.size, dimensions: "native and normalized verified"}));
