# datng.me

Blog cá nhân, dựng bằng [Astro](https://astro.build/) + theme [AstroPaper](https://github.com/satnaing/astro-paper), host trên Cloudflare Workers.

## Yêu cầu

- Node.js **24** (Astro 7 không chạy trên Node 22.19). Nếu dùng nvm-windows: `nvm use 24.11.1`

## Lưu ý

- Repo không commit `package-lock.json`: lock sinh trên Windows thiếu optional deps Linux nên `npm ci` trên Workers Builds fail. Cloudflare sẽ chạy `npm install`.
- `packageManager` trong package.json pin npm 11 cho Workers Builds.
- Secret `RESEND_API_KEY` phải đặt bằng key **Full access** (key "sending only" bị Resend từ chối khi thêm contact).

## Lệnh

```bash
npm install        # cài dependencies
npm run dev        # http://localhost:4321
npm run build      # build ra dist/ + index Pagefind
npm run preview    # xem thử bản build
npx wrangler deploy   # deploy lên Cloudflare Workers
```

## Viết bài

Tạo file `.md` trong `src/content/posts/`. Xem bài "Cách viết một bài mới trên blog này" để biết frontmatter.

## Cấu hình

- `astro-paper.config.ts` — tên site, mô tả, mạng xã hội, tính năng
- `src/i18n/lang/vi.ts` — chuỗi giao diện tiếng Việt
- `src/content/pages/about.md` — trang Giới thiệu
- `src/pages/index.astro` — hero trang chủ
- `public/avatar.webp` + `avatar.jpg` — ảnh đại diện
- `wrangler.jsonc` — cấu hình deploy Cloudflare
- `worker/index.ts` — Worker xử lý `/api/subscribe` (newsletter qua Resend), còn lại trả static
- `src/components/Newsletter.astro` — form đăng ký nhận bài
- `src/components/Comments.astro` — bình luận Giscus (GitHub Discussions)
- `src/components/ViewCounter.astro`, `RelatedPosts.astro` — lượt xem, bài liên quan
- `src/utils/ogTemplate.ts` — mẫu ảnh OG (dùng `public/avatar.jpg`)
- `src/content/pages/now.md`, `uses.md` — trang /now, /uses
- `public/admin/config.yml` — cấu hình Sveltia CMS

## Newsletter (Resend)

Form gọi `POST /api/subscribe`, Worker gọi Resend `POST /contacts`. Cần đặt secret một lần (nhập key khi được hỏi, không dán vào lệnh):

```bash
npx wrangler secret put RESEND_API_KEY
```

Tuỳ chọn: thêm `RESEND_SEGMENT_ID` vào `vars` trong `wrangler.jsonc` để gom subscriber vào một Segment. Gửi bài mới bằng Broadcasts trong Resend dashboard.

## Bình luận (Giscus)

Repo `datnpq/datng.me` đã bật Discussions. Cần cài app https://github.com/apps/giscus cho repo này một lần. ID repo/category nằm trong `src/components/Comments.astro`.

## Theme

Nút đổi giao diện xoay vòng Sáng → Tối → **Retro 360** (layout Yahoo! 360: nền đen, khung viền trắng, Blast bong bóng, Verdana, marquee, tuyết rơi, sao nhấp nháy, đuôi chuột lấp lánh). CSS retro nằm cuối `src/styles/global.css`, hiệu ứng trong `src/components/RetroEffects.astro`. Tự tắt hiệu ứng khi người xem bật giảm chuyển động.

## Blast, Mood, bài hát tuần, lưu bút

- `src/content/pages/now.md` frontmatter: `blast`, `mood` hiện ở hero trang chủ; `song` (link YouTube) + `songTitle` hiện ở trang /now.
- `/guestbook/` là một thread Giscus chung (mapping `specific`, term `guestbook`).
- Cloudflare Web Analytics: beacon chèn trong `src/layouts/Layout.astro` (token công khai), xem số liệu ở Dashboard → Web analytics → datng.me.

## Viết bài bằng giao diện web (Sveltia CMS)

Mở https://datng.me/admin/ → "Sign In with Token" → tạo GitHub personal access token (Contents: Read and write cho repo `datnpq/datng.me`) → dán vào. Lưu bài = commit lên `main` = tự deploy.

## Lượt xem bài viết

Worker lưu đếm trong KV (`VIEWS`, key `views:<slug>`), API `GET|POST /api/views/<slug>`. Mỗi phiên trình duyệt chỉ tính một lần cho mỗi bài.

## Deploy

- Thủ công: `npm run build && npx wrangler deploy` (tên miền `datng.me` và `www.datng.me` gắn sẵn trong `wrangler.jsonc`)
- Tự động: Workers Builds nối với repo GitHub `datnpq/datng.me`, build command `npm run build`, deploy command `npx wrangler deploy`, nhánh `main`
