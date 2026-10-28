import { describe, expect, it } from "vitest";

import { defaultSiteSettings, mapPublicSiteSettings } from "@/lib/site-settings";
import { characterAssetForResult } from "@/lib/tests/submissions";
import { TREND_PROFILES } from "@/lib/trends/catalog";

describe("site settings and result character presentation", () => {
  it("falls back when CMS content is missing or incomplete", () => {
    expect(mapPublicSiteSettings({}).resultJourney).toEqual(defaultSiteSettings.resultJourney);
    expect(mapPublicSiteSettings({ resultJourney: { compare: { title: "Tiêu đề CMS" } } }).resultJourney).toEqual({
      compare: {
        title: "Tiêu đề CMS",
        description: defaultSiteSettings.resultJourney.compare.description,
        ctaLabel: defaultSiteSettings.resultJourney.compare.ctaLabel,
      },
      matching: defaultSiteSettings.resultJourney.matching,
    });
  });

  it("selects the SUN or MOON asset for a public result snapshot", () => {
    const trend = TREND_PROFILES[0];
    expect(characterAssetForResult("SUN", { ...trend, sunAsset: "/sun.png" })).toBe("/sun.png");
    expect(characterAssetForResult("MOON", { ...trend, moonAsset: "/moon.png" })).toBe("/moon.png");
    expect(characterAssetForResult(undefined, trend)).toBeUndefined();
  });
});
