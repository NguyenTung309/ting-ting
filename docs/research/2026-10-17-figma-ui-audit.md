# Đối chiếu UI Ting-ting với Figma và hướng khắc phục

Ngày kiểm tra: 17/10/2026. Phạm vi: phân tích, đo trình duyệt và lập kế hoạch; chưa sửa mã giao diện.

## 1. Kết luận

**Giao diện hiện tại chưa đạt yêu cầu giống prototype.** Các sai khác lớn là bố cục và nội dung, không chỉ vài pixel margin. Nguyên nhân chính là CSS chồng nhiều lớp, một số trang dùng tỷ lệ thiết kế cũ 1440px, Home/bài test bị ép theo chiều cao cửa sổ, và một số ảnh/thành phần chưa đúng bản Done.

Có thể đưa bố cục, phần tử, font, màu, crop ảnh và khoảng cách về đúng thiết kế ở hai chiều rộng chuẩn **1280px và 393px**. Việc chứng minh phải dựa trên ảnh Figma, ảnh browser và tọa độ phần tử. Tổng chiều cao bằng nhau hoặc chạy E2E thành công chưa chứng minh giao diện khớp.

## 2. Thiết kế gốc và điều kiện kiểm tra

- Đã đọc trực tiếp qua Figma MCP file **Gmzxui5petX6JblbBjAaYP**, bản copy người dùng cung cấp.
- Chuẩn đối chiếu đang dùng: section **Done**, node **563:784**. File còn có các frame cũ 1440px; không trộn chúng vào bộ chuẩn 1280px.
- Người dùng đã xác nhận nhóm **Done — desktop1280px/mobile393px** là chuẩn chính thức sau báo cáo. Các số đo và hướng sửa trong báo cáo sử dụng đúng bộ này.
- Browser: Chromium qua Playwright, dev server tại localhost:3002; desktop1280×900, mobile393×852; kiểm tra bổ sung Home1280×832 và câu hỏi393×667.
- Font đã đợi sẵn sàng và ảnh hiển thị đã tải trong các ảnh chụp chính. Không phát hiện ảnh hỏng trong bộ 7 trang đã đo.
- Các frame mobile chứa **44px thanh trạng thái iOS**. Số đo website đã trừ phần này: y_web = y_figma −44 và chiều cao chuẩn = H_figma −44. Website không cần vẽ thanh giờ/notch.
- Trang Blog và chi tiết xu hướng có nội dung thực tế khác Figma: chênh chiều cao của chúng gồm cả khác biệt dữ liệu.
- Đây là kết quả từ **dev**, chưa phải nghiệm thu production.

### Bản đồ frame

| Màn hình / route | Desktop node / kích thước | Mobile node / kích thước gốc |
|---|---|---|
| Home / | 304:532 /1280×3798 | 141:420 /393×3408 |
| Về dự án /ve-du-an | 403:386 /1280×4262 | 141:330 /393×4473 |
| Ghép Ting /tuong-thich-doi | 414:682 /1280×1176 | 141:170 /393×1094 |
| Card /card | 546:1200 /1280×1176 | 546:1268 /393×1094 |
| Vào bài test /test-xu-huong-tai-chinh | 414:1052 /1280×1176 | 414:1261 /393×1089 |
| Câu hỏi, cùng route | 414:1155 /1280×1176 | 414:1342 /393×1094 |
| Kho xu hướng /kho-tang-tinh-cach | 439:693 /1280×2497 | 424:2314 /393×3329 |
| Chi tiết Saver /kho-tang-tinh-cach/nguoi-xay-nen | 483:1020 /1280×2497 | 424:3432 /393×2362 |
| Góc chia sẻ /blog | 424:2429 /1280×2124 | 424:2594 /393×1493 |
| Kết quả /ket-qua/[code] | 414:1995 /1280×3500 | 464:1176 /393×3500 |

Bốn frame loading desktop: 414:1433,414:1526,414:1739,414:1867; mobile: 414:1581,414:1665,414:1789,414:1917.

## 3. Số đo tổng quan

Đơn vị: CSS px. Delta = code − Figma. Mobile đã bỏ 44px iOS. Đây là chỉ báo vị trí các section, không phải điểm phần trăm giống nhau.

