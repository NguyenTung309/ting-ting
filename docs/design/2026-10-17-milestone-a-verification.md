# Mốc A — bằng chứng triển khai

## Phạm vi

- Spec: [2026-10-17-figma-ui-fidelity.md](../specs/2026-10-17-figma-ui-fidelity.md).
- Chuẩn: file `Gmzxui5petX6JblbBjAaYP`, section Done `563:784`, desktop 1280px/mobile 393px. Bỏ 44px iOS khi so với website.
- Nhánh: `feat/figma-milestone-a`, xuất phát từ `5bb2414772e5bff155c364e3d130f8e83dfcdcd3` cùng thay đổi có sẵn của người dùng.
- Mốc A gồm reference/capture, ownership CSS và header/footer. Chưa nghiệm thu bố cục toàn trang của các mốc B/C/D.

## Bảo toàn trạng thái trước sửa

Trước sửa đã lưu patch, trạng thái Git, bản sao 12 file và SHA256 tại `.scratch/figma-milestone-a/baseline/`. Các file có thay đổi từ trước: `app/(site)/page.tsx`, `app/globals.css`, `app/home-viewport.css`, `payload-types.ts`.

Ảnh browser trước sửa: `.scratch/figma-milestone-a/baseline/{home,about,pairing,card,entry}-{1280,393}.png`. Có ảnh quiz riêng. Bảng số đo: `browser-tool-output.txt`, `quiz-browser.txt`, `header-card-browser.txt` trong cùng thư mục.

| Trang | Desktop: tổng / footer | Mobile: tổng / footer |
|---|---|---|
| Home | 4276 / 344 | 4100 / 189 |
| About | 4262 / 344 | 4429 / 237; nội dung footer trong chỉ 189 |
| Ghép Ting | 1170 / 344 | 1006 / 189 |
| Card | 2500 / 344 | 999 / 189 |
| Entry | 1176 / 343 (capture đã ổn định) | 999 / 189 |

Entry desktop có capture trung gian 1101px; lần chụp sau đã xác nhận trạng thái ổn định là 1176px (ảnh tại `.scratch/figma-milestone-a/baseline-settled/entry-1280.png`). Quiz desktop ở viewport 1280×832: shell 776px, answer list 321.15625px, gap 6.656px. Những số đo quiz này là baseline bảo toàn migration, chưa phải giá trị đúng Figma.

## Reference và công cụ chụp

- Đã lưu 28 PNG gốc 1x và 28 PNG chuẩn hóa tại `docs/design/figma-reference/`; bản mobile chuẩn hóa cắt 44px iOS, ảnh gốc vẫn giữ nguyên.
- `node scripts/figma-visual/verify-reference.mjs` xác nhận đủ 28 node duy nhất, kích thước ảnh gốc/chuẩn hóa đúng và ID header/footer đầy đủ.
- `python .scratch/figma-milestone-a/check-shell-xml.py` xác nhận 56 ID header/footer và bounding box theo ancestry của XML Figma; sai số tối đa 0.01px trong phép kiểm này.
- Manifest ghi provenance, font và asset đã có context. Anchor chi tiết chưa xác minh được để `null`, cần đọc node tương ứng khi triển khai B/C/D; không dùng tọa độ suy đoán.
- Config Playwright riêng có viewport 1280×900/393×852, DPR1, reduced motion và production port3003. `VISUAL_EXTERNAL_SERVER=1` chỉ dùng khi chủ động kiểm một server đã khởi động riêng.
- Helper đợi font, ảnh/lazy content và layout ổn định với timeout hữu hạn. GIF Home được cố định ở frame32 trong capture, giữ animation thật trong sản phẩm.

### Bằng chứng trước sửa

- `.scratch/figma-milestone-a/baseline/red/`: mobile Card footer 189 thay vì237, Home189 thay vì181; Home desktop footer y3932 thay vì3454 (lệch478px).
- `.scratch/figma-milestone-a/baseline-settled/`: chụp lại đủ10 trang/viewports bằng helper sau khi sửa bước đợi layout, có `shared-metrics.json` và ảnh PNG.
- Kiểm quiz tại1280×832 và393×852 xác nhận mỗi viewport có9 bounding boxes khớp baseline về vị trí/kích thước/font/gap/padding. Đây là kiểm bảo toàn trước migration, chưa phải nghiệm thu quiz theo Figma.

## CSS và kiểm chứng production

- CSS ownership đã được tách theo trách nhiệm: `globals.css` giữ shared chrome, `home.css` giữ Home, `figma-31.css` giữ quiz/Card/library/Blog và `test-entry-figma.css` giữ entry. CSS migration giữ nguyên 10 metric object của baseline-settled và 9 box quiz ở cả hai viewport.
- Shared shell trên production-final: 10 capture, 440 phép đo geometry, sai số lớn nhất 0px, không có failure; header/footer có đúng số lượng, đúng font/width và fill native Figma. Kết quả tại `.scratch/figma-milestone-a/production-final/shared-geometry-deltas.json`.
- Production route heights/footer: Home `4276/344` desktop và `4100/181` mobile; About `4262/344` và `4429/237`; Pairing `1170/344` và `1054/237`; Card `2500/344` và `1047/237`; Entry `1177/344` và `1047/237`. Entry/Pairing/Card mobile tăng theo footer Done 237px; nội dung composition của các màn này vẫn để Mốc B/C.
- Responsive smoke pass ở 320×667, 393×667, 768×900 và 1024×900 cho Home/About: footer text không cắt, mỗi route có một footer, Home tagline không chồng socials. Interaction check pass menu/dropdown/active route/search/Behance và không có page error hoặc hydration error.
- `node node_modules/next/dist/bin/next build` exit0. Build vẫn ghi một warning có sẵn về dynamic filesystem tracing tại `app/api/admin/gallery/route.ts:43`; warning này không phát sinh từ Mốc A.
- Playwright visual suite production: 3 test pass, 5 test skip có điều kiện theo project/diagnostic; không coi các skip là pass. Typecheck và focused ESLint exit0.
- Hydration follow-up: browser repro showed QuillBot adding `data-qb-installed` and `suppresshydrationwarning` to `<html>` before React hydration. `app/(site)/layout.tsx` now uses React's `suppressHydrationWarning` at that root boundary; an injected-attribute repro and five public routes produce zero console/page errors. This suppresses extension-owned root attributes without changing application markup.
- Final review không có Critical/Important finding. Ba Minor được giữ làm giới hạn có chủ đích: capture helper scroll để kích hoạt lazy content nên arrow Home/About bị ẩn bởi behavior ScrollScenes trước screenshot; verifier bền vững còn kiểm dimensions/anchor width trong khi XML shell verifier kiểm y/height hiện tại; script enrich-reference còn cần input `.scratch/figma-ui-audit/` bị ignore. Các điểm này không chặn Gate A và sẽ xử lý khi mở rộng tooling hoặc Mốc B.

### Kết luận Mốc A

Gate A đạt cho reference, capture, CSS ownership và shared header/footer. Mốc A không tuyên bố Home/Card/quiz hoặc các trang nội dung đã khớp toàn trang Figma; các phần đó là đầu vào của Mốc B/C/D. Không có commit, push hoặc merge.
