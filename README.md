# Local source publication

## Repository status

Next.js web application and responsive interface.

This repository contains a filtered local source snapshot. Application builds and end-to-end behavior have not been verified during publication.

Credential files, detected credential values, dependencies, build outputs and large backup archives were excluded. Configure your own services and secrets before running.

Upstream source: https://github.com/WuWuyn/tinhtinhtingting. Original authorship and existing license terms remain applicable. This is a source import, not a GitHub fork.

---

# Tình Tính Ting Ting

Website tiếng Việt về tài chính khi yêu, bài test tương thích và các góc chia sẻ.

## Công nghệ

- Next.js App Router 16, React 19, TypeScript
- TailAdmin-style admin dashboard trong Next.js; Payload CMS 3 chạy headless để lưu bài viết và media trên Supabase PostgreSQL
- Supabase PostgreSQL lưu cả nội dung CMS lẫn dữ liệu ứng dụng: hồ sơ, kết quả bài test, tài khoản và các tính năng cộng đồng
- Tailwind CSS 4, Motion, Zod

## Chạy local

Yêu cầu Node.js 22/24, pnpm 11 và một dự án Supabase có PostgreSQL.

1. Cài dependency và tạo cấu hình local nếu chưa có:

   ```powershell
   pnpm install
   if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
   ```

   Lấy chuỗi kết nối PostgreSQL trong Supabase Dashboard → Connect → Session pooler. Dùng chuỗi đó cho cả `PAYLOAD_DATABASE_URL` và `APP_DATABASE_URL`. Hai kết nối xác minh TLS bằng CA tại `certs/supabase-prod-ca-2021.crt`. Điền `PAYLOAD_SECRET`, `AUTH_SECRET` và `ADMIN_EMAILS` (email Google của quản trị viên; nhiều email phân tách bằng dấu phẩy). Giữ `PAYLOAD_DB_PUSH=false`; các bảng ứng dụng và Payload nằm trong cùng database nhưng dùng các tên bảng riêng. Không ghi đè `.env.local` đã có các khóa cần giữ.

2. Chạy website:

   ```powershell
   pnpm dev -- --port 3002
   ```

   Website mở tại <http://localhost:3002>. Mở <http://localhost:3002/admin/sign-in> và đăng nhập Google bằng email đã khai báo ở `ADMIN_EMAILS`. Dashboard tại `/admin` quản lý lượt làm bài, người dùng, bài blog và thư viện ảnh. TailAdmin là giao diện quản trị; Payload chỉ chạy headless làm nơi lưu bài viết/media. Payload lưu collection trong các bảng `ttt_payload_*`; dữ liệu ứng dụng được lưu trong `app_records`. Supabase phải cho phép role kết nối tạo bảng và index khi ứng dụng khởi chạy lần đầu. Blog, metadata, canonical, ảnh chia sẻ và trạng thái noindex được đọc từ Payload; nếu Supabase chưa truy cập được, website tạm dùng hai bài fallback có sẵn.

3. Nếu có bản sao database ứng dụng SQLite cũ, nhập hồ sơ và dữ liệu vào Supabase sau khi đã cấu hình `APP_DATABASE_URL`:

   ```powershell
   pnpm migrate:app-data "$env:LOCALAPPDATA\Temp\ttt-strapi-before-payload-20261008.sqlite"
   ```

   Lệnh này chỉ đọc file SQLite được truyền vào và không nhập thông tin đăng nhập quản trị của hệ thống cũ. Thay đường dẫn bằng nơi bạn đã lưu bản sao database. Nếu dữ liệu nguồn nằm trong PostgreSQL, điền `STRAPI_DATABASE_URL` trong `.env.local`; khi đó không cần truyền đường dẫn SQLite.

4. Khi triển khai trường tags cho bài viết, sau khi bảng Payload đã được khởi tạo, chạy migration idempotent:

   ```powershell
   pnpm migrate:payload-post-tags
   ```

   Migration thêm trường JSON tags vào bảng bài viết và bảng phiên bản; Payload vẫn giữ `PAYLOAD_DB_PUSH=false`.

5. Nếu muốn nhập hai bài viết cũ đã chuẩn bị sẵn vào Payload, chạy lệnh idempotent sau khi cấu hình kết nối database:

   ```bash
   pnpm payload:import-legacy
   ```

## Nội dung

