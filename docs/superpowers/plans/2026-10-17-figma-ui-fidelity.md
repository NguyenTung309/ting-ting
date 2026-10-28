# Ting-ting Figma UI Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. User currently requests analysis and plan; implementation starts after their review.

**Goal:** Đưa các trang có frame Done về đúng phần tử, nội dung, typography, crop và khoảng cách tại1280px/393px, có minh chứng kiểm tra lại.

**Architecture:** Giữ Next/React và component nghiệp vụ hiện có. Mỗi nhóm CSS có một nơi quyết định theo page/state; chuyển Home thành bố cục section theo reference và tách khỏi quy tắc nén quiz. Figma là chuẩn đối chiếu ban đầu, browser screenshot đã duyệt là chuẩn chống regression.

**Tech Stack:** Next16.3.5, React19.2.8, Tailwind4, CSS, next/font/local, GSAP3.15, Playwright1.63, Sharp0.35.

**Spec:** [Spec chính và chia phiên triển khai](../../specs/2026-10-17-figma-ui-fidelity.md). Bằng chứng: [báo cáo đối chiếu](../../research/2026-10-17-figma-ui-audit.md), [nghiên cứu xác minh](../../research/2026-10-17-figma-visual-verification.md), Figma fileGmzxui5petX6JblbBjAaYP / section563:784.

## Global Constraints

- Chuẩn đã được người dùng xác nhận: **Done desktop1280px/mobile393px**; frame/node theo bảng trong báo cáo.
- Mobile bỏ44px status bar iOS khỏi tọa độ và chiều cao; header website40px.
- Desktop header56px; footer chung344px; mobile theo frame237px, Home181px.
- Giữ thay đổi chưa commit của người dùng ở app/(site)/page.tsx, app/globals.css, app/home-viewport.css, payload-types.ts.
- Chỉ triển khai phần giao diện có đối chiếu; không thay scoring, quyền xem kết quả, claim/login, persistence và hợp đồng API.
- Nội dung/ảnh của Done được ưu tiên khi mâu thuẫn DESIGN.md cũ. Slogan Anaktoria cần font đúng hoặc export vector đúng.
- Không thêm thư viện CSS/animation/test mới khi công cụ hiện có đáp ứng.
- Đọc Next docs tại node_modules/next/dist/docs/ trước khi sửa mã liên quan.
- Mỗi trang: bằng chứng trước/sau tại1280/393, overlay và số đo anchor; không nghiệm thu chỉ bằng cảm giác.
- Anchor chính sai số tối đa2CSSpx tại width chuẩn; exact font/size/weight/color; không có lệch section tích lũy. Hiệu chỉnh ngưỡng raster theo chênh thực tế, không che các khối lớn.
- Không lấy screenshot UI hiện tại làm baseline đạt. Baseline browser chỉ được duyệt sau so với Figma.
- Commit theo task sau khi kiểm tra; chỉ stage file thuộc task, không git add toàn bộ workspace.

## File ownership dự kiến

