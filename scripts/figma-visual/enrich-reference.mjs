import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "docs/design/figma-reference.json");
const geometryPath = path.join(root, ".scratch/figma-ui-audit/figma/frame-geometry.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const geometry = new Map(JSON.parse(fs.readFileSync(geometryPath, "utf8")).map((entry) => [entry.id, entry]));
const referenceDir = "docs/design/figma-reference";
const contextDir = path.join(root, ".scratch/figma-ui-audit/figma");
const filePattern = /\/([A-Za-z0-9._-]+\.(?:png|svg|jpg|jpeg|webp|gif))/gi;

function box(node) {
  return { id: node.id, name: node.name, x: Number(node.x), y: Number(node.y), width: Number(node.width), height: Number(node.height) };
}
function pick(children, predicate) {
  const found = children.filter(predicate).sort((a, b) => a.y - b.y)[0];
  return found ? box(found) : null;
}
function anchorsFor(screen) {
  const entry = geometry.get(screen.nodeId);
  const children = (entry?.children ?? []).map(box);
  const topInset = screen.osInsetTop;
  const header = pick(children, (n) => Math.abs(n.y - topInset) <= 0.01 && n.width >= screen.width * 0.9) ??
    { id: null, name: "header", x: 0, y: topInset, width: screen.width, height: screen.device === "mobile" ? 40 : 56 };
  const footer = [...children].sort((a, b) => (b.y + b.height) - (a.y + a.height))[0] ??
    { id: null, name: "footer", x: 0, y: screen.figmaHeight - (screen.device === "mobile" ? 237 : 344), width: screen.width, height: screen.device === "mobile" ? 237 : 344 };
  const knownShell = {
    "library-detail-desktop": {
      header: { id: "483:1061", name: "Frame 2147203630", x: 0, y: 0, width: 1280, height: 56 },
      footer: { id: "546:830", name: "Frame 2147203777", x: 0, y: 2153, width: 1280, height: 344 },
    },
    "library-detail-mobile": {
      header: { id: "424:3434", name: "Frame 2147203701", x: 0, y: 44, width: 393, height: 40 },
      footer: { id: "424:3439", name: "Frame 2147203699", x: 0, y: 2125, width: 393, height: 237 },
    },
    "loading-1-desktop": { header: { id: "424:3199", name: "Frame 2147203744", x: 0, y: 0, width: 1280, height: 56 }, footer: { id: "546:958", name: "Frame 2147203745", x: 0, y: 832, width: 1280, height: 344 } },
    "loading-1-mobile": { header: { id: "414:1583", name: "Frame 2147203701", x: 0, y: 44, width: 393, height: 40 }, footer: { id: "414:1588", name: "Frame 2147203699", x: 0, y: 852, width: 393, height: 237 } },
    "loading-2-desktop": { header: { id: "424:3211", name: "Frame 2147203744", x: 0, y: 0, width: 1280, height: 56 }, footer: { id: "546:990", name: "Frame 2147203745", x: 0, y: 832, width: 1280, height: 344 } },
    "loading-2-mobile": { header: { id: "414:1667", name: "Frame 2147203701", x: 0, y: 44, width: 393, height: 40 }, footer: { id: "414:1672", name: "Frame 2147203699", x: 0, y: 852, width: 393, height: 237 } },
    "loading-3-desktop": { header: { id: "424:3223", name: "Frame 2147203744", x: 0, y: 0, width: 1280, height: 56 }, footer: { id: "546:1022", name: "Frame 2147203745", x: 0, y: 832, width: 1280, height: 344 } },
    "loading-3-mobile": { header: { id: "414:1791", name: "Frame 2147203701", x: 0, y: 44, width: 393, height: 40 }, footer: { id: "414:1796", name: "Frame 2147203699", x: 0, y: 852, width: 393, height: 237 } },
    "loading-4-desktop": { header: { id: "424:3235", name: "Frame 2147203744", x: 0, y: 0, width: 1280, height: 56 }, footer: { id: "546:1054", name: "Frame 2147203745", x: 0, y: 832, width: 1280, height: 344 } },
    "loading-4-mobile": { header: { id: "414:1919", name: "Frame 2147203701", x: 0, y: 44, width: 393, height: 40 }, footer: { id: "414:1924", name: "Frame 2147203699", x: 0, y: 852, width: 393, height: 237 } },
  }[screen.name];
  const verifiedHeader = knownShell?.header ?? header;
  const verifiedFooter = knownShell?.footer ?? footer;
  const knownArt = {
    "home-desktop": "304:544", "home-mobile": "141:482",
    "about-desktop": "403:553", "about-mobile": "151:718",
    "library-desktop": "439:694", "library-mobile": "424:2343",
    "card-desktop": "546:1198", "card-mobile": "560:780",
    "result-desktop": "463:746", "result-mobile": "546:765",
  }[screen.name];
  const artNode = children.find((n) => n.id === knownArt);
  const title = screen.name === "home-desktop"
    ? { id: "304:550", name: "home title text", x: 347, y: 665, width: 585, height: 68 }
    : null;
  const cta = screen.name === "home-desktop"
    ? { id: "304:551", name: "home down arrow", x: 622.529, y: 773, width: 33.94, height: 16.97 }
    : null;
  return {
    header: verifiedHeader,
    title,
    cta,
    art: artNode ? box(artNode) : null,
    section: null,
    footer: verifiedFooter,
    note: "Only header/footer and explicitly audited Home title/CTA/art IDs are asserted; other anchors await frame-specific XML child audits.",
  };
}
function localContextAssets(screen) {
  const candidates = [
    path.join(contextDir, `${screen.name}.txt`),
    path.join(contextDir, screen.name.replace(/-(desktop|mobile)$/, ".txt")),
  ];
  const file = candidates.find((candidate) => fs.existsSync(candidate));
  if (!file) return { assets: [], fonts: [], source: "not-captured-in-local-audit" };
  const text = fs.readFileSync(file, "utf8");
  const assets = [...new Set([...text.matchAll(filePattern)].map((match) => match[1]))];
  const fonts = [...new Set([...text.matchAll(/font-\['([^']+)'/g)].map((match) => match[1]))];
  return { assets, fonts, source: path.relative(root, file) };
}
manifest.schemaVersion = 2;
manifest.referenceDirectory = referenceDir;
manifest.referencePolicy = {
  nativeExport: "Figma PNG at maxDimension equal to the frame long edge; no scaled previews",
  normalizedOrigin: "Mobile exports crop the 44px iOS inset for browser-origin comparisons; native PNG remains available",
  contextSkill: "resource:figma-design-to-code",
};
manifest.screens = manifest.screens.map((screen) => {
  const native = `${referenceDir}/${screen.name}.png`;
  const normalized = `${referenceDir}/${screen.name}.normalized.png`;
  const context = localContextAssets(screen);
  return {
    name: screen.name,
    fileKey: manifest.fileKey,
    nodeId: screen.nodeId,
    route: screen.route,
    state: screen.state,
    device: screen.device,
    width: screen.width,
    figmaHeight: screen.figmaHeight,
    osInsetTop: screen.osInsetTop,
    normalizedHeight: screen.figmaHeight - screen.osInsetTop,
    referencePath: native,
    normalizedReferencePath: normalized,
    export: { format: "png", scale: 1, longEdge: Math.max(screen.width, screen.figmaHeight), verifiedBy: "sharp" },
    anchors: anchorsFor(screen),
    fonts: { names: context.fonts ?? [], source: context.fonts?.length ? context.source : "Figma context did not expose font metadata in local audit response" },
    assetFilenames: context.assets,
    assetProvenance: context.source,
    contextProvenance: context.source === "not-captured-in-local-audit" ? "mcp-context-retry-limited; geometry from local metadata" : "local audit context",
  };
});
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({screens: manifest.screens.length, native: manifest.screens.filter((s) => fs.existsSync(path.join(root, s.referencePath))).length, normalized: manifest.screens.filter((s) => fs.existsSync(path.join(root, s.normalizedReferencePath))).length}));
