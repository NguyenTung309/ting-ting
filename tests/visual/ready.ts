import { expect, type Locator, type Page } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const helperDir = path.dirname(fileURLToPath(import.meta.url));
const heroFixture = path.join(helperDir, "fixtures", "hero.png");

/** Freeze only GIF requests for deterministic Home captures; production animation is untouched. */
export async function freezeHomeHero(page: Page) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (request.resourceType() === "image" && new URL(request.url()).pathname.toLowerCase().endsWith("/tinhtinhtingting.gif")) {
      await route.fulfill({ path: heroFixture, contentType: "image/png" });
      return;
    }
    await route.continue();
  });
}

/** Wait for fonts, visible/in-layout images, lazy hydration, and a stable scroll origin. */
export async function readyForCapture(page: Page, options: { anchor?: string } = {}) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator('.ttt-site-header[data-hydrated="true"]').waitFor({ state: "attached", timeout: 10_000 });
  if (options.anchor) await page.locator(options.anchor).waitFor({ state: "attached", timeout: 10_000 });
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    await document.fonts.ready;
    const visibleImages = () => [...document.images].filter((image) => {
      const box = image.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && getComputedStyle(image).visibility !== "hidden";
    });
    const scrollHeight = () => document.documentElement.scrollHeight;
    for (let pass = 0; pass < 2; pass += 1) {
      for (let y = 0; y <= scrollHeight(); y += Math.max(innerHeight, 400)) {
        window.scrollTo(0, y);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
    const images = visibleImages();
    images.forEach((image) => { image.loading = "eager"; image.decoding = "sync"; });
    await Promise.race([
      Promise.all(images.map((image) => image.decode().catch(() => undefined))),
      new Promise((resolve) => setTimeout(resolve, 5_000)),
    ]);
    if (images.some((image) => !image.complete || image.naturalWidth === 0)) {
      throw new Error("Visible image is not ready");
    }
    const stable = async () => {
      let previous = -1;
      let consecutive = 0;
      for (let i = 0; i < 20; i += 1) {
        const current = scrollHeight();
        if (current === previous) consecutive += 1;
        else consecutive = 0;
        if (consecutive >= 2) return true;
        previous = current;
        await new Promise<void>((resolve) => setTimeout(resolve, 100));
      }
      return false;
    };
    if (!(await stable())) throw new Error("Page layout did not settle before capture");
  });
}

export async function expectGeometry(
  locator: Locator,
  target: { x?: number; y?: number; width?: number; height?: number },
) {
  const box = await locator.boundingBox();
  expect(box, `Expected geometry for ${locator}`).not.toBeNull();
  for (const key of Object.keys(target) as Array<keyof typeof target>) {
    expect(Math.abs(box![key]! - target[key]!)).toBeLessThanOrEqual(2);
  }
}
