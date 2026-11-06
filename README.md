# datng.me

Blog cá nhân, dựng bằng [Astro](https://astro.build/) + theme [AstroPaper](https://github.com/satnaing/astro-paper), host trên Cloudflare Workers.

## Yêu cầu

- Node.js **24** (Astro 7 không chạy trên Node 22.19). Nếu dùng nvm-windows: `nvm use 24.11.1`

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

## Newsletter (Resend)

Form gọi `POST /api/subscribe`, Worker gọi Resend `POST /contacts`. Cần đặt secret một lần (nhập key khi được hỏi, không dán vào lệnh):

```bash
npx wrangler secret put RESEND_API_KEY
```

Tuỳ chọn: thêm `RESEND_SEGMENT_ID` vào `vars` trong `wrangler.jsonc` để gom subscriber vào một Segment. Gửi bài mới bằng Broadcasts trong Resend dashboard.

## Bình luận (Giscus)

Repo `datnpq/datng.me` đã bật Discussions. Cần cài app https://github.com/apps/giscus cho repo này một lần. ID repo/category nằm trong `src/components/Comments.astro`.

## Deploy

- Thủ công: `npm run build && npx wrangler deploy` (tên miền `datng.me` và `www.datng.me` gắn sẵn trong `wrangler.jsonc`)
- Tự động: Workers Builds nối với repo GitHub `datnpq/datng.me`, build command `npm run build`, deploy command `npx wrangler deploy`, nhánh `main`
