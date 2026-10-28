# Figma visual fidelity verification research

Date: 2026-10-17 (Asia/Saigon). Scope: repository CSS, local assets/fonts, and existing verification setup. No application code changed. This note does not claim a live browser/Figma visual comparison; that is being collected separately in the parent audit.

## Conclusions from source inspection

1. **The active CSS combines incompatible page-height strategies.** The site layout imports `globals.css`, `figma-31.css`, `test-entry-figma.css`, then `home-viewport.css` in that order (`app/(site)/layout.tsx:11-14`). Desktop home styles in `globals.css:4395-4417` describe an editorial frame rhythm: opening minimum 844px, about minimum 691px with 19px/154px vertical padding, test minimum 596px with 100px bottom padding, pairing minimum 860px. Later `home-viewport.css:2-6` assigns every `.ttt-home .ttt-home-screen` a viewport-dependent height, `min-height:0`, and `padding:0`. These selectors have equal specificity, so later declarations supersede those properties under overlapping media conditions. At viewport height 900px and a 56px header, all five screens request 844px rather than those different scene heights. This is a source-level explanation for changed inter-section spacing; actual final boxes must still be measured in the browser.

2. **Some latest-looking fixes in globals are superseded by a different file.** Desktop `.ttt-home .ttt-home-screen-opening .ttt-home-wave` uses `top:-66px; width:110.764vw` at `globals.css:5373-5375`, but exactly the same selector later gets `width:min(1595px,112vw)` at `home-viewport.css:258-260` and `top:-26px` at `:277-279`. Mobile `top:27px; width:min(393px,100vw)` at `globals.css:5417-5421` is superseded by `top:32px; width:100vw` at `home-viewport.css:236-255`. More appended declarations in globals will not fix this ordering by themselves.

3. **Questionnaire dimensions also change in the last import.** `figma-31.css:47-55` sets desktop quiz minimum height 776px, question title 24px, answer gap 12px and answer minimum height 88px. `home-viewport.css:197-211` replaces these with `height:calc(100svh - 56px)`, minimum height zero, clipped overflow, 18-21px titles, 5-8px answer gaps and 46-56px answer minimum height. Mobile follows the same viewport compression at `home-viewport.css:214-228`, overriding `figma-31.css:217-227`. This is a substantial typography and density change, not a 1-2px discrepancy. The intended authoritative Figma node/state must decide which strategy is retained. Clipped overflow is also a concrete risk with long questions or short windows, pending browser measurement.

4. **The main interface font infrastructure already exists.** Fourteen CDA Independence Deck OTF variants (normal/italic, weights 300-900) exist under `public/fonts/cda-independence-deck/` and are explicitly registered in `app/(site)/layout.tsx:16-34`; `globals.css:30,37` uses that family for interface text. `DESIGN.md`, Typography Rules, requires this family. Font family/weight must be checked against the current Figma node; replacing the main interface family is unnecessary. The follow-up below identifies a specific Anaktoria slogan exception in the Figma context. `display:swap` means captures should wait for font readiness before measuring line wrapping.

5. **Artwork is available, but crop and frame identity remain part of the audit.** Read-only Sharp metadata returned: home-about desktop 557x562, home-about mobile cutout 361x286, home-test desktop cutout 492x437, home-test mobile cutout 344x306, pairing hands 4724x2362; each has alpha. They are under `public/figma-assets/design/`. `app/(site)/page.tsx:66-84` already uses the responsive composites. `home-viewport.css:61-69` separately renders hero art at 152% width and `object-fit:cover`; this must be compared to the Figma crop instead of assuming the right source image guarantees the right visible result.

6. **Home screenshots need an explicit animated-art policy.** `app/(site)/page.tsx:31` uses `/tinhtinhtingting.gif`; metadata reports 2944x1248 and 65 frames. CSS animation disabling does not select a deterministic GIF frame. `components/site/ScrollScenes.tsx:52-56` already skips its GSAP animations for reduced-motion preferences. Static comparisons should use reduced motion plus an agreed fixed GIF frame only in the capture fixture, with motion assessed separately. Do not mask the large hero region and then call it visually verified.

7. **Current tests cannot detect general visual drift.** `playwright.config.ts:8-19` has one Desktop Chrome project, runs `pnpm dev`, reuses an existing server, and has no explicit Figma viewport matrix. `tests/e2e/public-site.spec.ts` and `post-mvp.spec.ts` verify routes, content, interactions and API results. The result hero/detail relative bounding-box assertion is useful but does not compare positions to Figma. Searching all tests and the config found no `toHaveScreenshot`, `toMatchSnapshot`, screenshot capture, or Figma viewport assertions. Existing tests passing would therefore not prove fidelity.