| File | Trách nhiệm sau thay đổi |
|---|---|
| app/globals.css | Tokens/font, shared header/footer, About và pairing; bỏ rule Home/quiz/library/blog trùng thuộc nhóm khác |
| app/figma-31.css | Card, library/detail, blog, quiz/loading/result theo selector scope |
| app/test-entry-figma.css | Entry bài test desktop+mobile |
| app/home.css (đổi tên từ home-viewport.css) | Chỉ Home, section flow/crop/responsive; không chứa quiz |
| app/(site)/layout.tsx | Import CSS đúng thứ tự đã chuẩn hóa, font đúng |
| components/site/SiteHeader.tsx, SiteFooter.tsx | Shared navigation/footer và variant thực tế |
| components/site/TrendFilter.tsx | 3pill dùng cùng q/kind contract |
| components/site/LibraryCarousel.tsx | Composition Up coming theo reference |
| components/site/ComingSoon.tsx | Pairing, card nếu tái sử dụng có variant rõ ràng |
| components/tests/TestRunner.tsx | Entry/question/loading presentation, hành vi giữ nguyên |
| components/tests/FigmaResultPage.tsx | Presentation của route kết quả thật |
| tests/visual/*, playwright.visual.config.ts | Capture ổn định, geometry gates, browser regression |
| docs/design/figma-reference.json | File/node/size/state/asset/font mapping đã khóa |
| docs/design/figma-reference/* | PNG1x chuẩn, không dùng URL asset tạm làm nguồn lâu dài |

Không tạo module chỉ để bọc một selector. Nếu giữ CSS cũ trong file khác, phải chứng minh nó không còn cạnh tranh cùng thuộc tính tại cùng breakpoint; ưu tiên di chuyển/xóa định nghĩa trùng.

## Task 1: Khóa reference và dựng công cụ đối chiếu

**Files:** create docs/design/figma-reference.json, docs/design/figma-reference/, playwright.visual.config.ts, tests/visual/ready.ts, tests/visual/geometry.spec.ts; reuse .scratch/figma-ui-audit/.

**Consumes:** frame map và các snapshot Figma/browser hiện có.
**Produces:** reference PNG1x, manifest, readyForCapture(page) và expectGeometry(locator, target).

- [x] Ghi lại git status, lưu patch những file dirty và chụp baseline trước khi đổi CSS. Không reset chúng.
- [x] Từ MCP lấy metadata/context/screenshot của từng frame Done. Screenshot export maxDimension bằng cạnh dài để đạt1x; kiểm tra Sharp metadata bằng đúng width/height. Context call dùng skillNames resource:figma-design-to-code.
- [x] Lưu mỗi manifest entry gồm fileKey,nodeId,route,state,width,figmaHeight,osInsetTop,referencePath và anchors. Ví dụ dữ liệu đầu vào đã xác minh:

```json
{
  "fileKey": "Gmzxui5petX6JblbBjAaYP",
  "sectionNodeId": "563:784",
  "screens": [
    {"name":"home-desktop","nodeId":"304:532","route":"/","state":"settled","width":1280,"figmaHeight":3798,"osInsetTop":0},
    {"name":"home-mobile","nodeId":"141:420","route":"/","state":"settled","width":393,"figmaHeight":3408,"osInsetTop":44}
  ]
}
```

- [x] Điền đủ10cặp frame và4cặp loading từ bảng báo cáo, kèm anchor header/title/CTA/art/section/footer; trạng thái selectedA tách khỏi unselected.
- [x] Tạo config độc lập, không thay config functional trong bước này:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:3003",
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: "light",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 393, height: 852 } } },
  ],
  webServer: {
    command: "node node_modules/next/dist/bin/next start --port 3003",
    url: "http://localhost:3003",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
```

- [x] Implement helper để không treo trên hidden lazy images:

```ts
import { expect, type Page, type Locator } from "@playwright/test";

export async function readyForCapture(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = [...document.images].filter(image => {
      const box = image.getBoundingClientRect();
      return box.width > 0 && box.height > 0;
    });
    images.forEach(image => { image.loading = "eager"; });
    await Promise.race([
      Promise.all(images.map(image => image.decode().catch(() => undefined))),
      new Promise(resolve => setTimeout(resolve, 5000)),
    ]);
    if (images.some(image => !image.complete || image.naturalWidth === 0)) {
      throw new Error("Visible image is not ready");
    }
  });
}

export async function expectGeometry(
  locator: Locator,
  target: { x?: number; y?: number; width?: number; height?: number },
) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  for (const key of Object.keys(target) as Array<keyof typeof target>) {
    expect(Math.abs(box![key] - target[key]!)).toBeLessThanOrEqual(2);
  }
}
```

- [x] Trước capture Home, route GIF request tới frame tĩnh đã chọn chỉ trong test. Chọn frame có composition phù hợp reference, lưu PNG trong tests/visual/fixtures/hero.png. Ghi rõ chuyển động sẽ kiểm riêng.
- [x] Viết geometry failure có ý nghĩa, chạy trên code chưa sửa để chứng minh phát hiện lệch:

```ts
import { test } from "@playwright/test";
import { readyForCapture, expectGeometry } from "./ready";

test("home section anchors follow Done", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop node 304:532");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await readyForCapture(page);
  await expectGeometry(page.locator(".ttt-home footer"), { y: 3454, height: 344 });
});
```

- [x] Chạy build, sau đó `node node_modules/@playwright/test/cli.js test --config=playwright.visual.config.ts --grep "home section anchors"`. Trước sửa: failure y3932 thay vì3454.
- [x] Dùng Sharp làm side-by-side/overlay từ hai ảnh1x. Không scale một ảnh để bù layout sai.

**Gate:** reference đủ, capture không lệ thuộc font/lazy/GIF ngẫu nhiên, test phát hiện sai hiện tại. Commit test/reference khi đã review.

## Task 2: Chuẩn hóa CSS và shared header/footer

**Files:** modify app/(site)/layout.tsx, app/globals.css, app/figma-31.css, app/test-entry-figma.css, components/site/SiteHeader.tsx, SiteFooter.tsx; rename app/home-viewport.css→app/home.css; update DESIGN.md.

**Consumes:** reference manifest, readyForCapture/expectGeometry.
**Produces:** ownership theo bảng và shared variants, không rule quiz trong home.css.

- [x] Lập bảng selector/property/breakpoint đang cạnh tranh; bắt đầu .ttt-home-screen, .ttt-home-wave, .ttt-quiz-shell, .ttt-answer-option.
- [x] Chuyển toàn bộ quiz rules về figma-31.css và Home rules về home.css, bỏ bản cũ trùng; đổi import layout. Trong bước migration giữ geometry trước sửa, xác nhận không phát sinh thay đổi ngoài dự kiến bằng ảnh.
- [x] Khớp header56/40, nav weight/active, icon và mobile menu với node gốc. Giữ liên kết/keyboard và route active hiện có.
- [x] Khớp footer desktop344, credit16 và URL Behance. Đặt variant mobile home181/default237 theo route; cập nhật callsite embedded của About/Home tương ứng.
- [x] Giữ14file CDA; audit computed font weight, line-height và xuống dòng. Ghi ngoại lệ Anaktoria trong DESIGN.md.
- [x] Chụp shared footer ở Home/About/Pairing/Card và so với frame tương ứng; không ép nội dung footer qua height quá thấp.

**Gate:** import/ownership rõ, header/footer đúng node và không cắt text, các trang không mất footer hoặc có2footer. Commit nhóm shared.

## Task 3: Sửa Home theo section và crop chuẩn

**Files:** app/(site)/page.tsx, app/home.css, app/globals.css (xóa bản Home trùng), components/site/ScrollScenes.tsx nếu animation đặt transform làm lệch vị trí cuối; tests/visual/geometry.spec.ts.

- [ ] Thay cùng-height viewport bằng section riêng. Dùng geometry từ node304:532/141:420, flow cho text và footer, artwork position trong section.
- [ ] Tại desktop1280: hero bounds x−142,y56,w1564,h595; không dùng width152% và height844 cho ảnh chuẩn.
- [ ] Khớp heading About x192,y1038.97; art y919; pairing start2187.73; sharing x100,w1080; footer y3454.
- [ ] Sửa từng section ở mobile theo node141:420 sau khi trừ44px. Footer y3183,h181; tổng3364.
- [ ] Kiểm tra1280×832 và1280×900: các mốc nội dung không tự đổi theo cửa sổ. Kiểm tra393×667 có thể cuộn bình thường.
- [ ] Capture GIFfixture ổn định, overlay toàn trang và từng section; kiểm motion riêng với preference bình thường.
- [ ] Chạy geometry rồi screenshot regression chỉ sau duyệt overlay. Không cắt bỏ hero khỏi phép kiểm.

**Gate:** tổng3798/3364 và anchors đạt sai số, crop/art đúng, CTA trỏ đúng route. Commit Home.

## Task 4: Dựng lại Card Coming soon

**Files:** app/(site)/card/page.tsx, app/figma-31.css, components/site/ComingSoon.tsx nếu tái sử dụng; public/figma-assets/design/ (asset thiếu); tests/visual/card.spec.ts.

- [ ] Đối chiếu asset bf639.png/8abcb.png với screenshot546:1200/546:1268 trước khi dùng; export lại nếu file thiếu hoặc không cùng artwork.
- [ ] Thay deck/SOS bằng Coming soon, subtitle/body/social chính xác từ card.txt. Giữ nội dung thực có thể đọc được, không đặt aria-hidden trên toàn bộ text.
- [ ] Desktop main776, heading48px#ffbecc; subtitle24bolditalic#80e7ff; body20trắng. Copy group x192,y282,w530; nhân vật/crop theo Figma.
- [ ] Bỏ rule mobile .figma-card-artboard > * {display:none}; dựng composition mobile từ node546:1268.
- [ ] Capture1280/393, kiểm social click và /card-online redirect.

**Gate:** đủ text/art, nền đúng, tổng1176/1050, không còn màn trống mobile. Commit Card.

## Task 5: Kho xu hướng và chi tiết Saver

**Files:** app/(site)/kho-tang-tinh-cach/page.tsx, [slug]/page.tsx, components/site/TrendFilter.tsx, app/figma-31.css, app/globals.css (xóa rule cạnh tranh), lib/trends/catalog.ts và schema trình bày hiện có nếu cần nội dung; tests/visual/library.spec.ts.

- [ ] Đặt desktop hero595, intro x192,y675,w896; heading48bold, controls y1089,h108, grid y1245,h808.
- [ ] Mobile: container x24,w345, filter216 và grid1900 theo node424:2314. Đọc row/gap cụ thể từ node, không scale175px hiện tại.
- [ ] Giữ signature TrendFilter({selectedKind,searchQuery}); thay select bằng3button/pill:

```tsx
const choices = [
  ["all", "Tất cả 15 xu hướng"],
  ["base", "5 xu hướng chính"],
  ["hybrid", "10 xu hướng kết hợp"],
] as const;
// Bên trong component hiện có:
<div className="figma-trend-filter" role="group" aria-label="Lọc xu hướng">
  {choices.map(([kind, label]) => (
    <button key={kind} type="button" aria-pressed={selectedKind === kind}
      onClick={() => {
        const params = new URLSearchParams({ kind });
        if (searchQuery) params.set("q", searchQuery);
        router.push("/kho-tang-tinh-cach?" + params.toString() + "#library-controls");
      }}>{label}</button>
  ))}
</div>
```

- [ ] Test click mỗi pill, kiểm URL kind và q được giữ; count5/10/15 khi q rỗng; search tiếng Việt không dấu và empty state.
- [ ] Modal Saver x100,y186,w1080,h1020,title48; close48px và spacing40/80theo node483:1197. Modal cuộn được trên viewport thấp; không khóa mất phần cuối.
- [ ] Dùng nội dung Saver trong context Figma cho dữ liệu trình bày:4nhóm bullet và brand note, tránh ghép câu khác reference. Giữ raw data phục vụ scoring tách khỏi copy hiển thị khi cần.
- [ ] Mobile chi tiết dùng node424:3432: hero/copy/coin/title/bullets/brandnote/related, tổng2318 với đúng nội dung.
- [ ] Kiểm URL trực tiếp, close về controls, các trend khác vẫn hiển thị và text dài không tràn.

**Gate:** kho đủ15thẻ, controls đúng loại, geometry/reference đạt, detail không dùng khoảng trắng giả bù nội dung. Commit library/detail.

## Task 6: Góc chia sẻ và dữ liệu capture

**Files:** app/(site)/blog/page.tsx, components/site/LibraryCarousel.tsx, app/figma-31.css; new components/site/BlogListing.tsx chỉ nếu cần tách view khỏi loader; tests/visual/blog.spec.ts, tests/visual/fixtures/blog.json.

- [ ] Theo mục tiêu exact hiện tại, dùng thẻ Up coming của424:2429/424:2594 cho khối Thư viện; không giữ ảnh chiến dịch như thể đã khớp.
- [ ] Chỉnh desktop library x100,y120,w1080,h557; blog group x100,y837,w1080; bỏ padding145 làm title xuống1002.
- [ ] Tách view thuần props nếu cần fixture: BlogListing({posts}: {posts:PublicPost[]}), loader vẫn gọi getPublishedPosts. Fixture chứa1featured+4post có text/cover từ reference, không ghi đè CMS production.
- [ ] Đưa fixture vào CMS test riêng bằng luồng seed của môi trường kiểm thử hoặc gọi view qua harness chỉ phục vụ test. Không dùng page.route cho server-side CMS fetch vì không chặn được fetch phía server.
- [ ] Khớp card aspect ratio/ảnh/copy/spacing mobile từ frame. Kiểm cả dữ liệu2bài thực tế, dữ liệu5bài chuẩn và empty/category.
- [ ] Compare chuẩn tổng2124/1449 chỉ khi cùng data; với CMS khác chỉ gate geometry của phần tử tương ứng.

**Gate:** không đánh đồng thiếu data với lỗi CSS; bài viết và filter vẫn hoạt động. Commit Blog.

## Task 7: About, Ghép Ting và entry

**Files:** app/(site)/ve-du-an/page.tsx, components/site/ComingSoon.tsx, app/globals.css, app/test-entry-figma.css, public/fonts/, public/figma-assets/design/, DESIGN.md; tests/visual/secondary-pages.spec.ts.

- [ ] About: thay a185b.png bằng4c59c.png, đúng crop/size của nhóm thực hiện; sửa alt theo ảnh chụp nhóm.
- [ ] Hero title48px; slogan Anaktoria24white và bỏ pill. Nếu không có font được phép dùng, export nguyên dòng slogan403:564 dạng vector đúng, kèm text accessible; ghi mapping asset/font trong manifest.
- [ ] Overlay About từng block, giữ orderTính/Tình đã đúng1280; chỉ thay curve/timeline nếu diff xác nhận lệch.
- [ ] Ghép Ting:48bold/24bolditalic#4dc2dd/20, copy x650,y156,w530; hiện3sao desktop, nền kem; khớp mobile và footer237.
- [ ] Entry desktop giữ heading x650,y304,w530 và48px đã gần đúng; kiểmCTA/art/paragraph. Mobile xử lý thiếu46px tổng theo từng anchor, không cộng padding mù.
- [ ] Capture sau fontready ở cả width, xác nhận About vẫn4262/4429 và entry1176/1045 với nội dung đúng.

**Gate:** asset và font đúng, không đổi copy rộng hơn nhu cầu, các CTA vẫn hoạt động. Commit nhóm trang.

## Task 8: Question, loading và full result

**Files:** components/tests/TestRunner.tsx, FigmaResultPage.tsx, app/figma-31.css, app/test-entry-figma.css, app/(site)/ket-qua/[code]/page.tsx chỉ khi cần trình bày; tests/visual/test-flow.spec.ts, tests/e2e/public-site.spec.ts.

- [ ] Câu hỏi desktop: contentwidth896, heading24bold, optionmin88,gap12 theo414:1155. Bỏ ép viewport/overflowclip; canh arrow/progress đúng node.
- [ ] Kiểm selectedA và unselected, back/next/last, câu dài nhất;393×667 và393×852 phải cuộn được, không mất nút.
- [ ] Đối chiếu asset corner SVG ở cùng scale; chỉ export lại nếu diff xác nhận gradient/noise hiện tại khác reference.
- [ ] Loading4state: dùng Playwright clock kiểm soát700ms/stage thay vì sleep ngẫu nhiên. Trì hoãn response test evaluate trong test để giữ state, capture tại0/700/1400/2100ms; không gọi tạo kết quả thực từ bài audit.
- [ ] Cung cấp session test hợp lệ và owned-result fixture để mở full result qua route thật. Dùng storageState local ngoài Git; không lưu token/credential trong docs. Nếu chưa có session, dùng presentation fixture FigmaResultPage riêng để so view và ghi route-auth là gate chưa đạt.
- [ ] Điều chỉnh **FigmaResultPage** và .figma-result-* theo414:1995/464:1176: hero/coin, radar, scorebars,4insights,brandnote,links. Không chỉnh legacy ResultView như màn hoàn tất.
- [ ] Tách capture owned/full, anonymous preview/login, claim-progress, invalid code; giữ nguyên quyền xem và scoring. Chỉ full state mới đối chiếu frame kết quả đầy đủ.
- [ ] Sửa selector E2E hiện stale theo Bắt đầu test/Câu1/22/Tiếp theo và redirect kết quả. Chỉ cập nhật expectation theo hành vi hiện tại đã xác minh; không xóa assertion quyền truy cập để suite xanh.
- [ ] Capture và gate height3500 desktop/mobile3456 khi cùng data/result, cộng kiểm content dài khác không cắt.

**Gate:** question/loading/full-result đã so trực tiếp; chưa có session/data thì không tuyên bố đóng toàn bộ task. Commit test-flow sau kiểm hành vi.

## Task 9: Nghiệm thu production và bàn giao

**Files:** tests/visual/*, tests/e2e/public-site.spec.ts, docs/research/2026-10-17-figma-ui-audit.md (append kết quả sau sửa), docs/design/figma-reference.json.

- [ ] `node node_modules/next/dist/bin/next build`; start3003 bằng visual config, không reuse dev.
- [ ] Chạy geometry từng page/state ở1280/393. Bổ sung width trung gian768/1024 và shortheight667 cho overflow, không đòi giống frame chưa tồn tại ở các width này.
- [ ] Dùng readyForCapture; xuất PNG1x, overlay50%, difference map và metricsjson. GIF cố định trong capture; kiểmanimation tương tác riêng.
- [ ] Với từng màn đã đạt Figma, lưu browser baseline rồi dùng:

```ts
await expect(page).toHaveScreenshot("home.png", {
  fullPage: true,
  animations: "disabled",
  scale: "css",
});
```

- [ ] Calibrate tolerance với text rasterization thực; không mask artwork/text/layout quan trọng để suite pass.
- [ ] Chạy functionalsmoke:nav/mobilemenu,CTA,3filter/search,detailclose,blog/category,testanswer/back/submit,owned/anonymousresult theo fixture kiểm thử.
- [ ] Chạy typecheck/lint cho thay đổi cần thiết, functional E2E cập nhật trên môi trường test. Không lặp cả suite khi không còn rủi ro cụ thể.
- [ ] Ghi bảng từng màn Pass/Fail/Blocked bởi input với linkảnh và delta, phân biệt lỗi còn tồn tại và state không có frame.
- [ ] Review gitdiff, chỉ commit thay đổi thuộc UI/test/docs đã làm; không stage payload-types.ts hay generated/junk nếu không thuộc task.

**Definition of done:** mọi màn có frame trong scope có bằng chứng cả desktop/mobile, typography/art/content đúng, anchor đạt gate, không cắt nội dung, production và hành vi chính đã kiểm; không còn gắn nhãn “giống Figma” cho state chưa kiểm.

## Tóm tắt triển khai để duyệt

### Chuẩn bắt buộc

- Bộ Done đã được người dùng xác nhận. Bảng ánh xạ đã khởi tạo tại [figma-reference.json](../../design/figma-reference.json): **28 frame**, gồm 10 cặp màn hình desktop/mobile và 4 cặp loading.
- Manifest mới khóa node, trạng thái, kích thước và phép trừ 44px iOS; chưa có nghĩa mọi frame đã có PNG 1x hoặc đã được nghiệm thu. Trạng thái export được ghi trên từng entry.
- “Giống Figma” gồm đúng phần tử, thứ tự, copy, ảnh, crop, font, line-height, xuống dòng, màu và khoảng cách. Các thay thế bằng ảnh hoặc font gần giống không được coi là đạt.
- Dữ liệu mẫu chỉ dùng để tái hiện phép đo. Bản bàn giao vẫn phải kiểm tra dữ liệu hiển thị thật; fixture đạt không thay thế việc xử lý nội dung khác thiết kế.
- Chênh rasterization chữ phải ghi riêng. Ngưỡng anchor 2px là giới hạn kiểm tra sai số làm tròn, không cho phép dịch cả khối hoặc chấp nhận sai khác nhìn thấy rõ.

### Bốn mốc bàn giao

| Mốc | Task | Đầu ra để duyệt | Điều kiện qua mốc |
|---|---|---|---|
| A — Chuẩn và nền CSS | 1–2 | Manifest, PNG chuẩn, capture ổn định, ownership CSS, shared header/footer | Không còn quy tắc xung đột ở phần đã chuyển; đúng font và biến thể footer |
| B — Các sai lệch lớn | 3–4 | Home và Card desktop/mobile, ảnh trước/sau/overlay | Đúng composition, crop và mốc section; Card mobile có đủ nội dung |
| C — Các trang nội dung | 5–7 | Kho xu hướng/detail, Blog, About, Ghép Ting và entry | Đúng nội dung/ảnh/font; filter/search/link vẫn hoạt động |
| D — Luồng test và nghiệm thu | 8–9 | Question, 4 loading, full result và báo cáo production | Đã kiểm đúng trạng thái; không cắt nội dung; đủ bằng chứng visual và functional |

Không cộng margin để bù lỗi từ section trước, không thêm file override mới chỉ để thắng cascade, và không khóa chiều cao toàn trang để che nội dung thiếu.

### Bằng chứng bắt buộc cho từng màn

- [ ] PNG Figma 1x cùng node và trạng thái; mobile chuẩn hóa gốc tọa độ.
- [ ] PNG browser sau font/image ready; GIF và loading có thời điểm xác định.
- [ ] Overlay và bảng tọa độ header/title/CTA/art/section/footer.
- [ ] Nội dung, font và asset không còn dùng bản thay thế khác Figma.
- [ ] Kiểm tra bản production ở 1280px/393px, cùng kiểm tra tràn/cắt trên màn thấp.
- [ ] Các thao tác của màn vẫn hoạt động; full result giữ điều kiện sở hữu và đăng nhập.

Các điều kiện đầu vào cần giải quyết trong triển khai: font/export slogan Anaktoria, nội dung hiển thị giống reference và session/result hợp lệ cho màn kết quả. Chúng không cản việc bắt đầu CSS, Home hoặc Card; phần phụ thuộc chưa đủ đầu vào phải được ghi chưa nghiệm thu.

## Kết quả tự rà soát kế hoạch

- F01/F02→Task3; F03→Task4; F04/F05→Task5; F06→Task6; F07/F08→Task7; F09→Task8; F10→Task1/2/9.
- Khoảng trống kết quả/loading đã có Task8 với điều kiện dữ liệu và session rõ ràng.
- Các trang ngoài frame Done nằm ngoài tuyên bố exact, theo scope báo cáo.
- Chưa thực thi task sửa UI nào trong lượt phân tích này.

