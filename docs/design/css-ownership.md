# CSS ownership

Layout import order: globals -> figma-31 -> test-entry-figma -> home.

| File | Owner |
| --- | --- |
| app/globals.css | Tokens, shared header/footer, About, Pairing and other preexisting common rules |
| app/home.css | Home scenes, artwork and Home-only placement; preserves user viewport adjustments |
| app/figma-31.css | Finance quiz/loading/result, Card, library and Blog |
| app/test-entry-figma.css | Finance entry composition only |

## Competing declarations before migration

The migration checkpoint is `.scratch/figma-milestone-a/migration/`: all ten metric objects exactly match `baseline-settled/shared-metrics.json`, including Home scene geometry and navigation. Both quiz sizes also pass the original nine-box baseline check. Screenshot differences are the removed Next development issue badge and the Home/About hero arrow becoming hidden after the now-hydrated scroll listener runs; all measured geometry is unchanged.

After that checkpoint, shared header/footer declarations were removed from all four CSS files and replaced by the single Done chrome section in `globals.css`. Embedded placement is a distinct rule for About's existing absolute mobile final scene. Footer mobile composition is selected by pathname in `SiteFooter`, independently of embedding; no page callsite needs a new geometry prop and each tested route renders one footer. Finance entry CSS no longer controls header/footer geometry.

Removed 154 Home and 34 finance declarations shadowed by a later declaration with an identical selector and full media context. Within-rule fallbacks such as `vh` followed by `svh` are retained. Different selectors and distinct media contexts remain where necessary to preserve the user's Home geometry for Milestone B.

Final dev evidence: `.scratch/figma-milestone-a/shared-dev/` contains ten full-page screenshots, forty native-size side/overlay shared crops, 440 passing geometry deltas (maximum 0px), and navigation/hydration/font results. At 393px, Home is 181px and other footers are 237px. At narrower widths, content can increase footer height; at tablet widths, the credit line wraps.

Original order was globals -> figma-31 -> test-entry-figma -> home-viewport. Values below record actual source evidence; later entries with the same specificity/breakpoint won. Mixed selector lists/media blocks are split without changing specificity. Shared chrome is consolidated separately after the migration capture.

