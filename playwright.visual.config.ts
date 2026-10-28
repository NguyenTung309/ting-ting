import { defineConfig } from "@playwright/test";

const baseURL = process.env.VISUAL_BASE_URL ?? "http://localhost:3003";
const serverCommand = process.env.VISUAL_SERVER_COMMAND ?? "node node_modules/next/dist/bin/next start --port 3003";

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: "light",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 393, height: 852 } } },
  ],
  ...(process.env.VISUAL_EXTERNAL_SERVER === "1"
    ? {}
    : {
        webServer: {
          command: serverCommand,
          url: baseURL,
          reuseExistingServer: false,
          timeout: 120_000,
        },
      }),
});
