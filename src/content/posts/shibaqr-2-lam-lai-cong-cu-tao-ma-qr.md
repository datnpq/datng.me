---
title: "ShibaQR 2.0: làm lại một công cụ tạo mã QR từ đầu"
pubDatetime: 2026-11-17T20:00:00+07:00
draft: false
tags:
  - shibaqr
  - laravel
  - side-project
description: Mấy tháng liền không có đơn nào, mình soi lại thì thấy mã QR menu quét ra JSON và trang web hứa những tính năng chưa có. Thế là làm lại hết, gọi là ShibaQR 2.0.
ogImage: ../../assets/images/shibaqr/01-home-hero.webp
---

ShibaQR là công cụ tạo mã QR mình làm cho quán nhỏ, cửa hàng nhỏ. Bản đầu chạy từ tháng 8/2026. Mấy tháng liền không có đơn nào.

Mình ngồi soi lại. Lý do không chỉ là ít người biết. Có mã QR menu quét ra một đoạn JSON thay vì mở link. Có câu trên trang hứa những tính năng chưa hề có. Thế là mình quyết định làm lại, gọi là 2.0.

![Trang chủ ShibaQR 2.0](@/assets/images/shibaqr/01-home-hero.webp)

## Giao diện mới: nền tối, màu cam

Mình chọn kiểu "studio tối": nền gần đen, điểm nhấn cam #FF6A1A, chữ tiêu đề Space Grotesk. Nút cam dùng chữ đen chứ không dùng chữ trắng, vì chữ trắng trên nền cam này không đủ tương phản.

## Studio thiết kế mã

Đây là phần mình thích nhất. Bạn đổi được kiểu chấm (vuông, bo tròn, chấm tròn), kiểu ba góc định vị, màu góc, thêm khung có lời kêu gọi như "Quét để xem menu", và gắn logo vào giữa.

![Studio thiết kế](@/assets/images/shibaqr/02-logo-generator.webp)

<video controls muted playsinline loop preload="metadata" poster="/videos/shibaqr/demo-studio.jpg" style="width:100%;height:auto;border-radius:6px">
  <source src="/videos/shibaqr/demo-studio.mp4" type="video/mp4" />
</video>

_Thao tác trong studio, 14 giây._

Server chỉ có thư viện GD, không có Imagick để chuyển SVG sang PNG. Nên mình tính hình học của mã một lần, rồi vẽ ra hai bản: một bản SVG, một bản PNG vẽ to rồi thu nhỏ cho mịn. Hai bản dùng chung một phép tính nên không bao giờ lệch nhau.

Khi gắn logo, mức sửa lỗi tự lên mức cao nhất. Mình cũng có test tự động đọc lại tâm từng ô của ảnh PNG và so với ma trận gốc. Sau đó mình quét thử bằng điện thoại thật cả iPhone lẫn Android.

![Mẫu mã có kiểu](@/assets/images/shibaqr/06-styled-qr-samples.webp)

## Trang lưu sẵn trên shiba.pw

Nhiều quán không có website. Nên mã QR động giờ có thể mở một trang lưu ngay trên ShibaQR: thực đơn có giá, danh thiếp có nút "Lưu vào danh bạ", trang link-in-bio. Sửa nội dung lúc nào cũng được, mã đã in vẫn giữ nguyên. Trang hiện theo ngôn ngữ điện thoại của người quét.

![Menu, danh thiếp và link-in-bio trên điện thoại](@/assets/images/shibaqr/07-hosted-pages-mobile.webp)

_(Dữ liệu mẫu: tên quán, tên người, số điện thoại và email trong ảnh đều là giả.)_

## Thống kê

Trang thống kê so sánh với kỳ trước, chia theo giờ và theo thứ, có bản đồ quốc gia, thiết bị, hệ điều hành, và xuất CSV. Biểu đồ vẽ bằng SVG phía server, không dùng thư viện biểu đồ.

![Thống kê](@/assets/images/shibaqr/08-analytics-timeline.webp)

*(Ảnh thống kê dùng dữ liệu mẫu trên máy local.)*

## Thanh toán

Khách chọn trả bằng thẻ qua Polar (tự gia hạn, huỷ lúc nào cũng được) hoặc bằng crypto qua Cryptomus (trả một kỳ). Câu chữ về thanh toán trên trang tự đổi theo cổng nào đang thực sự chạy, để không bao giờ hứa thứ mà trang thanh toán không làm được.

![Bảng giá](@/assets/images/shibaqr/04-pricing.webp)

_Bảng giá tại thời điểm viết bài (11/2026)._

## Vài con số thật

- 16 loại mã QR, 4 ngôn ngữ: Anh, Việt, Nhật, Đức.
- Gói: Free, Pro $9/tháng, Business $29, Enterprise $99.
- 87 commit từ 03/08/2026, khoảng 460 test tự động.
- Laravel 13, Livewire 4, Tailwind 4, PostgreSQL. Chạy Docker trên Proxmox ở nhà, ra internet qua Cloudflare Tunnel.

## Bước tiếp theo

ShibaQR vẫn chưa có khách trả tiền. Google cũng mới bắt đầu index lại, vì sitemap từng không đọc được suốt từ tháng 10. Việc tiếp theo là làm sâu nội dung từng trang công cụ, và đưa ShibaQR lên vài danh bạ phần mềm.

Ghé chơi thử nhé: [shiba.pw](https://shiba.pw)
