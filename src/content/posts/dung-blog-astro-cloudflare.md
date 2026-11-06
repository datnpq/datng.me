---
title: Dựng blog cá nhân với Astro và Cloudflare trong một buổi chiều
pubDatetime: 2026-11-06T10:00:00+07:00
draft: false
tags:
  - astro
  - cloudflare
  - web-development
description: Ghi chép cách mình dựng datng.me bằng Astro + AstroPaper, deploy lên Cloudflare Workers và trỏ tên miền riêng.
---

Bài này ghi lại các bước mình đã làm để dựng blog này. Mục tiêu: **không server, không database, viết bài bằng Markdown**.

## Stack

| Thành phần | Lựa chọn                              |
| ---------- | ------------------------------------- |
| Framework  | Astro                                 |
| Theme      | AstroPaper                            |
| Tìm kiếm   | Pagefind (chạy hoàn toàn phía client) |
| Hosting    | Cloudflare Workers (static assets)    |
| Nội dung   | Markdown trong Git                    |

## Bước 1: Khởi tạo project

```bash
git clone --depth 1 https://github.com/satnaing/astro-paper datng.me
cd datng.me
rm -rf .git
npm install
```

## Bước 2: Cấu hình

Mọi thứ về site nằm trong `astro-paper.config.ts`: tên, mô tả, ngôn ngữ, múi giờ, mạng xã hội.

```ts title="astro-paper.config.ts"
site: {
  url: "https://datng.me/",
  title: "Đạt Ng",
  lang: "vi",
  timezone: "Asia/Ho_Chi_Minh",
}
```

Giao diện tiếng Việt thì thêm file `src/i18n/lang/vi.ts` và đổi `locales` trong `astro.config.ts`.

## Bước 3: Chạy thử

```bash
npm run dev
```

Mở `http://localhost:4321` để xem.

## Bước 4: Deploy lên Cloudflare

Tạo file `wrangler.jsonc`:

```jsonc title="wrangler.jsonc"
{
  "name": "datng-me",
  "compatibility_date": "2026-11-01",
  "assets": { "directory": "./dist" },
}
```

Rồi:

```bash
npm run build
npx wrangler deploy
```

Sau đó vào Cloudflare Dashboard → Workers → Settings → Domains & Routes → thêm `datng.me`. Vì tên miền đã nằm trên Cloudflare DNS nên chỉ vài phút là xong.

## Bước 5: Tự động build khi push

Kết nối repo GitHub với Workers Builds trong Dashboard. Từ đó mỗi lần `git push` là Cloudflare tự build và deploy bản mới.

## Việc còn lại

- Thêm hệ thống bình luận
- Tối ưu ảnh với Cloudflare R2 + Image Transformations
- Viết thêm bài!