| Source | Selector | Breakpoint | Properties |
| --- | --- | --- | --- |
| app/globals.css:358 | `.ttt-home-wave` | base | position: absolute; z-index: 1; top: -72px; left: 50%; display: flex; width: 100%; flex-direction: column; align-items: center; padding-top: 38px; transform: translateX(-50%) |
| app/globals.css:374 | `.ttt-home-wave img` | base | position: absolute; top: 0; left: 0; display: block; width: 100%; height: auto |
| app/globals.css:382 | `.ttt-home-wave img.mobile` | base | display: none |
| app/globals.css:1182 | `.ttt-home-wave img.desktop` | (max-width: 767px) | display: none |
| app/globals.css:1183 | `.ttt-home-wave img.mobile` | (max-width: 767px) | display: block; width: 393px; height: 36px |
| app/globals.css:2086 | `.ttt-home-screen` | base | position: relative; display: flex; width: 100%; height: auto; min-height: calc(100vh - var(--ttt-home-header-height)); min-height: calc(100svh - var(--ttt-home-header-height)); align-items: center; justify-content: center; scroll-snap-align: start; scroll-snap-stop: always |
| app/globals.css:2098 | `.ttt-home-screen-opening` | base | display: block |
| app/globals.css:2106 | `.ttt-home-screen-about .ttt-home-about, .ttt-home-screen-test .ttt-home-test, .ttt-home-screen-sharing .ttt-home-sharing` | base | margin-top: 0; margin-bottom: 0 |
| app/globals.css:2109 | `.ttt-home-screen-pairing > .ttt-home-pairing` | base | width: 100%; height: 100%; min-height: 100%; flex: 0 0 100% |
| app/globals.css:2110 | `.ttt-home-screen-sharing` | base | flex-direction: column; align-items: stretch; justify-content: space-between |
| app/globals.css:2111 | `.ttt-home-screen-sharing > .ttt-home-sharing` | base | flex: 0 0 auto; margin: auto auto |
| app/globals.css:2112 | `.ttt-home-screen-sharing > .ttt-site-footer.is-home` | base | width: 100%; flex: 0 0 auto |
| app/globals.css:2967 | `.ttt-home-screen-about` | (min-width: 768px) | align-items: flex-start; padding-top: clamp(120px, 13.59375vw, 174px) |
| app/globals.css:2972 | `.ttt-home-screen-about > .ttt-home-about` | (min-width: 768px) | margin: 0 auto |
| app/globals.css:2979 | `.ttt-home-screen-test` | (min-width: 768px) | align-items: flex-start; padding-top: clamp(80px, 7.421875vw, 95px) |
| app/globals.css:2984 | `.ttt-home-screen-test > .ttt-home-test` | (min-width: 768px) | margin: 0 auto |
| app/globals.css:2989 | `.ttt-home-screen-sharing` | (min-width: 768px) | height: auto; min-height: calc(100svh - var(--ttt-home-header-height)); align-items: stretch; justify-content: space-between |
| app/globals.css:2996 | `.ttt-home-screen-sharing > .ttt-home-sharing` | (min-width: 768px) | margin: auto |
| app/globals.css:3006 | `html:has(.ttt-home) .ttt-home-screen-about` | (max-width: 767px) | align-items: flex-start; padding-top: 85px |
| app/globals.css:3011 | `html:has(.ttt-home) .ttt-home-screen-test` | (max-width: 767px) | align-items: flex-start; padding-top: 12px |
| app/globals.css:3016 | `html:has(.ttt-home) .ttt-home-screen-sharing` | (max-width: 767px) | height: auto; min-height: calc(100svh - var(--ttt-home-header-height)); flex-direction: column; align-items: stretch; justify-content: space-between |
| app/globals.css:3045 | `.ttt-home-screen-about > .ttt-home-about` | (max-width: 767px) | margin: 0 auto; transform: none |
| app/globals.css:3064 | `.ttt-home-screen-test > .ttt-home-test` | (max-width: 767px) | width: min(344px, calc(100% - 48px)); min-height: 0; margin: 0 auto |
| app/globals.css:3073 | `.ttt-home-screen-sharing > .ttt-home-sharing` | (max-width: 767px) | width: min(344px, calc(100% - 48px)); min-height: 0; height: auto; gap: 32px; margin: auto |
| app/globals.css:3081 | `.ttt-home-screen-sharing > .ttt-site-footer.is-home` | (max-width: 767px) | flex: 0 0 181px |
| app/globals.css:3572 | `.ttt-home-screen-sharing` | (min-width: 768px) and (max-width: 1279px) | height: auto; min-height: calc(100svh - var(--ttt-home-header-height)); justify-content: space-between |
| app/globals.css:3578 | `.ttt-home-screen-sharing > .ttt-home-sharing` | (min-width: 768px) and (max-width: 1279px) | margin: auto auto 24px |
| app/globals.css:3590 | `.ttt-home .ttt-home-screen` | base | background: var(--ttt-site-surface) |
| app/globals.css:3638 | `.ttt-home-wave` | (max-width: 767px) | width: 100vw; height: auto |
| app/globals.css:3643 | `.ttt-home-wave img.mobile` | (max-width: 767px) | width: 100%; height: auto; aspect-ratio: 393 / 36 |
| app/globals.css:3766 | `.ttt-home, .ttt-home .ttt-home-screen, html:has(.ttt-home), html:has(.ttt-home) body` | base | background-color: var(--ttt-site-surface) |
| app/globals.css:3901 | `.ttt-home, .ttt-home .ttt-home-screen, html:has(.ttt-home), html:has(.ttt-home) body` | (max-width: 767px) | background-color: var(--ttt-site-surface) |
| app/globals.css:3966 | `.ttt-home .ttt-home-screen` | base | box-sizing: border-box; height: auto; min-height: calc(100vh - var(--ttt-home-header-height, 56px)); min-height: calc(100svh - var(--ttt-home-header-height, 56px)); background: var(--ttt-site-surface) |
| app/globals.css:3974 | `.ttt-home .ttt-home-screen-opening > .ttt-home-opening` | base | height: auto; min-height: inherit |
| app/globals.css:3979 | `.ttt-home .ttt-home-screen-about > .ttt-home-about, .ttt-home .ttt-home-screen-test > .ttt-home-test` | base | margin-block: 0 |
| app/globals.css:3984 | `.ttt-home .ttt-home-screen-pairing` | base | align-items: stretch |
| app/globals.css:3988 | `.ttt-home .ttt-home-screen-pairing > .ttt-home-pairing` | base | width: 100%; height: auto; min-height: calc(100svh - var(--ttt-home-header-height, 56px)); flex: 1 0 auto; background: var(--ttt-site-surface) |
| app/globals.css:3996 | `.ttt-home .ttt-home-screen-sharing` | base | height: auto; min-height: calc(100vh - var(--ttt-home-header-height, 56px)); min-height: calc(100svh - var(--ttt-home-header-height, 56px)); flex-direction: column; align-items: stretch; justify-content: space-between |
| app/globals.css:4005 | `.ttt-home .ttt-home-screen-sharing > .ttt-home-sharing` | base | height: auto; flex: 0 0 auto; margin: auto |
| app/globals.css:4011 | `.ttt-home .ttt-home-screen-sharing > .ttt-site-footer.is-home` | base | width: 100%; flex: 0 0 auto |
| app/globals.css:4072 | `.ttt-home .ttt-home-screen-pairing > .ttt-home-pairing` | (max-width: 767px) | min-height: max(
      100svh - var(--ttt-home-header-height, 40px),
      clamp(560px, 154.96cqw, 609px)
    ) |
