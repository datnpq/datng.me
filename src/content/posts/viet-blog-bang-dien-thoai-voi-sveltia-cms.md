---
title: "Viết blog bằng điện thoại với Sveltia CMS, không cần mở VS Code"
pubDatetime: 2026-11-06T22:00:00+07:00
draft: false
tags:
  - astro
  - blogging
  - tip-trick
description: Blog Astro lưu bài dạng Markdown trong Git, nhưng không phải lúc nào cũng có máy tính. Sveltia CMS cho mình một trang /admin để viết và đăng bài ngay trên điện thoại.
---

Blog này không có database. Mỗi bài là một file Markdown trong thư mục `src/content/posts/`, push lên GitHub là Cloudflare tự build. Gọn, nhưng có một vấn đề: **muốn viết bài phải có máy tính**.

Giải pháp: [Sveltia CMS](https://sveltiacms.app/), một CMS chạy hoàn toàn trong trình duyệt, đọc và ghi thẳng vào repo GitHub. Không server, không database, chỉ là một trang `/admin`.

## Cài đặt: hai file

Toàn bộ "cài đặt" là hai file trong thư mục `public/admin/`:

```html title="public/admin/index.html"
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Dat.Ng CMS</title>
    <script
      src="https://unpkg.com/@sveltia/cms@0.113.6/dist/sveltia-cms.js"
      type="module"
    ></script>
  </head>
  <body></body>
</html>
```

```yaml title="public/admin/config.yml"
backend:
  name: github
  repo: datnpq/datng.me
  branch: main
  auth_methods: [token]

media_folder: src/assets/images
public_folder: "@/assets/images"

collections:
  - name: posts
    label: Bài viết
    folder: src/content/posts
    create: true
    fields:
      - { name: title, label: Tiêu đề, widget: string }
      - { name: description, label: Mô tả ngắn, widget: text }
      - { name: pubDatetime, label: Ngày đăng, widget: datetime }
      - { name: tags, label: Chủ đề, widget: list }
      - { name: featured, label: Nổi bật, widget: boolean, default: false }
      - { name: draft, label: Nháp, widget: boolean, default: false }
      - { name: body, label: Nội dung, widget: markdown }
```

Các `fields` phải khớp với schema của content collection trong Astro, nếu không build sẽ báo lỗi.

## Đăng nhập không cần OAuth

Bình thường Sveltia (và Decap CMS trước nó) cần một OAuth app của GitHub cộng với một server nhỏ để đổi token. Phiền.

Sveltia có đường tắt: **Sign In with Token**. Vào GitHub tạo một personal access token loại fine-grained, chỉ cấp quyền _Contents: Read and write_ cho đúng repo blog, dán vào ô đăng nhập. Token lưu trong trình duyệt, lần sau không phải nhập lại.

Với blog một người viết thì cách này đủ dùng. Mình chốt luôn `auth_methods: [token]` để trang đăng nhập không hiện nút OAuth thừa.

## Quy trình viết bài trên điện thoại

1. Mở `datng.me/admin/`
2. Bài viết → Mới
3. Gõ tiêu đề, mô tả, chọn chủ đề, viết nội dung. Có nút chèn ảnh, ảnh sẽ được upload vào `src/assets/images/`.
4. Bấm **Lưu**. Sveltia tạo commit lên nhánh `main` với message `post: ten-bai`.
5. Cloudflare Workers Builds thấy commit mới, build, deploy. Khoảng một phút sau bài xuất hiện.

Muốn viết dở thì bật **Nháp**: file vẫn được commit nhưng Astro không publish vì có `draft: true`.

## Vài lưu ý sau khi dùng

- Slug lấy từ tiêu đề, bỏ dấu tiếng Việt, nên tiêu đề "Xin chào thế giới" ra file `xin-chao-the-gioi.md`. Muốn slug khác thì đổi tên file sau.
- Ảnh upload qua CMS là ảnh gốc từ điện thoại, khá nặng. Astro sẽ tự tối ưu khi build, nhưng repo thì phình. Mình đang tính chuyển ảnh sang Cloudflare R2 giống cách [Thuận Bùi làm](https://thuanbui.me/).
- Sveltia có chế độ xem trước Markdown, không phải preview đúng giao diện blog. Muốn xem thật thì đợi deploy.

Tóm lại: thêm hai file, có ngay giao diện viết bài trên mọi thiết bị, vẫn giữ được mô hình "nội dung là file trong Git". Đúng thứ mình cần.