- TailAdmin quản lý người dùng Google thường, bộ câu hỏi, chi tiết từng lượt làm, bài blog và thư viện ảnh tại `/admin`.
- Trang tổng quan tập trung vào số tài khoản và lượt làm; GA4 và Search Console dùng cho phân tích truy cập.
- Admin có thể sửa câu hỏi và nhãn đáp án; mã đáp án, trọng số chấm điểm và nhóm kết quả cố định không chỉnh được từ dashboard.
- Đăng nhập quản trị chỉ bằng Google và email trong `ADMIN_EMAILS`; API quản trị xác thực quyền ở server.
- Bài blog có tiêu đề, slug, mô tả, nội dung, chuyên mục, tags, ngày đăng, ảnh bìa/alt và SEO title/description/image/canonical/noindex theo mô hình Strapi trước đây.
- Thư viện ảnh lưu media trên Payload; có alt text và cho chọn ảnh dùng làm ảnh bìa hoặc ảnh chia sẻ blog.
- Hai bộ test và 15 hồ sơ xu hướng được quản lý trong `lib/tests/default-tests.ts` và `lib/trends/catalog.ts`.
- Site settings mặc định ở `lib/site-settings.ts`.
- Hồ sơ tài khoản, kết quả test và dữ liệu ứng dụng được lưu trong bảng `app_records` trên Supabase; Payload dùng các bảng `ttt_payload_*` cho nội dung biên tập.

### Nội dung cũ

Hai bài đã xuất bản được chuyển thành dữ liệu CMS trung lập tại [`migrations/payload/legacy-posts.json`](./migrations/payload/legacy-posts.json). Lệnh `pnpm payload:import-legacy` tạo chuyên mục và bài viết ở trạng thái đã xuất bản; slug trùng sẽ được bỏ qua để không ghi đè nội dung biên tập sau này.

## Tính năng

- Trang chủ, Về dự án, test tài chính, tương thích đôi, kho xu hướng và blog.
- Scoring v3 chạy server-side; kết quả tra cứu bằng mã TTT.
- Auth.js + Google, hồ sơ và lịch sử kết quả.
- Matching 18+ ẩn danh trước mutual consent; block/report và chat DB + polling, hiện tắt bằng feature flags.
- S3-compatible private media production và upload local.
- PNG kết quả tương thích đôi sinh bằng `next/og`.

Các feature flags `MATCHING_ENABLED`, `SPEED_DATING_ENABLED` và `CHAT_ENABLED` mặc định tắt cho tới khi hoàn tất policy safety và cấu hình OAuth.

## Route chính

```text
/                         Trang chủ
/ve-du-an                 Về dự án
/test-xu-huong-tai-chinh  Test tài chính
/tuong-thich-doi          Test tương thích đôi
/kho-tang-tinh-cach       Danh sách xu hướng
/kho-tang-tinh-cach/[slug] Chi tiết xu hướng
/ket-qua/[code]           Tra cứu kết quả bằng mã TTT
/blog                     Danh sách bài viết
/blog/[slug]              Chi tiết bài viết
/admin                    Dashboard quản trị
/admin/sign-in            Đăng nhập Google cho quản trị viên
/speed-dating             Discovery (feature flag)
```

`GET /api/health` báo trạng thái website, PostgreSQL ứng dụng, kết nối database Payload/Supabase và storage.

## Backup và production

Ứng dụng Next.js có thể triển khai trên hosting hỗ trợ Node.js; Supabase cung cấp PostgreSQL cho dữ liệu ứng dụng và Payload headless. Cấu hình `APP_DATABASE_URL`, `PAYLOAD_DATABASE_URL`, `PAYLOAD_SECRET`, `AUTH_SECRET`, `AUTH_URL`, `ADMIN_EMAILS` và `NEXT_PUBLIC_SITE_URL` trên môi trường triển khai. Dùng chuỗi Session pooler có TLS cho `APP_DATABASE_URL`, giữ `PAYLOAD_DB_PUSH=false`, và chỉ áp dụng migration đã rà soát khi thay đổi schema. Cấu hình storage bền vững cho media tải lên; `public/media` chỉ phù hợp cho môi trường local. Sao lưu PostgreSQL bằng các backup của dự án Supabase.

Khi chạy Node.js trực tiếp với `output: "standalone"` (không cần Docker), Next.js không tự chép tài nguyên tĩnh. Sau `pnpm build`, chép `public/` vào `.next/standalone/public/` và `.next/static/` vào `.next/standalone/.next/static/`; đảm bảo `.next/standalone/.next/cache/` có quyền ghi, rồi chạy `node .next/standalone/server.js`.

## Cấu trúc

```text
app/(site)/       Website public
app/(admin)/      TailAdmin dashboard và đăng nhập Google
app/api/          API ứng dụng và API quản trị có kiểm tra quyền
components/       Giao diện website, dashboard và test runner
lib/              Payload headless, database Supabase, test engine và validation
public/           Tài nguyên giao diện
payload/          Collections, quyền truy cập và schema lưu nội dung Payload
```

Quy chuẩn visual hiện tại nằm trong [DESIGN.md](./DESIGN.md).