8. **Asset audit tooling must not trust the manifest yet.** `public/figma-assets/design/manifest.json:673` ends with literal `]\\n` (a backslash and n after the JSON array); a direct `JSON.parse` fails there. This is an asset inventory issue, not evidence of a runtime rendering failure. Compare actual filenames/node export mappings first; repair the manifest only if implementing an inventory tool that consumes it.

## Smallest reliable verification method

### A. Establish an external design reference

- Export the current approved Figma frame/node at 1x and record file key, node ID, frame dimensions, state, and capture date. Capture whole frames without the prototype viewer chrome. If an animated frame or interaction is represented, also record the state being compared.
- Build a small route/state-to-node table. Include the shared header/footer, home sections, about page, test entry/question/result/loading, library/detail, and blog pages only where matching Figma frames exist. Keep browser features without a Figma frame explicit; do not invent an exact-match claim for them.
- Read the design's actual font family, weight, size, line-height, letter-spacing, text content and intended line breaks. Read asset bounds/crops and parent-relative x/y/width/height. A viewport screenshot alone cannot resolve these measurements.

### B. Compare a stable browser render at those dimensions

- Reuse the installed `@playwright/test` 1.63.0. Set viewport width/height to the matching Figma frame, `deviceScaleFactor:1`, `scale:'css'`, and `reducedMotion:'reduce'` for static layout verification. Pin browser version and OS for repeat captures. Use stable data fixtures for dynamic result/blog content.
- Wait for page hydration and `document.fonts.ready`; decode the relevant images and assert they have nonzero `naturalWidth`. Scroll through sections if lazy loading requires it. Use the agreed static hero frame in the capture fixture. Return to the defined scroll position before capture. `networkidle` by itself is not a statement that fonts, images, or GSAP layout are ready.
- Capture whole-page output for section offsets and separate section screenshots for diagnosis. Compare the Figma PNG and browser capture without rescaling: side-by-side, 50% alpha overlay, and a difference image. Ensure equal coordinate origin and dimensions before interpreting differences.
- Record actual bounding boxes and computed typography for the main anchors: header/nav, heading, paragraph, CTA, illustration bounds, section edges and footer. This makes a report actionable: expected/actual/delta in CSS pixels rather than a subjective match percentage. Use exact font/color/token values and agreed small geometric tolerances; calibrate image-diff tolerance to actual rasterization noise instead of selecting a large ratio that can hide layout errors.

### C. Keep the approved browser result from regressing

- Once each implementation matches the design and is reviewed, save its browser screenshot as the regression baseline and use `expect(page or section).toHaveScreenshot(...)`. A baseline generated automatically from the current wrong UI only preserves that wrong UI; it is not evidence of matching Figma.
- Keep design-reference comparison separate from browser-to-browser regression. Text anti-aliasing and different rendering engines can prevent a literal zero-pixel difference between Figma exports and a browser even when layout metrics match; use structural measurements plus overlay review for that initial match. Browser regression should be far stricter on the pinned environment.
- Before accepting a page, check the production build as well. The installed Next.js CSS guide explicitly says development and production CSS ordering can differ. A final visual gate should run against the production server on a dedicated port rather than silently reusing an unknown dev process. Preserve the existing functional E2E tests as behavior checks.
- Test at exact design widths first. After matching those, add only representative intermediate widths and short-height checks to catch overflow/wrapping. Responsive behavior between frames is an implementation decision until a design rule exists.

## Recommended implementation sequence

1. Record current dirty work and capture the current browser before changes. User modifications currently exist in home page/globals/home-viewport/payload types; do not overwrite them while normalizing CSS.
2. Freeze route-to-Figma-node mapping and approved desktop/mobile references.
3. Resolve CSS ownership for the conflicting home and quiz selectors. Retain a single authoritative definition for each state/breakpoint; migrate only the touched page rules to scoped CSS if useful. A repository-wide styling rewrite is unnecessary.
4. Fix shared typography/header/footer, then section dimensions, then artwork crop, then spacing/details. Otherwise later font or container changes invalidate earlier pixel tuning.
5. Repeat capture/overlay/geometry review per page; then save approved browser baselines and perform the production check.

## Primary sources

- Repository files cited inline above: `DESIGN.md`; `app/(site)/layout.tsx`; `app/(site)/page.tsx`; `app/globals.css`; `app/figma-31.css`; `app/test-entry-figma.css`; `app/home-viewport.css`; `components/site/ScrollScenes.tsx`; `playwright.config.ts`; `tests/e2e/public-site.spec.ts`; `tests/e2e/post-mvp.spec.ts`; actual `public/fonts/` and `public/figma-assets/design/` files. Source state inspected on 2026-10-17; no app files edited by this research task.
- Installed Next.js 16.3.5 guide: `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md:294,400-458` documents global CSS conflict risks, import ordering, and production verification. Public equivalent: <https://nextjs.org/docs/app/getting-started/css>.
- Installed Next.js font guide: `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`, Local fonts section, documents paths relative to the declaring file and multi-file family registration. Public equivalent: <https://nextjs.org/docs/app/getting-started/fonts>.
- Installed Playwright 1.63.0 API types: `node_modules/.pnpm/playwright@1.63.0/node_modules/playwright/types/test.d.ts:9853-9950` documents screenshot stability checks, animation behavior, CSS pixel scaling, masks, style injection and diff options. Primary online API: <https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-1>; visual comparison guide: <https://playwright.dev/docs/test-snapshots>. API claims here were checked against the installed types; no claim is made that those online pages were fetched during this research.

