# Ting-ting — Spec và kế hoạch đưa UI về đúng Figma

**Ngày tạo:** 17/10/2026  
**Trạng thái:** **Mốc A đã triển khai và kiểm chứng**; các mốc B/C/D chưa triển khai.  
**Phiên tiếp theo:** Bắt đầu **Mốc B** (Home và Card).  
**Cách thực hiện:** Chia thành 4 mốc, dự kiến 4–6 phiên; hoàn thành và kiểm chứng từng mốc.

> Đây là tài liệu đầu vào chính cho các phiên triển khai tiếp theo. Đọc hướng dẫn dự án và skill liên quan trước khi sửa mã. Khi người dùng yêu cầu triển khai theo spec, thực hiện mốc chưa hoàn tất; không hỏi lại lựa chọn bộ Done đã được xác nhận. Số đo khảo sát bên dưới là bằng chứng ngày 17/10/2026, cần kiểm tra lại trạng thái code trước khi sửa.

## 1. Mục tiêu

UI code phải khớp prototype Figma về:

- Phần tử, thứ tự và nội dung hiển thị.
- Font, weight, size, line-height, letter-spacing và xuống dòng.
- Màu, nền, gradient, border, radius và icon.
- Asset, tỷ lệ ảnh, vùng crop, vị trí artwork và decoration.
- Container, kích thước, căn chỉnh, padding, margin và gap.
- Trạng thái tương ứng: active, selected, loading và kết quả.
- Bố cục desktop **1280px** và mobile **393px**.

Mục tiêu là không còn sai khác nhìn thấy rõ với frame được chọn. Nghiệm thu bằng ảnh đối chiếu và số đo, không dùng nhận xét chủ quan hoặc phần trăm giống nhau không có cơ sở.

**Architecture:** Giữ Next/React và các luồng nghiệp vụ hiện có. Mỗi nhóm giao diện có nơi quản lý CSS rõ ràng; sửa theo thứ tự bố cục → font → ảnh/crop → spacing → chi tiết. Figma là chuẩn ban đầu; ảnh browser chỉ trở thành baseline chống regression sau khi đã đối chiếu đạt với Figma.

**Tech stack tại thời điểm khảo sát:** Next16.3.5, React19.2.8, Tailwind4, CSS, next/font/local, GSAP3.15, Playwright1.63, Sharp0.35. Kiểm tra lại phiên bản thực tế khi bắt đầu; dùng tài liệu đi kèm bản Next đã cài.

## 2. Các quyết định đã chốt

1. Dùng **nhóm Done**, desktop1280px/mobile393px. Không dùng hoặc trộn frame cũ1440px.
2. Figma file chính thức: **Gmzxui5petX6JblbBjAaYP**; section Done: **563:784**.
3. Bản copy mới đã được đọc trực tiếp qua Figma MCP trong khảo sát. Phiên sau kiểm tra lại file/node, không chỉ kiểm tra tài khoản bằng whoami.
4. Frame mobile có44px thanh trạng thái iOS: bỏ phần này khỏi tọa độ/chiều cao website. Không dựng thanh giờ hoặc notch giả.
5. Triển khai theo từng phiên, ưu tiên hoàn thành một mốc trước khi chuyển mốc khác.
6. Nội dung, ảnh và font của Done được ưu tiên khi mâu thuẫn hướng dẫn thiết kế cũ.
7. Card theo màn **Coming soon**; Blog theo composition **Up coming** của Done.
8. Mỗi phiên phải kiểm phần vừa sửa, cập nhật trạng thái và bàn giao; không để toàn bộ kiểm tra tới phiên cuối.

