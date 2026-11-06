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

## Deploy

1. `npm run build && npx wrangler deploy` → có ngay URL `datng-me.<account>.workers.dev`
2. Gắn tên miền: Cloudflare Dashboard → Workers & Pages → datng-me → Settings → Domains & Routes → Add → `datng.me` (DNS đã nằm trên Cloudflare)
3. Tự động deploy khi push: kết nối repo GitHub qua Workers Builds, build command `npm run build`, deploy command `npx wrangler deploy`