## Follow-up: result routing and canonical Done content

This follow-up uses the parent audit's stored MCP text under `.scratch/figma-ui-audit/figma/` as the Figma primary-source snapshot. No new Figma/browser calls were made by this research task. The metadata identifies `563:784` as the `Done` section (`page-metadata.xml:2209`), containing the 1280px about/card/result frames. Older unsectioned 1440px designs also exist in that metadata and must not silently replace the chosen Done references.

### Actual result flow: shared route, different access states

**Do not report the old inline ResultView as the active completed-test screen.** It still exists at `components/tests/TestRunner.tsx:116-194` and is selected by `if (result)` at `:341`, but the state starts at null (`:206`) and the only `setResult(...)` call in this source is `setResult(null)` during reset (`:337`). Successful `evaluate()` instead reads the API response, stores its code, waits for the finance loading animation, then calls `window.location.assign(data.resultUrl)` (`:253-269`). The legacy branch is currently unreachable through this normal path; editing its styles would not fix the result screen users actually reach.

The API builds `resultUrl` as `/ket-qua/CODE` for a logged-in user and `/ket-qua/CODE?claim=1` for an anonymous user (`app/api/tests/[slug]/evaluate/route.ts:40-44`, with the same pattern for compatibility at `:88`). `app/(site)/result/[code]/page.tsx:3-6` permanently redirects to the same `/ket-qua/` route. Completion and reopening therefore use the same presentation route, conditional on access:

| Current state | Rendered presentation | Source |
| --- | --- | --- |
| Anonymous, public result exists | `ResultFeaturedTrend` hero plus inline Google login/access gate | `app/(site)/ket-qua/[code]/page.tsx:22-29` |
| Anonymous, no public result | Access gate without the preview hero | same file `:24-25` |
| Logged in, `claim=1` | Claim-progress state, then client claim flow | same file `:31`; `components/tests/ResultClaimLink.tsx` |
| Logged in, owned result found | Full `FigmaResultPage` | result route `:32-37` |
| Logged in, owned result absent | Invalid/unavailable-result state | result route `:34-35` |

`ResultFeaturedTrend` is already shared between anonymous preview and the full page (`components/tests/FigmaResultPage.tsx:46-58,72-73`). Full analysis, score chart/bars, four insight cards, brand note and next-section links are rendered only by `FigmaResultPage` (`:75-104`). The Done result frame is `414:1995`, 1280x3500 (`page-metadata.xml:5187`); a logged-out access-gated page cannot visually match that full-analysis state because its content is intentionally different.

**Minimum presentation fix:** retain the existing canonical route, shared `ResultFeaturedTrend`, access checks, claim cookies, scoring and persistence. Tune the live `FigmaResultPage` and its `.figma-result-*` styles against Done result frame `414:1995`. Style the access gate as a clearly separate additional state; do not remove its authorization behavior in a pixel-fidelity change. Add deterministic owned-result and anonymous-preview capture fixtures. Optional removal of unreachable `ResultView` is cleanup after reference checks, not a prerequisite to achieving fidelity. If a future inline result preview is needed, render the same shared presentation with a typed adapter rather than reactivate the old duplicated layout.

Existing E2E expectations also need refreshing against the current flow: `public-site.spec.ts` expects the finance name field, the old start-button wording, and a standalone inline result-details box, while `TestRunner.tsx:385-390` now renders a finance entry without the name field and redirects after completion. Its result hero/detail geometry assertion assumes details start after the hero, whereas `FigmaResultPage.tsx:72-73` places `data-testid="result-details"` on the wrapper containing that hero. Do not use those stale expectations to decide which UI is correct.

### Card: high-confidence wrong design/state

The Done card reference is node `546:1200`, **1280x1176**, including a 56px header, art from y=56 to y=832, and a 344px footer (`page-metadata.xml:4109-4111`). Its stored context has:

- Main copy at x=192, y=282, width 530; heading `Coming soon`, 48px, light pink `#ffbecc`.
- Subtitle `Lật một lá bài, chuyện dài thêm hay!`, bold italic 24px, `#80e7ff`.
- White 20px body `Một chút bất ngờ, một chút thú vị và biết đâu là cả những điều bạn chưa từng nghĩ tới!`, follow/social block, and hanging artwork at the right.