| Trang | Desktop Figma / code / delta | Mobile Figma / code / delta |
|---|---|---|
| Home | 3798 /4276 / **+478** | 3364 /4100 / **+736** |
| Về dự án | 4262 /4262 /0 | 4429 /4429 /0 |
| Ghép Ting | 1176 /1170 /−6 | 1050 /1006 /−44 |
| Card | 1176 /2500 / **+1324** | 1050 /999 /−51 |
| Vào bài test | 1176 /1176 /0 | 1045 /999 /−46 |
| Kho xu hướng | 2497 /2411 /−86 | 3285 /2644 / **−641** |
| Góc chia sẻ (*) | 2124 /2298 /+174 | 1449 /1139 /−310 |
| Chi tiết Saver (*) | backdrop kho hiện cao2411; modal đo riêng bên dưới | 2318 /1432 /−886 |

(*) Có khác biệt nội dung/dữ liệu, không quy hết delta cho CSS.

## 4. Phát hiện và cách sửa

### F01 — P1: Home bị biến thành năm màn hình cao bằng cửa sổ

**Bằng chứng:**

- `app/(site)/layout.tsx:11-14` import globals → figma-31 → test-entry-figma → **home-viewport cuối cùng**.
- `app/home-viewport.css:2-6` gán các scene cùng height=100svh−header, min-height:0 và padding:0, ghi đè nhịp section khác nhau tại `app/globals.css:4395-4417`.
- 1280×900: cả 5 scene đều cao844. Home cao4276, dư478.
- Giữ width1280, đổi height900→832: Home giảm4276→3936. Chỉ thay chiều cao cửa sổ đã thay bố cục340px.
- Tiêu đề “Về dự án”: Figma y1038.97, code1152, lệch **+113.03px**.
- Artwork cạnh tiêu đề: Figma y919, code1032, lệch+113.
- Section Ghép Ting: Figma y2187.73, code2588, lệch **+400.27px**.
- Khối chia sẻ: Figma x100,w1080; code x60,w1160.
- Footer desktop: Figma y3454, code3932. Mobile: Figma3183, code3911.

**Giải pháp:** mỗi section có hình học theo node tương ứng; nội dung chính dùng flow/grid và khoảng cách cụ thể. Giới hạn absolute positioning vào artwork trong section. Gỡ quy tắc ép cùng chiều cao và hợp nhất selector bị trùng. Không chỉnh thêm margin ở cuối globals khi file import sau còn ghi đè.

**Nghiệm thu:** các mốc section và footer khớp ở1280/393; đổi height832↔900 không kéo giãn tất cả section.

### F02 — P1: Hero Home sai tỷ lệ/crop

Figma node304:544: x−142,y56,w1564,h595. Code ở1280×900: x−332.8,y56,w1945.6,h844. Rule width152%, object-fit:cover tại `home-viewport.css:61-69` làm phóng và cắt ảnh khác thiết kế.

Code dùng GIF65frame (`app/(site)/page.tsx:31`), Figma là hình tĩnh. Cần chốt khung ảnh tham chiếu để đo crop; giữ đánh giá chuyển động thành bước riêng. Fixture chụp ảnh dùng một frame tĩnh đã chọn, không tự bỏ animation thật và không che cả hero khỏi phép so sánh.

**Giải pháp:** khớp bounds và vùng crop từ Figma, sau đó kiểm tra animation trong cùng vùng đó.

### F03 — P1: Card khác hẳn thiết kế; mobile ẩn toàn bộ phần nội dung

Figma Done: nền xanh đậm, chữ **Coming soon**, subtitle “Lật một lá bài, chuyện dài thêm hay!”, nhân vật bên phải, social; tổng1176.

Code `app/(site)/card/page.tsx:13-20`: bộ bài, sáu mặt bài trống và “SOS”. `app/figma-31.css:141-155` đặt artboard tối thiểu2100px. Mobile `:293-295` ẩn **mọi phần tử con trực tiếp**, để vùng nội dung trống.

**Giải pháp:** thay composition bằng đúng Done, asset nền/nhân vật bf639.png và8abcb.png, copy và social từ node546:1200/546:1268. Không chỉ đổi màu/height của layout hiện tại. Variant card của ComingSoon hiện cũng chưa đúng đầy đủ.

**Nghiệm thu:** desktop có nội dung đúng, main776px; mobile có đủ text/art/social. /card-online tiếp tục dẫn về /card.

### F04 — P1: Kho xu hướng sai tỷ lệ và loại điều khiển

| Thành phần desktop | Figma | Browser |
|---|---|---|
| Hero height |595|486.22|
| Intro x / y / width |192 /675 /896|208 /532.22 /864|
| Heading font / weight |48 /700|42.66 /400|
| Filter y / height |1089 /108|1014.84 /100|
| Grid y / height |1245 /808|1146.84 /820|

Mobile grid Figma cao1900, code1470; vùng filter216 so với109; grid chuẩn x24,w345, code x22,w349.

