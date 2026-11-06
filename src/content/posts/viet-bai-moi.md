---
title: Cách viết một bài mới trên blog này
pubDatetime: 2026-11-05T20:00:00+07:00
draft: false
tags:
  - blogging
  - astro
description: Ghi chú nhanh cho chính mình về frontmatter, ảnh, code block và cách đăng bài nháp.
---

Ghi chú nhanh để sau này không phải tra lại.

## Tạo file

Tạo file mới trong `src/content/posts/`, tên file chính là slug của bài:

```
src/content/posts/ten-bai-viet.md
```

## Frontmatter

```yaml
---
title: Tiêu đề bài viết
pubDatetime: 2026-11-05T20:00:00+07:00
modDatetime: 2026-11-06T08:00:00+07:00 # tuỳ chọn
featured: false # true → hiện ở mục Nổi bật
draft: false # true → không publish
tags:
  - astro
description: Mô tả ngắn, hiện ở danh sách bài và thẻ meta.
---
```

## Ảnh

Để ảnh trong `src/assets/images/` rồi dùng:

```md
![Mô tả ảnh](@/assets/images/ten-anh.jpg)
```

Astro sẽ tự tối ưu và sinh ảnh WebP.

## Code block

Hỗ trợ tên file, highlight dòng và diff:

```ts title="example.ts" {2}
const a = 1;
const b = 2; // dòng này được highlight
```

## Callout

> [!tip]
> Dùng `draft: true` để viết dở mà không sợ lỡ tay publish.

## Đăng bài

```bash
git add .
git commit -m "post: tên bài"
git push
```