Source: `.scratch/figma-ui-audit/figma/card.txt:126-153` and its asset declarations `:1-4`.

The current `/card` renders a generated deck, six plain card backs, and giant `SOS` instead (`app/(site)/card/page.tsx:13-20`), with a cyan minimum-2100px artboard (`app/figma-31.css:141-155`). On mobile, `figma-31.css:293-295` hides **every direct child** of its artboard, leaving no card-page copy/art in that area. These are structural/content mismatches, not spacing tolerances. `/card-online` already redirects to `/card`, so it should keep doing so. Minimum fix: implement the Done coming-soon composition in this route with its real desktop/mobile assets and content; do not enable gameplay or a new card feature merely to match this holding screen. `ComingSoon` has a `card` variant, but its current card text/art is generic and does not match this reference (`components/site/ComingSoon.tsx:31-44`), so selecting that variant alone is insufficient.

### Pairing: content largely matches; scale, color and decorations differ

The route already intentionally renders the coming-soon state (`app/(site)/tuong-thich-doi/page.tsx:12-13`). Its current copy in `components/site/ComingSoon.tsx:37-55` substantially matches the Done snapshot `.scratch/figma-ui-audit/figma/pairing.txt:172-193`; no compatibility/scoring feature change is needed.

Concrete source differences:

- Figma title/subtitle/body are **48/24/20px** and subtitle color is **`#4dc2dd`**, with a bold-italic subtitle (`pairing.txt:174-178`). The app uses subtitle `var(--ttt-cyan)` (`globals.css:1011`) which is **`#37a7c9`** (`:16`). Its final base type sizes scale from 1440 using `cqw` (`:3213-3216`): at a 1280px page container, the formulas yield approximately **42.67/21.33/17.78px**, smaller than the canonical 1280 frame. Confirm effective font weight in the browser; this rule specifies italic but no bold weight.
- The Figma copy group is x=650, y=156, width530 (`pairing.txt:172`); code sizes and offsets are based on a 1260px/1440px composition (`globals.css:3176-3210`). Measure final boxes against these reference coordinates before tuning individual margins.
- Three visible decorative stars exist in the desktop Figma context (`pairing.txt:150-170`), whereas `.ttt-coming-stars` is hidden in the default/desktop rules (`globals.css:999`) and enabled only inside mobile rules (`:1342`). This removes actual design elements.
- The app adds a top pink gradient (`globals.css:4309-4311`), while the Figma root is the flat `#fffaf4` page canvas (`pairing.txt:20-22`). Match the actual reference fill rather than preserve an unrelated inherited gradient.

Minimum fix: use the canonical 1280 geometry and typography as the reference, keep the matching copy and existing coming-soon behavior, correct subtitle color/weight and desktop decorations, then derive responsive interpolation from approved mobile/desktop frames. Avoid treating a global 1440-based scale as exact for this 1280 design.

### About: content broadly matches; slogan font conflicts with local design guidance

The approved about frame is `403:386`, **1280x4262**, inside Done (`page-metadata.xml:3387`). Its hero, explanation, name meanings, 4T values, journey and team paragraphs substantially match `app/(site)/ve-du-an/page.tsx`; no content rewrite is justified by this source check.

The high-confidence typography exception is the hero slogan: Figma uses **Anaktoria Regular 24px**, white text, a transparent text container with 10px padding, and typographic quotation marks (`about-desktop.txt:183-185`). Code renders CDA Independence Deck semibold italic, adds a pink background/pill, and defines a 20px base with responsive overrides (`globals.css:791-800,2310,2441`), with unquoted copy (`app/(site)/ve-du-an/page.tsx:42`). No Anaktoria font exists under `public/fonts` or is registered in the layout. `DESIGN.md` currently requires CDA for all interface text and bans introducing another font; this is a documented requirement conflict to resolve in the implementation plan against the user's new exact-Figma goal. Obtain the approved font or export this short slogan as a faithful vector/image with accessible text; do not silently substitute another decorative font.

**Do not falsely flag the name-card order at the 1280 reference.** Figma places mint `Tính` left and pink `Tình` right (`about-desktop.txt:257-271`, metadata `:3479-3485`). Although the JSX lists pink first, `globals.css:4967-4968` explicitly positions mint in column1 and pink in column2 for widths1200-1439. It already matches that reference ordering. Other viewports need their own corresponding-frame comparison.

## Limits

This source audit proves overlapping declarations, available files and missing test coverage. It does not establish which current Figma node is authoritative, the exact visual deltas, whether all fonts successfully load in the running browser, or whether a short-height question actually clips. Those require the parent's live node measurements and browser captures. Arbitrary animation instants and every possible viewport cannot be promised to match a static design export byte-for-byte.