Nguồn: tỷ lệ1440-based ở `app/globals.css:3328-3330`, grid/mobile ở `app/figma-31.css:241-245`. `components/site/TrendFilter.tsx:5-19` dùng **select**, Figma có **3 nút pill hiển thị đồng thời** và ô tìm kiếm.

**Giải pháp:** dựng đúng container1280, hero595, intro896 và grid1080; mobile393 dùng lề24. Đổi giao diện filter sang3pill, vẫn duy trì kind=all/base/hybrid và q khi điều hướng.

**Nghiệm thu:** đủ15thẻ, đúng thứ tự, kích thước và trạng thái filter/search; chuyển filter không làm mất query.

### F05 — P1/P2: Chi tiết Saver sai vị trí modal, cỡ chữ và nội dung

Đã mở route thật và đo cả hai width.

- Desktop Figma modal483:1197: x100,y186,w1080,h1020; code x100,y112,w1080,h860. Đúng width nhưng **cao hơn74px và thấp hơn160px**.
- Title Figma48px, code40px. Source: `app/figma-31.css:107-115`.
- Figma nội dung Saver là các đoạn mô tả dài cụ thể; code ghép description/strengths/watchouts/harmonyReason/frictionReason và conversationPrompts từ data. Nội dung hiện ngắn hơn rõ, mobile tổng1432 so với2318.
- Mobile là trang chi tiết có hero, mô tả và thẻ liên quan; không yêu cầu biến thành modal desktop.

**Giải pháp:** chỉnh geometry desktop theo node, lấy đúng nội dung thiết kế vào trường CMS/dữ liệu trình bày phù hợp; không dùng padding trống bù các đoạn thiếu. Khớp mobile từ node424:3432. Giữ URL trực tiếp, SEO và hành vi đóng về thư viện.

**Nghiệm thu:** modal có bounds đúng tại gốc cuộn đã định; nội dung chuẩn cho Saver và layout chịu được các xu hướng dài khác. Kiểm tra thêm viewport thấp để modal cuộn tới nội dung cuối.

### F06 — P1/P2: Góc chia sẻ dùng composition và dữ liệu khác Figma

- Khối Thư viện Figma x100,y120,w1080,h557; code x88.89,y156,w1102.22,h637.
- Khối Blog Figma x100,y837,w1080; code x60,y857,w1160, thêm padding-top145 làm heading xuống y1002.
- Figma carousel là thẻ gradient **Up coming**, code LibraryCarousel dùng ảnh chiến dịch.
- Figma có1featured+4article; runtime đang có2post tổng cộng. Thiếu card do dữ liệu hiện tại, không chỉ do grid.
- Source: `app/figma-31.css:122-137`, `components/site/LibraryCarousel.tsx`, `app/(site)/blog/page.tsx:29-76`.

**Giải pháp:** theo mục tiêu bám Figma, mặc định kế hoạch là composition Up coming. Dùng fixture1+4 bài khi kiểm tra hình học, vẫn giữ CMS thật cho runtime. Chuẩn hóa ảnh cover, aspect ratio, typography và container.

Nếu muốn giữ carousel ảnh chiến dịch đang hoạt động thì cần ghi nhận đó là thay đổi thiết kế so với frame hiện tại. Không lấy chữ giả làm nội dung production.

### F07 — P2: Ghép Ting thiếu độ đậm, sai màu/tỷ lệ và mất sao

Copy chủ yếu đúng nhưng typography dựa trên1440:

| Thuộc tính | Figma | Code1280 |
|---|---|---|
| Heading |48px bold|42.67px regular400|
| Subtitle |24px bold italic #4dc2dd|21.33px regular400|
| Body |20px|17.78px|
| Copy group x/y/width |650/156/530|655.95/162.66/535.11|

Desktop3ngôi sao trong Figma bị `.ttt-coming-stars {display:none}` tại `globals.css:999`. Code có gradient hồng, reference nền kem. Scale tại `:3213-3216`.

**Giải pháp:** giữ state Coming soon và nội dung hiện có, sửa48/24/20, weight/color, copy bounds, nền và sao. Không phát triển tính năng ghép đôi trong công việc fidelity này.

### F08 — P2: Về dự án đúng chiều cao nhưng sai ảnh và slogan/font