[Figma Done](https://www.figma.com/design/Gmzxui5petX6JblbBjAaYP/Ting-ting--Copy-?node-id=563-784)

## 3. Phạm vi và giới hạn

### Trong phạm vi

Home, Về dự án, Ghép Ting, Card, entry bài test, câu hỏi,4loading, full result, Kho xu hướng, chi tiết xu hướng, Góc chia sẻ; header/footer và trạng thái liên quan của các màn này.

### Ngoài phạm vi thay đổi nghiệp vụ

Scoring, persistence, hợp đồng API, đăng nhập, claim kết quả, quyền sở hữu/xem kết quả. Không triển khai gameplay Card hoặc tính năng ghép đôi chỉ để khớp màn Coming soon.

Các trang tài khoản/chat/speed dating và bài Blog chi tiết chưa có frame đối chiếu trong bộ khảo sát. Không tuyên bố chúng đã giống Figma khi chưa có reference.

### Những phần chưa được nghiệm thu trực tiếp

- Full result có tài khoản sở hữu kết quả.
- Cả4loading state tại thời điểm cố định.
- Các câu hỏi ngoài câu đầu và toàn bộ trạng thái lỗi/back/last.
- Các chi tiết xu hướng ngoài Saver.
- Bản production.

Đây là công việc còn phải kiểm, không phải kết luận các phần đó đang đúng hoặc đang sai.

## 4. Bản đồ màn hình chuẩn

Chiều cao mobile trong bảng là **chiều cao website sau khi trừ44px iOS**. Khi export Figma, giữ nguyên frame gốc rồi chuẩn hóa phần iOS trước phép so ảnh.

| Màn / route | Desktop node | Desktop W×H | Mobile node | Mobile web W×H |
|---|---|---|---|---|
| Home / |304:532|1280×3798|141:420|393×3364|
| About /ve-du-an |403:386|1280×4262|141:330|393×4429|
| Ghép Ting /tuong-thich-doi |414:682|1280×1176|141:170|393×1050|
| Card /card |546:1200|1280×1176|546:1268|393×1050|
| Entry /test-xu-huong-tai-chinh |414:1052|1280×1176|414:1261|393×1045|
| Câu hỏi, cùng route |414:1155|1280×1176|414:1342|393×1050|
| Kho /kho-tang-tinh-cach |439:693|1280×2497|424:2314|393×3285|
| Saver /kho-tang-tinh-cach/nguoi-xay-nen |483:1020|1280×2497|424:3432|393×2318|
| Blog /blog |424:2429|1280×2124|424:2594|393×1449|
| Full result /ket-qua/[code] |414:1995|1280×3500|464:1176|393×3456|

| Loading | Desktop node / W×H | Mobile node / web W×H |
|---|---|---|
|1|414:1433 /1280×1176|414:1581 /393×1045|
|2|414:1526 /1280×1176|414:1665 /393×1045|
|3|414:1739 /1280×1176|414:1789 /393×1045|
|4|414:1867 /1280×1176|414:1917 /393×1045|

Tổng **28frame**. Manifest máy đọc được: [figma-reference.json](../design/figma-reference.json).

Các chiều cao chỉ dùng làm gate khi nội dung/trạng thái giống reference. Với nội dung dài khác, yêu cầu không cắt/tràn; không dùng height cố định để che nội dung.

## 5. Bằng chứng khảo sát và nguyên nhân

### 5.1. Số đo tổng chiều cao

| Trang | Desktop Figma → code | Mobile web Figma → code |
|---|---|---|
| Home |3798→4276 (+478)|3364→4100 (+736)|
| About |4262→4262|4429→4429|
| Ghép Ting |1176→1170|1050→1006|
| Card |1176→2500 (+1324)|1050→999|
| Entry |1176→1176|1045→999|
| Kho xu hướng |2497→2411|3285→2644 (−641)|
| Blog |2124→2298|1449→1139|
| Saver |Modal đo riêng bên dưới|2318→1432|

Blog/Saver có khác dữ liệu; không quy toàn bộ chênh lệch cho CSS. About/entry đúng tổng chiều cao chưa chứng minh các phần tử đúng.

### 5.2. Lỗi cần xử lý

**F01 — Home/CSS:** layout import globals → figma-31 → test-entry-figma → home-viewport. File cuối ép5scene cùng height=100svh−header và ghi đè padding/min-height. Ở1280×900 mỗi scene cao844. Chỉ đổi height900→832, Home thay4276→3936 dù width không đổi.

**F02 — Hero Home:** Figma x−142,y56,w1564,h595; code x−332.8,y56,w1945.6,h844. Rule width152%/object-fit:cover gây crop khác. GIF65frame cần capture cố định để đối chiếu.

**F03 — Card:** Done là Coming soon nền xanh đậm, code là deck/6mặt bài/SOS, artboard min-height2100. Mobile rule ẩn mọi direct child làm trống vùng nội dung.

**F04 — Kho:** hero595 so với486.22; intro chuẩn x192,y675,w896 so với x208,y532.22,w864. Heading48bold so với42.66regular. Dropdown hiện tại khác3pill trên Figma.

**F05 — Saver:** modal chuẩn x100,y186,w1080,h1020; code x100,y112,w1080,h860. Title48 so với40. Copy data ngắn hơn Figma, không thể sửa bằng CSS đơn thuần.

**F06 — Blog:** library chuẩn x100,y120,w1080,h557; code x88.89,y156,w1102.22,h637. Blog group chuẩn x100,y837,w1080; code x60,y857,w1160 và padding-top145. Figma Up coming khác carousel ảnh chiến dịch. Reference có1featured+4article, runtime khảo sát có2post tổng.

**F07 — Ghép Ting:** heading/subtitle/body chuẩn48/24/20, code42.67/21.33/17.78; subtitle chuẩn bolditalic#4dc2dd. Thiếu3sao desktop, nền gradient hồng khác nền kem.

**F08 — About:** ảnh nhóm chuẩn4c59c.png bị thay bằng minh họa Shin a185b.png. Hero heading42.752 thay vì48. Slogan cần Anaktoria Regular24trắng, không pill; font chưa có trong repo. Thứ tự Tính/Tình tại1280 đã được CSS đặt đúng, không đảo lại.

**F09 — Quiz:** CSS cuối nén theo viewport, giảm heading/gap/answerheight và dùng overflow:clip. Desktop đáp án thực khoảng50–72px thay vì tối thiểu khoảng88/gap12. Câu đầu393×667 chưa thấy bị cắt, chỉ ghi rủi ro với câu dài.

**F10 — Shared/test:** header56/40 cơ bản đúng. Footer desktop344 đúng nhưng credit14 thay vì16, thiếu URL Behance. Mobile thường cần237, Home181; code default189. Chưa có visual regression; một số selector functional E2E đã cũ.

## 6. Nguyên tắc triển khai

- Giữ thay đổi chưa commit có sẵn; lưu baseline/patch trước khi sửa. Không reset hoặc ghi đè công việc người dùng.
- Tại khảo sát có thay đổi ở app/(site)/page.tsx, app/globals.css, app/home-viewport.css và payload-types.ts. Kiểm lại Git hiện tại thay vì giả định danh sách này bất biến.
- Một nơi quyết định mỗi nhóm selector/property/breakpoint. Không tiếp tục thêm override để thắng rule cũ.
- Flow/grid cho nội dung; absolute positioning giới hạn trong artwork có khung xác định.
- Không ép tất cả Home section bằng chiều cao cửa sổ.
- Không bù lỗi từ section trước bằng margin của section sau.
- Không bù copy thiếu bằng padding hoặc chiều cao trống.
- Không thay asset/font bằng bản “gần giống” rồi đánh dấu đạt.
- Giữ hệ thống14font CDA đang có; sửa đúng variant/weight/size. Giải quyết Anaktoria bằng font gốc được phép dùng hoặc export đúng slogan dạng vector kèm text accessible.
- Giữ animation thật nếu đang được yêu cầu; dùng frame tĩnh trong capture và kiểm chuyển động riêng.
- Fixture dùng để đo ổn định; bản bàn giao vẫn phải kiểm nội dung và dữ liệu hiển thị thật.
- Không thêm thư viện mới hoặc viết lại toàn bộ styling khi có thể sửa trong phạm vi liên quan.

## 7. Phân công file dự kiến

| File/nhóm file | Trách nhiệm |
|---|---|
|app/(site)/layout.tsx|Import CSS/font và shared layout|
|app/globals.css|Tokens, shared header/footer, About, Ghép Ting; bỏ rule cạnh tranh đã chuyển|
|app/figma-31.css|Card, Kho/detail, Blog, quiz/loading/result có scope|
|app/test-entry-figma.css|Entry desktop/mobile|
|app/home.css, đổi từ home-viewport.css|Chỉ Home; chuyển quiz ra khỏi file này|
|components/site/SiteHeader.tsx, SiteFooter.tsx|Navigation và footer variant|
|app/(site)/page.tsx|Cấu trúc Home, artwork/CTA|
|app/(site)/card/page.tsx|Coming soon theo Done|
|components/site/ComingSoon.tsx|Ghép Ting; card chỉ dùng chung nếu variant khớp đủ|
|components/site/TrendFilter.tsx|3pill, giữ contract q/kind|
|app/(site)/kho-tang-tinh-cach/page.tsx và [slug]/page.tsx|Kho và detail/SEO/close|
|app/(site)/blog/page.tsx, LibraryCarousel.tsx|Listing và Up coming|
|app/(site)/ve-du-an/page.tsx|Ảnh nhóm và composition About|
|components/tests/TestRunner.tsx|Entry/question/loading presentation|
|components/tests/FigmaResultPage.tsx|Full result thật|
|docs/design/figma-reference.json và PNG tham chiếu|Mapping và reference bền vững|
|playwright.visual.config.ts, tests/visual/*|Capture/geometry/regression|
|tests/e2e/public-site.spec.ts|Cập nhật expectation phù hợp luồng hiện tại|

Đổi tên/migration CSS là hướng thực hiện, không phải lý do bắt buộc refactor các phần không liên quan.

## 8. Kế hoạch theo mốc và phiên

### Mốc A — Reference và nền CSS — Hoàn tất

**Phụ thuộc:** đọc được Done qua MCP; ảnh khảo sát có thể dùng lại nếu đúng bản.  
**Đầu ra:** reference bền vững, capture ổn định, ownership CSS và shared layout.

- [x] Đọc AGENTS.md/CLAUDE.md, skill liên quan và Next docs phù hợp.
- [x] Kiểm Git, xác định thay đổi có sẵn; lưu patch và ảnh trước sửa.
- [x] Kiểm trực tiếp metadata/context của file mới; lấy screenshot từng node cần dùng.
- [x] Export PNG1x: maxDimension bằng cạnh dài, xác minh width/height; không dùng preview1024 đã scale để đo pixel.
- [x] Bổ sung asset/font/anchor/referencePath vào manifest28frame. Lưu export lâu dài, không phụ thuộc URL asset tạm.
- [x] Tạo capture1280×900/393×852,DPR1, đợi font/ảnh, reduced motion; GIF frame cố định trong test.
- [x] Ghi bảng rule CSS cạnh tranh và hợp nhất theo ownership ở mục7. Tách migration giữ hình học khỏi bước tinh chỉnh hình học để nhận ra regression.
- [x] Chuẩn hóa header56/40; kiểm nav active/mobile menu.
- [x] Footer desktop344, credit16 và Behance; mobile default237/Home181, kiểm About embedded.
- [x] Chụp lại shared layout trên các route chịu ảnh hưởng; kiểm font và ảnh thực tải thành công.

**Gate A:** mapping/reference rõ, capture tái lập, không mất/nhân đôi footer, không cắt text, selector đã chuyển không còn cạnh tranh. Không coi migration xong là Home đã đạt.

### Mốc B — Home và Card — Phiên2, có thể tách2phiên

**Phụ thuộc:** Gate A.  
**Đầu ra:** Home/Card khớp cả desktop/mobile và có ảnh trước/sau.

#### Home

- [ ] Bỏ5scene cùng height viewport; khớp từng section theo node.
- [ ] Hero desktop: x−142,y56,w1564,h595.
- [ ] About heading: x192,y1038.97; artwork y919.
- [ ] Ghép Ting section bắt đầu y2187.73.
- [ ] Sharing block x100,w1080.
- [ ] Footer desktop y3454,h344; mobile y3183,h181; tổng3798/3364.
- [ ] So1280×832 và1280×900: không kéo giãn toàn bộ nội dung theo cửa sổ.
- [ ] So mobile393×852 và393×667: cuộn được, CTA không mất.
- [ ] Overlay artwork/crop/text từng section, rồi kiểm animation thật riêng.

#### Card

- [ ] Thay deck/SOS bằng Coming soon, subtitle/body/social chính xác.
- [ ] Kiểm asset bf639.png/8abcb.png; export lại nếu local không đúng bản.
- [ ] Desktop main776; copy x192,y282,w530, heading48#ffbecc, subtitle24bolditalic#80e7ff, body20trắng.
- [ ] Dựng mobile từ546:1268, bỏ rule ẩn toàn bộ child.
- [ ] Kiểm /card-online redirect, sociallinks và tổng1176/1050.

**Gate B:** đúng composition/assets/crop, anchors khớp, Card mobile đủ nội dung, không tạo khoảng trắng giả để khớp tổngheight.

### Mốc C — Các trang nội dung — Phiên3–4

**Phụ thuộc:** Gate A; nội dung/font chuẩn cho phần tương ứng.  
**Đầu ra:** Kho/detail, Blog, About, Ghép Ting và entry được đối chiếu.

#### Kho và chi tiết

- [ ] Kho desktop: hero595, intro x192,y675,w896, heading48bold.
- [ ] Controls y1089,h108; grid y1245,h808.
- [ ] Mobile x24,w345, controls216, grid1900 theo node; đọc row/gap chính xác thay vì scale từ175px hiện tại.
- [ ] Đổi select thành3pill all/base/hybrid. Giữ selectedKind/searchQuery và q/kind khi điều hướng.
- [ ] Kiểm15/5/10thẻ với q rỗng, thứ tự, search không dấu và empty state.
- [ ] Saver modal x100,y186,w1080,h1020,title48, close48; hỗ trợ cuộn ở cửa sổ thấp.
- [ ] Dùng copy Saver đúng reference trong dữ liệu trình bày, giữ dữ liệu nghiệp vụ khi cần tách.
- [ ] Mobile detail2318 khi cùng copy; đúng hero/coin/bullets/brandnote/related.
- [ ] Kiểm route trực tiếp, SEO, close về kho và nội dung dài của xu hướng khác.

#### Blog

- [ ] Dựng Up coming theo Done.
- [ ] Library desktop x100,y120,w1080,h557; Blog group x100,y837,w1080; bỏ padding145 gây lệch heading.
- [ ] Chuẩn fixture1featured+4article với text/cover reference; giữ CMS runtime.
- [ ] Tách view khỏi loader nếu cần fixture; browser route interception không thay được CMS fetch chạy server.
- [ ] Khớp mobile, ảnh cover/aspect ratio/typography.
- [ ] Kiểm cả data chuẩn, ít bài, empty và category. Chỉ so tổng2124/1449 khi cùng nội dung.

#### About, Ghép Ting và entry

- [ ] About: thay a185b.png bằng ảnh nhóm4c59c.png, đúng crop và alt.
- [ ] Hero title48; slogan Anaktoria24trắng không pill; cập nhật DESIGN.md cho ngoại lệ.
- [ ] Giữ thứ tự Tính/Tình đã đúng; kiểm curve/timeline bằng overlay trước khi thay.
- [ ] Ghép Ting:48bold/24bolditalic#4dc2dd/20; copy x650,y156,w530; hiện3sao và nền kem.
- [ ] Entry desktop heading x650,y304,w530,48px; khớp CTA/art/paragraph.
- [ ] Entry mobile: tìm mốc gây thiếu46px, không cộng padding mù.
- [ ] Kiểm totals About4262/4429, entry1176/1045 với cùng nội dung và các CTA.

**Gate C:** đúng copy/assets/font/geometry, filter/search/link hoạt động. Không gắn nhãn đạt cho phần chỉ được kiểm bằng fixture nhưng runtime còn khác nội dung đã duyệt.

### Mốc D — Test flow và nghiệm thu production — Phiên5–6

**Phụ thuộc:** Gate A; fixture dữ liệu/state và session hợp lệ cho full result.  
**Đầu ra:** question/loading/result được kiểm, visual baseline đã duyệt và báo cáo toàn scope.

#### Question/loading/result

- [ ] Question desktop contentwidth896, title24bold, answermin88,gap12; canh progress/arrows theo frame.
- [ ] Bỏ nén/overflowclip khi gây mất nội dung; cho phép cuộn trên màn thấp.
- [ ] Kiểm unselected/selectedA, back/next/last, câu dài nhất và393×667.
- [ ] Chỉ đổi corner SVG nếu overlay cùng scale xác nhận sai asset/gradient/noise.
- [ ] Kiểm4loading bằng clock và response test có kiểm soát; stages hiện cách700ms. Capture0/700/1400/2100ms.
- [ ] Dùng kết quả/session test hợp lệ để mở full result qua route thật. Không lưu credential/token vào Git hoặc tài liệu.
- [ ] Điều chỉnh FigmaResultPage: hero/coin/radar/scorebars/4insights/brandnote/nextlinks.
- [ ] Normal completion redirect tới data.resultUrl; không sửa nhầm legacy ResultView trong TestRunner.
- [ ] Tách state full-owned, anonymous preview/login, claim-progress và invalid code. Chỉ full-owned so với frame kết quả đầy đủ.
- [ ] Full result tổng3500/3456 khi cùng dữ liệu; kiểm thêm text dài không cắt.
- [ ] Cập nhật selector E2E cũ theo hành vi hiện tại; giữ assertion quyền truy cập/scoring.

#### Production và bàn giao cuối

- [ ] Build và start server production riêng; không reuse dev.
- [ ] Capture1280/393 và tất cả state đã chọn; thêm768/1024, màn thấp667 để kiểm overflow.
- [ ] Overlay/ảnhdiff/geometry từng màn; giải thích riêng noise rasterization.
- [ ] Chỉ lưu browser baseline sau khi đối chiếu đạt Figma.
- [ ] Kiểm chức năng nav/menu/CTA/filter/search/detailclose/blog/testflow/resultaccess.
- [ ] Typecheck/lint và các test liên quan; không bỏ assertion để ép suite pass.
- [ ] Báo cáo cuối mỗi màn đạt/chưa đạt/chưa đủ đầu vào, kèm ảnh và delta.
- [ ] Review diff và chỉ stage file thuộc công việc nếu commit; không đưa generated/junk hoặc thay đổi người dùng không liên quan vào commit.

**Gate D:** mọi màn trong scope có bằng chứng desktop/mobile đúng trạng thái; production và hành vi chính được kiểm. Phần chưa đủ session/font/data được ghi chưa nghiệm thu, không đánh dấu hoàn thành toàn bộ.

## 9. Quy trình đo và tiêu chí nghiệm thu chung

### Chuẩn hóa phép đo

1. Cùng width, DPR1, browser/version và trạng thái.
2. Mobile gốc y đã bỏ44px iOS.
3. Đợi hydration, document.fonts.ready và decode ảnh hiển thị; kích hoạt lazy images cần chụp.
4. Không đợi vô hạn ảnh hidden/lazy; dùng timeout có kiểm tra ảnh lỗi.
5. GIF frame và loading clock cố định trong capture, animation thật kiểm riêng.
6. Chụp toàn trang và section; so ảnh1x, không resize để bù sai.
7. Overlay50%, ảnh chênh và bảng bounding box cho header/title/CTA/art/section/footer.

### Tiêu chí đạt

- [ ] Đủ phần tử, đúng thứ tự, copy và asset.
- [ ] Font/weight/size/line-height/color/border đúng node.
- [ ] Anchor chính sai số tối đa2CSSpx do rounding, không có dịch khối hoặc lệch tích lũy nhìn thấy rõ.
- [ ] Crop, tỷ lệ ảnh và line-break khớp.
- [ ] Không tràn ngang hoặc cắt text/nút ở width chuẩn và màn thấp.
- [ ] Tổngheight khớp khi cùng nội dung; không ép height che nội dung.
- [ ] Tương tác, quyền truy cập và route vẫn đúng.
- [ ] Bản production đã được kiểm.
- [ ] Baseline browser đã đối chiếu Figma trước khi dùng chống regression.

Khác biệt antialiasing giữa Figma/browser có thể tồn tại dù geometry đúng. Phải phân biệt với lỗi font, màu hoặc layout; không dùng ngưỡng pixel-diff lớn hay mask khối quan trọng để cho qua sai khác.

## 10. Lệnh và điều kiện môi trường

Workspace Windows/PowerShell:
`C:\Users\Admin\Documents\hoc\tinhtinh\tinhtinhtingting`

Đọc trước khi viết code:
`node_modules/next/dist/docs/`

Dùng dependency đã cài; không chạy npm install để thay package manager. Project khai báo pnpm; tại khảo sát pnpm chưa có trên PATH nên có thể gọi trực tiếp CLI local:

```powershell
git status --short
node node_modules/next/dist/bin/next dev --port 3002
```

Chạy các lệnh sau riêng biệt theo từng bước, trong đúng workspace:

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js
node node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next start --port 3003
```

Sau khi Mốc A tạo visual config, config phải trỏ localhost:3003 và dùng server production riêng. Nếu config tự start server thì không chạy thêm server thủ công:

```powershell
node node_modules/@playwright/test/cli.js test --config=playwright.visual.config.ts
```

Kiểm DB/CMS/env của môi trường test trước test tạo dữ liệu. Không in hoặc lưu secret. Các lệnh này là hướng dẫn thực thi, chưa được chạy như bằng chứng đạt trong lúc tạo spec.

## 11. Tiến độ và bàn giao giữa các phiên

### Trạng thái lúc tạo spec

| Mốc | Trạng thái | Phiên tiếp theo |
|---|---|---|
|A|Hoàn tất; reference, capture, ownership CSS và shared shell đã được kiểm chứng production|Bắt đầu Mốc B|
|B|Chưa triển khai|Sau Gate A|
|C|Chưa triển khai|Sau Gate A và đủ input tương ứng|
|D|Chưa triển khai|Sau các trang đã sửa và đủ state/result fixture|

### Cách tiếp tục

- Đầu phiên: đọc spec này, trạng thái Git và bàn giao gần nhất; kiểm lại input có thể thay đổi.
- Theo task checklist trong mốc; ưu tiên hoàn thành mốc hiện tại, không chỉ sửa một phần rồi báo đạt.
- Nếu mốc lớn cần tách phiên, ghi rõ task đã đạt và task tiếp theo. Không cần hỏi lại các quyết định đã chốt.
- Cuối phiên cập nhật checkbox, bảng tiến độ và thêm một mục bàn giao ngay dưới đây.
- Không tự đẩy Git hoặc công bố thay đổi ra bên ngoài nếu chưa có yêu cầu tương ứng.

Mỗi mục bàn giao phải ghi: mốc/task, file đã sửa, node đối chiếu, đường dẫn ảnh, lệnh kiểm thực chạy và kết quả, lỗi còn lại, đầu vào còn thiếu, commit nếu có, việc đầu tiên phiên sau.

### Bàn giao Mốc A — 18/10/2026

- **Task/file:** Task 1 tạo manifest/reference/capture tại `docs/design/figma-reference.json`, `docs/design/figma-reference/`, `playwright.visual.config.ts`, `tests/visual/`, `scripts/figma-visual/`; Task 2 gom CSS vào `app/home.css` và `app/figma-31.css`, cập nhật `app/(site)/layout.tsx`, `app/globals.css`, `app/test-entry-figma.css`, `components/site/SiteHeader.tsx`, `components/site/SiteFooter.tsx`, `DESIGN.md` và `docs/design/css-ownership.md`.
- **Chuẩn đối chiếu:** file Done `Gmzxui5petX6JblbBjAaYP`, section `563:784`; 28 frame desktop1280/mobile393. 56 ID và bounding box header/footer được đối chiếu với XML Figma.
- **Ảnh/bằng chứng:** `docs/design/figma-reference/`; `.scratch/figma-milestone-a/production-final/`; `.scratch/figma-milestone-a/production-final/shared-geometry-deltas.json`; `.scratch/figma-milestone-a/production/comparisons/`.
- **Kiểm đã chạy:** production build exit0 (có một warning tracing có sẵn tại `app/api/admin/gallery/route.ts`); shared checker `10 captures, 440 geometry checks <=2px`, max delta `0`, failures `0`; quiz 9 box ở 1280×832 và393×852; responsive smoke 8/8; interaction không có page/hydration error; visual suite 3 pass, 5 skip có điều kiện; typecheck, focused ESLint, reference verifier, shell XML verifier và `git diff --check` pass.
- **Giới hạn còn lại:** Mốc A không sửa composition Home/Card hay nội dung/asset của B/C/D; browser và Figma có khác biệt rasterization chữ, nhưng đã xác minh CDA OTF đúng weight và width. Không có commit/push/merge.
- **Việc đầu tiên phiên sau:** đọc lại spec và baseline, bắt đầu Mốc B với Home desktop/mobile rồi Card; giữ shared shell làm regression gate và không dùng các anchor chi tiết đang `null` cho tới khi đọc node Figma tương ứng.

**Câu lệnh mở phiên triển khai đầu tiên:**

> Đọc docs/specs/2026-10-17-figma-ui-fidelity.md và triển khai Mốc A. Giữ thay đổi có sẵn, tự kiểm phần đã sửa, lưu bằng chứng và cập nhật bàn giao trong spec.

## 12. Tài liệu và minh chứng bổ trợ

File spec này tổng hợp mục tiêu, scope và trình tự triển khai; các tài liệu sau cung cấp chi tiết kỹ thuật/bằng chứng. Nếu có mâu thuẫn về bộ thiết kế hoặc chia phiên, dùng quyết định mới nhất của người dùng và mục2 của spec.

- [Báo cáo đối chiếu và số đo](../research/2026-10-17-figma-ui-audit.md).
- [Nghiên cứu CSS/font/phương pháp xác minh](../research/2026-10-17-figma-visual-verification.md).
- [Kế hoạch kỹ thuật9task, ví dụ config/helper/test](../superpowers/plans/2026-10-17-figma-ui-fidelity.md).
- [Manifest28frame](../design/figma-reference.json).
- [Home Figma/code cạnh nhau](../../.scratch/figma-ui-audit/screenshots/compare-home-desktop.png).
- [Card Figma/code cạnh nhau](../../.scratch/figma-ui-audit/screenshots/compare-card-desktop.png).

Snapshot audit nguồn: HEAD5bb2414772e5bff155c364e3d130f8e83dfcdcd3 cùng dirty changes lúc khảo sát. Raw metadata/context/metrics nằm dưới .scratch/figma-ui-audit/. Nếu scratch không còn trong phiên sau, export lại từ file/node trong mục4; không cần phân tích lại lựa chọn thiết kế.