| app/globals.css:4104 | `.ttt-home .ttt-home-screen` | (prefers-reduced-motion: reduce) | scroll-snap-stop: normal |
| app/globals.css:4272 | `.ttt-home-screen-sharing > .ttt-site-footer.is-home` | (max-width: 767px) | flex-basis: auto |
| app/globals.css:4286 | `html:has(.ttt-home), html:has(.ttt-home) body, .ttt-home, .ttt-home .ttt-home-screen` | base | background: var(--ttt-site-surface) |
| app/globals.css:4335 | `html:has(.ttt-home), html:has(.ttt-home) body, .ttt-home, .ttt-home .ttt-home-screen` | (max-width: 767px) | background: var(--ttt-site-surface) |
| app/globals.css:4346 | `.ttt-home .ttt-home-screen` | (max-width: 767px) | height: auto; min-height: 0; flex: 0 0 auto |
| app/globals.css:4352 | `.ttt-home .ttt-home-screen-opening > .ttt-home-opening` | (max-width: 767px) | min-height: 0 |
| app/globals.css:4356 | `.ttt-home .ttt-home-screen-about, .ttt-home .ttt-home-screen-test, .ttt-home .ttt-home-screen-pairing` | (max-width: 767px) | padding-bottom: 64px |
| app/globals.css:4362 | `.ttt-home .ttt-home-screen-about > .ttt-home-about, .ttt-home .ttt-home-screen-test > .ttt-home-test` | (max-width: 767px) | margin-block: 0 |
| app/globals.css:4367 | `.ttt-home .ttt-home-screen-pairing > .ttt-home-pairing` | (max-width: 767px) | height: auto; min-height: clamp(560px, 154.96vw, 609px) |
| app/globals.css:4372 | `.ttt-home .ttt-home-screen-sharing > .ttt-home-sharing` | (max-width: 767px) | margin: 0 auto 64px |
| app/globals.css:4376 | `html:has(.ttt-home) .ttt-home .ttt-home-screen-sharing` | (max-width: 767px) | min-height: 0 |
| app/globals.css:4380 | `.ttt-home .ttt-home-screen-sharing > .ttt-site-footer.is-home` | (max-width: 767px) | min-height: 181px |
| app/globals.css:4397 | `.ttt-home .ttt-home-screen` | (min-width: 1200px) | min-height: 0 |
| app/globals.css:4398 | `.ttt-home .ttt-home-screen-opening` | (min-width: 1200px) | min-height: 844px |
| app/globals.css:4399 | `.ttt-home .ttt-home-screen-about` | (min-width: 1200px) | min-height: 691px; padding-top: 19px; padding-bottom: 154px |
| app/globals.css:4404 | `.ttt-home .ttt-home-screen-test` | (min-width: 1200px) | min-height: 596px; padding-top: 0; padding-bottom: 100px |
| app/globals.css:4409 | `.ttt-home .ttt-home-screen-pairing` | (min-width: 1200px) | min-height: 860px; padding-bottom: 160px |
| app/globals.css:4413 | `.ttt-home .ttt-home-screen-pairing > .ttt-home-pairing` | (min-width: 1200px) | height: 700px; min-height: 700px; flex: 0 0 700px |
| app/globals.css:4418 | `html:has(.ttt-home) .ttt-home .ttt-home-screen-sharing` | (min-width: 1200px) | min-height: 0 |
| app/globals.css:4421 | `.ttt-home .ttt-home-screen-sharing > .ttt-home-sharing` | (min-width: 1200px) | margin: 0 auto 36px |
| app/globals.css:4881 | `.ttt-home .ttt-home-screen-pairing` | (min-width: 768px) | min-height: 0; padding-bottom: 96px |
| app/globals.css:4886 | `.ttt-home .ttt-home-screen-pairing > .ttt-home-pairing` | (min-width: 768px) | height: auto; min-height: 820px; flex: 0 0 auto; justify-content: flex-start; padding: 72px 24px 440px |
| app/globals.css:5367 | `.ttt-home .ttt-home-screen` | base | scroll-snap-align: none; scroll-snap-stop: normal |
| app/globals.css:5373 | `.ttt-home .ttt-home-screen-opening .ttt-home-wave` | (min-width: 1200px) | top: -66px; width: 110.764vw; height: auto |
| app/globals.css:5385 | `.ttt-home .ttt-home-screen-pairing .ttt-home-pairing-art .ttt-pairing-hand-left` | (min-width: 1200px) | top: 0.694vw; bottom: auto; left: -6.111vw; width: 34.653vw; height: 37.222vw; object-fit: cover; object-position: left center; transform: rotate(-6.59deg) |
| app/globals.css:5396 | `.ttt-home .ttt-home-screen-pairing .ttt-home-pairing-art .ttt-pairing-hand-right` | (min-width: 1200px) | display: block; top: 4.028vw; right: auto; left: 71.597vw; width: 30.764vw; height: 32.708vw; object-fit: cover; object-position: right center; transform: rotate(3.3deg) |
| app/globals.css:5408 | `.ttt-home .ttt-home-screen-pairing .ttt-home-pairing-art .ttt-pairing-coin` | (min-width: 1200px) | display: block; top: min(48.568vw, calc(100svh - 201px)); left: 75.134vw; width: 7.84vw; height: 7.84vw |
| app/globals.css:5418 | `.ttt-home .ttt-home-screen-opening .ttt-home-wave` | (max-width: 767px) | top: 27px; width: min(393px, 100vw); height: auto |
| app/globals.css:5424 | `.ttt-home .ttt-home-screen-opening .ttt-home-wave img.mobile` | (max-width: 767px) | display: block; width: 100%; height: auto; aspect-ratio: 393 / 36 |
| app/globals.css:5431 | `.ttt-home .ttt-home-screen-opening .ttt-home-wave img.desktop` | (max-width: 767px) | display: none |
| app/globals.css:1030 | `.ttt-quiz-shell` | base | position: relative; min-height: 961px; overflow: hidden; background: var(--ttt-cream); padding: 80px 24px 64px |
| app/globals.css:1039 | `.ttt-answer-option` | base | display: flex; width: 100%; min-height: 64px; align-items: center; border: 2px solid #ffb4c4; border-radius: 24px; padding: 12px 24px; background: #fff; color: #171717; text-align: left; cursor: pointer; transition: border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease, color 180ms ease, transform 180ms ease |
| app/globals.css:1040 | `.ttt-answer-option:hover` | base | border-color: var(--ttt-pink); transform: translateY(-1px) |
| app/globals.css:1041 | `.ttt-answer-option:active` | base | transform: scale(.99) |
| app/globals.css:1042 | `.ttt-answer-option:focus-visible` | base | outline: 3px solid #ff8cab; outline-offset: 3px |
| app/globals.css:1043 | `.ttt-answer-option.is-selected` | base | border-color: var(--ttt-pink); background: #fff4f7; box-shadow: 0 5px 16px rgba(255, 73, 116, .14); color: var(--ttt-pink); font-weight: 700; animation: ttt-answer-selected 240ms cubic-bezier(.2,.75,.25,1) both |
| app/globals.css:1044 | `.ttt-answer-option > span:last-child` | base | font-size: 18px; line-height: 1.6 |
| app/globals.css:1354 | `.ttt-quiz-shell` | (max-width: 767px) | min-height: 720px; padding: 34px 22px 48px |
| app/globals.css:1361 | `.ttt-answer-option` | (max-width: 767px) | min-height: 56px; border-radius: 18px; padding: 10px 14px |
| app/globals.css:1362 | `.ttt-answer-option > span:last-child` | (max-width: 767px) | font-size: 15px; line-height: 1.45 |
| app/globals.css:3488 | `.ttt-quiz-shell` | (min-width: 768px) | min-height: min(961px, 66.7361vw); padding: clamp(54px, 5.5556vw, 80px) 24px clamp(40px, 4.4444vw, 64px) |
| app/globals.css:3499 | `.ttt-answer-option > span:last-child` | (min-width: 768px) | font-size: clamp(15px, 1.3889vw, 20px) |
| app/globals.css:4279 | `.ttt-quiz-question, .ttt-answer-option` | (prefers-reduced-motion: reduce) | animation: none; transition: none |
| app/globals.css:4551 | `.ttt-answer-option` | base | display: block |
| app/globals.css:4552 | `.ttt-answer-option > span:first-child` | base | margin-right: 4px; font-size: 18px; line-height: 1.6 |
| app/globals.css:4558 | `.ttt-answer-option > span:first-child` | (min-width: 768px) | font-size: clamp(15px, 1.3889vw, 20px) |
| app/globals.css:4561 | `.ttt-answer-option > span:first-child` | (max-width: 767px) | font-size: 15px; line-height: 1.45 |
| app/globals.css:4565 | `.ttt-quiz-shell` | (min-width: 1200px) | min-height: min(897px, 62.3vw) |
| app/home-viewport.css:198 | `.ttt-test-page .ttt-quiz-shell` | (min-width: 768px) | box-sizing: border-box; height: calc(100svh - 56px); min-height: 0; overflow: clip; padding: clamp(28px, 5svh, 56px) 24px 56px |
| app/home-viewport.css:210 | `.ttt-test-page .ttt-answer-option` | (min-width: 768px) | min-height: clamp(46px, 6svh, 56px); border-radius: 18px; padding: 8px 16px |
| app/home-viewport.css:211 | `.ttt-test-page .ttt-answer-option > span:last-child` | (min-width: 768px) | font-size: clamp(14px, 1.1vw, 16px); line-height: 1.35 |
| app/home-viewport.css:215 | `.ttt-test-page .ttt-quiz-shell` | (max-width: 767px) | box-sizing: border-box; height: calc(100svh - 40px); min-height: 0; overflow: clip; padding: clamp(16px, 3.2svh, 26px) 18px 68px |
| app/home-viewport.css:227 | `.ttt-test-page .ttt-answer-option` | (max-width: 767px) | min-height: clamp(42px, 5.8svh, 50px); border-radius: 15px; padding: 7px 11px |
| app/home-viewport.css:228 | `.ttt-test-page .ttt-answer-option > span:last-child` | (max-width: 767px) | font-size: clamp(13px, 1.7svh, 14px); line-height: 1.3 |
| app/home-viewport.css:2 | `.ttt-home .ttt-home-screen` | base | box-sizing: border-box; height: calc(100svh - var(--ttt-home-header-height, 56px)); min-height: 0; padding: 0 |
| app/home-viewport.css:9 | `.ttt-home .ttt-home-screen-opening > .ttt-home-opening` | base | position: relative; height: 100%; min-height: 0 |
| app/home-viewport.css:15 | `.ttt-home .ttt-home-screen-opening .ttt-home-hero` | base | position: absolute; inset: 0; z-index: 0; height: 100%; min-height: 0; flex: none |
| app/home-viewport.css:24 | `.ttt-home .ttt-home-screen-opening .ttt-home-intro` | base | position: absolute; z-index: 2; right: 0; bottom: 0; left: 0; display: flex; height: max(170px, calc(100svh - var(--ttt-home-header-height, 56px) - 595px)); min-height: 0; flex: none |
| app/home-viewport.css:39 | `.ttt-home .ttt-home-screen-opening .ttt-home-intro::before` | base | position: absolute; z-index: 0; top: calc(-26px + min(1595px, 112vw) * 0.0457031); right: 0; bottom: 0; left: 0; background: #fff9f0; content: ""; pointer-events: none |
| app/home-viewport.css:51 | `.ttt-home .ttt-home-screen-opening .ttt-home-wave` | base | top: -52px |
| app/home-viewport.css:55 | `.ttt-home .ttt-home-screen-opening .ttt-home-hero-image` | base | left: 0; width: 100%; transform: none |
| app/home-viewport.css:61 | `.ttt-home .ttt-home-screen-opening .ttt-home-hero-image img` | base | top: 0; left: 50%; width: 152%; height: 100%; max-width: none; object-fit: cover; object-position: center; transform: translateX(-50%) |
| app/home-viewport.css:72 | `.ttt-home .ttt-home-screen-about, .ttt-home .ttt-home-screen-test` | base | align-items: center |
| app/home-viewport.css:77 | `.ttt-home .ttt-home-screen-about > .ttt-home-about, .ttt-home .ttt-home-screen-test > .ttt-home-test` | base | margin: 0 auto |
| app/home-viewport.css:82 | `.ttt-home .ttt-home-screen-pairing > .ttt-home-pairing` | base | height: 100%; min-height: 0; flex: 1 1 auto; justify-content: flex-start; padding: clamp(48px, 7svh, 72px) 24px 0 |
| app/home-viewport.css:90 | `.ttt-home .ttt-home-screen-pairing .ttt-pairing-hand-left` | base | width: min(820px, calc((100svh - var(--ttt-home-header-height, 56px)) * 1.05)) |
| app/home-viewport.css:94 | `html:has(.ttt-home) .ttt-home .ttt-home-screen-sharing` | base | height: calc(100svh - var(--ttt-home-header-height, 56px)); flex-direction: column; align-items: stretch; justify-content: space-between |
| app/home-viewport.css:101 | `.ttt-home .ttt-home-screen-sharing > .ttt-home-sharing` | base | height: auto; min-height: 0; flex: 0 0 auto; margin: auto auto |
| app/home-viewport.css:108 | `.ttt-home .ttt-home-screen-sharing > .ttt-site-footer.is-home` | base | flex: 0 0 auto |
| app/home-viewport.css:130 | `html:has(.ttt-home) .ttt-home .ttt-home-screen-about, html:has(.ttt-home) .ttt-home .ttt-home-screen-test` | (max-width: 767px) | align-items: center; padding: 0 |
| app/home-viewport.css:136 | `.ttt-home .ttt-home-screen-opening .ttt-home-intro` | (max-width: 767px) | justify-content: center; padding: 0 24px |
| app/home-viewport.css:141 | `.ttt-home .ttt-home-screen-about > .ttt-home-about, .ttt-home .ttt-home-screen-test > .ttt-home-test` | (max-width: 767px) | min-height: 0 |
| app/home-viewport.css:146 | `.ttt-home .ttt-home-screen-pairing > .ttt-home-pairing` | (max-width: 767px) | padding: clamp(48px, 8svh, 80px) 24px 0 |
| app/home-viewport.css:150 | `.ttt-home .ttt-home-screen-pairing .ttt-pairing-hand-left` | (max-width: 767px) | width: min(460px, 110vw) |
| app/home-viewport.css:154 | `.ttt-home .ttt-home-screen-sharing > .ttt-home-sharing` | (max-width: 767px) | margin: auto auto |
| app/home-viewport.css:160 | `.ttt-home .ttt-home-screen-sharing > .ttt-home-sharing` | (max-width: 767px) and (max-height: 720px) | gap: 16px |
| app/home-viewport.css:170 | `.ttt-home .ttt-home-screen-sharing > .ttt-site-footer.is-embedded` | (min-width: 1200px) and (max-height: 700px) | height: auto; min-height: 190px |
| app/home-viewport.css:187 | `.ttt-home .ttt-home-screen-sharing > .ttt-home-sharing` | (max-width: 767px) and (max-height: 620px) | gap: 8px |
| app/home-viewport.css:237 | `.ttt-home .ttt-home-screen-opening .ttt-home-intro` | (max-width: 767px) | height: max(0px, calc(100svh - var(--ttt-home-header-height, 40px) - min(507px, 65svh, 129vw))); justify-content: flex-start; padding: 0 clamp(16px, 6.11vw, 24px) |
| app/home-viewport.css:245 | `.ttt-home .ttt-home-screen-opening .ttt-home-intro::before` | (max-width: 767px) | top: calc(32px + 4.5802vw) |
| app/home-viewport.css:251 | `.ttt-home .ttt-home-screen-opening .ttt-home-wave` | (max-width: 767px) | top: 32px; width: 100vw; padding-top: 24px |
| app/home-viewport.css:259 | `.ttt-home .ttt-home-screen-opening .ttt-home-wave` | (min-width: 768px) | width: min(1595px, 112vw) |
| app/home-viewport.css:268 | `.ttt-home .ttt-home-screen-opening .ttt-home-intro::before` | (min-width: 768px) and (max-width: 1199.98px) | top: calc(-52px + min(1595px, 112vw) * 0.0457031) |
| app/home-viewport.css:272 | `.ttt-home .ttt-home-screen-opening .ttt-home-wave` | (min-width: 768px) and (max-width: 1199.98px) | padding-top: 64px |
| app/home-viewport.css:278 | `.ttt-home .ttt-home-screen-opening .ttt-home-wave` | (min-width: 1200px) | top: -26px |

