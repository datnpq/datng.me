---
title: "Làm blog kiểu Yahoo! 360 năm 2026: nền đen, Blast, tuyết rơi và nhạc nền"
pubDatetime: 2026-11-06T21:30:00+07:00
featured: true
draft: false
tags:
  - astro
  - hoai-niem
  - web-development
description: Mình thêm theme "Retro 360" cho blog này, học theo layout Yahoo! 360 ngày xưa. Bài này kể cách làm, kèm ảnh ba skin Đen, Hồng, Xanh và máy nghe nhạc Winamp.
ogImage: ../../assets/images/retro/retro-den.jpg
---

Nếu bạn đang đọc bài này ở theme sáng hoặc tối, bấm nút đổi theme trên header **hai lần**. Blog sẽ biến thành một trang Yahoo! 360.

![Theme Retro 360 skin Đen: nền đen, khung viền trắng, Blast bong bóng, tuyết rơi](@/assets/images/retro/retro-den.jpg)

## Vì sao lại làm cái này

Yahoo! 360 đóng cửa năm 2009. Blog 360 của mình mất sạch, không còn dấu vết nào trên Web Archive. Không lấy lại được nội dung thì lấy lại cái không khí vậy.

Và vì blog này dựng bằng Astro, mọi thứ chỉ là HTML và CSS, nên thêm một theme nữa không phá cái gì cả. Ai thích thì bật, ai không thích thì vẫn đọc theme thường.

## Những gì mình nhớ về layout 360

Mình lục lại mấy ảnh chụp blog 360 cũ trên mạng để nhớ cho đúng:

- **Nền đen** là theme phổ biến nhất, bên cạnh hồng và xanh dương.
- Mọi thứ nằm trong **khung viền trắng mỏng, bo góc**: Blog, Profile Information, Photos, Friends.
- **Blast**: một dòng trạng thái nằm trong bong bóng suy nghĩ, chữ đỏ, font Georgia, phía trên profile.
- Menu kiểu **"Top Page | Blog | Friends"** ngăn bằng dấu gạch đứng.
- Font **Verdana / Tahoma** cỡ nhỏ, link gạch chân.
- Và tất nhiên: nhạc nền, chữ chạy, hình động lấp lánh gắn khắp nơi.

## Cách làm

### 1. Theme thứ ba trong AstroPaper

AstroPaper vốn có sáng/tối qua `data-theme` trên thẻ `html`. Mình sửa script đổi theme để xoay vòng ba giá trị `light → dark → retro`, rồi viết CSS cho `.retro`:

```css
[data-theme="retro"] {
  --background: #000;
  --foreground: #e6e6e6;
  --accent: #fff;
  --border: #8c8c8c;
}
.retro section#featured,
.retro #hero {
  border: 1px solid #9a9a9a;
  border-radius: 6px;
  background: #000;
}
```

### 2. Blast bong bóng

Blast đọc từ frontmatter trang `/now`, hiện ở mọi theme, nhưng ở Retro thì được bọc thành bong bóng bằng hai pseudo-element hình tròn:

```css
.retro #blast {
  border: 1px solid #fff;
  border-radius: 999px;
  color: #ff4b4b;
  font-family: Georgia, serif;
}
.retro #blast::before,
.retro #blast::after {
  content: "";
  position: absolute;
  border: 1px solid #fff;
  border-radius: 50%;
}
```

### 3. Tuyết rơi, sao nhấp nháy, đuôi chuột

Tuyết là một `canvas` cố định phủ toàn màn hình, 60–90 bông, vẽ bằng `requestAnimationFrame`. Sao là `background-image` với vài `radial-gradient` lặp lại và animation đổi `opacity`. Đuôi chuột là mỗi lần `mousemove` tạo một `span` ✦ rồi xoá sau 0.9 giây.

Ba hiệu ứng này chỉ chạy khi `html` có class `retro`, và **tắt hẳn** nếu người xem bật "giảm chuyển động" trong hệ điều hành. Không thì blog thành cái máy ngốn pin.

### 4. Ba skin

![Skin Hồng](@/assets/images/retro/retro-hong.jpg)

Yahoo! 360 cho chọn theme, nên Retro ở đây cũng có ba skin: Đen, Hồng, Xanh. Chọn bằng ba chấm tròn trong profile, lưu vào `localStorage`. Kỹ thuật chỉ là một `data-skin` trên thẻ `html` và vài bộ biến CSS.

### 5. Máy nghe nhạc

![Máy nghe nhạc skin Winamp trong theme Retro](@/assets/images/retro/winamp-player.png)

Phần mình thích nhất. Nhạc phát qua **YouTube IFrame API** nên không phải host file, không vi phạm bản quyền. Player nằm ngoài vùng chuyển trang của Astro (`transition:persist`), nên bấm sang bài khác nhạc vẫn chạy tiếp.

Hạn chế: trình duyệt bây giờ chặn tự phát nhạc có tiếng. Người xem phải bấm Play một lần. Đổi lại, player nhớ bài đang nghe và tự tiếp tục khi quay lại.

Playlist hiện tại là nhạc Giáng sinh. Hết mùa thì đổi danh sách trong một file.

### 6. Lưu bút

![Trang Lưu bút](@/assets/images/retro/luu-but.jpg)

"Quick comment" của 360 giờ là trang [Lưu bút](/guestbook/), chạy bằng Giscus trên GitHub Discussions. Không hoành tráng, nhưng ai ghé cũng để lại được vài dòng.

## Kết

Làm xong mình ngồi bật skin Hồng, mở Last Christmas, nhìn tuyết rơi trên nền đen và tự thấy buồn cười. Không ai cần một cái blog như thế này năm 2026 cả. Nhưng mà vui. Và blog cá nhân thì để làm gì, nếu không phải để vui?

Nếu bạn muốn làm tương tự, toàn bộ code nằm ở [GitHub](https://github.com/datnpq/datng.me), phần Retro trong `src/styles/global.css` và `src/components/RetroEffects.astro`.