- Desktop4262/mobile4429 đã khớp chiều cao chuẩn. Điều đó không chứng minh các phần tử khớp.
- Ảnh “Nhóm thực hiện”: Figma4c59c.png là **ảnh chụp nhóm**, code `ve-du-an/page.tsx:135` dùng a185b.png là **ảnh minh họa Shin**. Sai asset xác nhận bằng ảnh chụp.
- Hero h1 hiện42.752px, Figma48px.
- Slogan node403:564: **Anaktoria Regular24px**, trắng, không nền pill hồng. Code `globals.css:791-800` dùng CDA semibold italic với pill. Font Anaktoria chưa có trong repo.
- DESIGN.md cũ yêu cầu CDA cho toàn bộ UI, mâu thuẫn riêng slogan với Figma mới. Cần cập nhật tài liệu theo bộ chuẩn được chọn.
- Thứ tự Tính/Tình tại1280 **đã được CSS đặt đúng**, không phải lỗi cần đảo lại.

**Giải pháp:** thay đúng ảnh nhóm, khớp font/geometry. Slogan cần font gốc được phép dùng hoặc export đúng dòng chữ dạng vector với accessible text; không tự thay bằng font “gần giống”. Kiểm tra curve/timeline chi tiết bằng overlay trước khi thay asset đang có.

### F09 — P1/P2: Câu hỏi bị nén theo viewport

`home-viewport.css:197-228` ép chiều cao quiz theo100svh, overflow:clip, giảm heading và chiều cao đáp án. Nó ghi đè24px/gap12/min-height88 từ `figma-31.css:47-55`.

Ở1280×832, answer list x190,w900,h321.16; card lần lượt49.91/49.91/49.91/72.44/72.44. Figma width896, card tối thiểu khoảng88 và gap12. Nút điều hướng cũng không cùng vị trí chuẩn.

Mobile393×667: câu đầu vẫn đọc và thao tác được; **chưa xác nhận cắt nội dung**, nhưng overflow:clip có rủi ro với câu dài/cỡ chữ lớn hơn. Không suy diễn thành lỗi đã xảy ra.

Các góc nền cần đối chiếu đúng cùng viewport; asset SVG có gradient và noise. Chưa đủ bằng chứng kết luận sai file SVG. Một lần quan sát ảnh không đủ để thay chúng.

**Giải pháp:** trả mật độ về reference, canh title/progress/answers/arrows; cho phép cuộn khi viewport thấp. So sánh trạng thái chưa chọn và đã chọn riêng: Figma đang chọnA, không quy màu đáp án chưa chọn thành lỗi.

### F10 — P2: Footer chung và cách kiểm thử chưa bảo đảm fidelity

- Header desktop56/mobile40 hiện khớp chiều cao cơ bản.
- Footer desktop344 khớp, nhưng credit code14px so với16px Figma; thiếu URL Behance thể hiện trong design. Source `components/site/SiteFooter.tsx:65-69`.
- Footer mobile mặc định hiện189px; nhiều frame cần237px, Home là ngoại lệ181px. About có layout237 đã đúng chiều cao. Cần explicit variants thay vì một quy tắc ép tất cả.
- 14font CDA đã được đăng ký qua next/font/local. Không cần đổi hệ thống font; cần sửa size/weight/line-height đúng node.
- Tests hiện không có screenshot baseline. public-site.spec.ts còn selector/tên nút/giả định luồng cũ; chưa chạy suite này để khẳng định pass/fail.

**Giải pháp:** component dùng chung với variant đúng từng frame; kiểm tra nav active/mobile menu; bổ sung capture và các mốc hình học rồi lưu browser baseline sau khi đối chiếu Figma.

## 5. Những phần chưa đủ điều kiện kết luận

1. **Full result**: đã đọc Figma và source, chưa mở được state kết quả thuộc tài khoản trong browser. Không kết luận trang này đã khớp hay liệt kê các delta giả.
2. **Bốn loading state**: đã xác định frame; chưa chụp từng state tại thời điểm cố định.
3. **Các câu khác ngoài câu đầu**, trạng thái lỗi/back/last question chưa audit hết.
4. **Chi tiết xu hướng khác Saver** chưa đo riêng.
5. Trang tài khoản/chat/speed dating và bài Blog chi tiết chưa có frame đối chiếu trong bộ Done đã chọn; cần spec riêng nếu đưa vào mục tiêu giống Figma.
6. Production và các browser khác chưa nghiệm thu.

Luồng hoàn tất bài test hiện gọi API rồi `window.location.assign(data.resultUrl)` (`TestRunner.tsx:253-269`). Trang kết quả thật là `ket-qua/[code]`, full UI do **FigmaResultPage** render khi người dùng sở hữu kết quả. Không sửa nhầm legacy ResultView nằm trong TestRunner. Preview khách chưa đăng nhập có cổng đăng nhập riêng và không thể so như full-result frame.

## 6. Quy trình để đạt yêu cầu giống Figma

1. **Khóa reference**: Done1280/393, frame ID, state, copy, asset/font; ghi nhận ngoại lệ44px iOS.
2. **Ổn định đầu vào**: cùng browser/DPR1, font đã tải, ảnh đã decode, dữ liệu cố định, GIF frame cố định trong capture; kiểm tra animation riêng.
3. **Sửa nguyên nhân gốc**: một nơi quyết định CSS cho mỗi page/state/breakpoint, tránh append override nhiều file.
4. **Sửa từ lớn đến nhỏ**: layout/container → typography/line-break → crop/art → padding/gap → border/icon.
5. **Đo lại**: ảnh1x không resize; overlay50%, ảnh chênh và bounding box của anchor.
6. **Lưu regression sau khi khớp**: baseline browser đã kiểm với Figma. Không lấy UI sai hiện tại làm baseline đạt.
7. **Nghiệm thu production**: Next docs cảnh báo CSS order có thể khác dev; chạy build/start và kiểm lại.

Tiêu chí đề xuất: đủ phần tử/nội dung/asset đúng; font,size,weight,color đúng; sai số anchor chính tối đa2CSSpx ở hai width chuẩn, không có lệch section tích lũy; không tràn ngang hay cắt thao tác; các ngoại lệ do rasterization chữ được ghi riêng. Không dùng một mức pixel-diff lớn để cho qua sai layout. Khả năng giống từng pixel giữa Figma và browser không thể suy ra từ CSS vì khác engine/antialiasing; geometry và nội dung vẫn phải đạt chuẩn trên.

## 7. Thứ tự triển khai đề xuất

| Giai đoạn | Đầu ra | Phụ thuộc |
|---|---|---|
|1|Reference, fixture/capture, baseline sai hiện tại|Done được dùng làm chuẩn|
|2|CSS ownership và shared typography/header/footer|1|
|3|Home: section/crop/art/spacing desktop+mobile|2|
|4|Card Coming soon đúng thiết kế|2|
|5|Kho xu hướng, filter3pill, chi tiết Saver|2, nội dung chuẩn|
|6|Blog composition và dữ liệu mẫu|2, quy ước Up coming|
|7|About/Ghép Ting/entry typography/art|2, font slogan|
|8|Question/loading/result và các state truy cập|2, fixture hợp lệ|
|9|Overlay từng trang, regression, build production và functional smoke|3–8|

Tài liệu thực thi: [Implementation plan](../superpowers/plans/2026-10-17-figma-ui-fidelity.md). Bảng ánh xạ 28 frame/trạng thái và kích thước chuẩn: [figma-reference.json](../design/figma-reference.json). Đây là tài liệu lập kế hoạch; trạng thái mapping không có nghĩa giao diện đã đạt.

## 8. Minh chứng và giới hạn của file ảnh

- [Home cạnh nhau](../../.scratch/figma-ui-audit/screenshots/compare-home-desktop.png): trái Figma1280×3798, phải code1280×4276. Giữ nguyên scale1x, padding xám nơi bên ngắn hơn.
- [Card cạnh nhau](../../.scratch/figma-ui-audit/screenshots/compare-card-desktop.png): trái Figma1280×1176, phải code1280×2500.
- [Card mobile hiện tại](../../.scratch/figma-ui-audit/screenshots/code-card-393x852.png).
- [About hiện tại](../../.scratch/figma-ui-audit/screenshots/code-about-1280x900.png).
- [Chi tiết Saver desktop](../../.scratch/figma-ui-audit/screenshots/code-library-detail-1280x900.png) và [mobile](../../.scratch/figma-ui-audit/screenshots/code-library-detail-393x852.png).
- Browser metrics: .scratch/figma-ui-audit/browser_desktop_1.json, browser_desktop_2.json, browser_mobile.json và library-detail-browser.txt.
- Figma XML/context: .scratch/figma-ui-audit/figma/. Các ảnh figma-*.png không có hậu tố1x là preview đã scale từ MCP, không dùng đo pixel trực tiếp.
- [Nghiên cứu CSS/font/phương pháp xác minh](2026-10-17-figma-visual-verification.md).

Ảnh chụp có thể chứa dev indicator; loại nó khỏi capture nghiệm thu. Không dùng indicator hoặc khác biệt GIF frame để suy ra sai layout. Snapshot code dựa trên HEAD5bb2414772e5bff155c364e3d130f8e83dfcdcd3 cùng thay đổi chưa commit đã tồn tại ở page.tsx, globals.css, home-viewport.css và payload-types.ts. Các thay đổi đó được giữ nguyên.

