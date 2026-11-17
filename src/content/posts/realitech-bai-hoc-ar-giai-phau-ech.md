---
title: "REALITECH: soạn bài học AR \"Giải phẫu Ếch\" không cần một dòng code"
pubDatetime: 2026-11-16T22:00:00+07:00
featured: true
draft: false
tags:
  - realitech
  - ar
  - giao-duc
description: Giáo viên chọn mẫu, gõ chú thích tiếng Việt, bấm xuất bản là có link và mã QR. Học sinh hướng camera vào tờ giấy in mã QR, con ếch 3D hiện lên ngay trên trang giấy. Không cài app, không cần tài khoản.
ogImage: ../../assets/images/realitech/05-ar-ech-tren-giay.webp
---

Mấy bài trước toàn chuyện hoài niệm. Bài này khoe việc mình đang làm hằng ngày: **REALITECH**, nền tảng để giáo viên tự làm bài học thực tế tăng cường (AR) mà không cần biết lập trình.

Ví dụ dễ hiểu nhất là bài **"Giải phẫu Ếch"** cho Sinh học 7. Bạn có thể mở thử ngay: [app.realitech.dev/UzBQjQ4O4PbznDSZ](https://app.realitech.dev/UzBQjQ4O4PbznDSZ).

<video controls muted playsinline preload="metadata" poster="/videos/realitech/ar-ech.jpg" width="1280" height="720" style="width:100%;height:auto;border-radius:6px">
  <source src="/videos/realitech/ar-ech.mp4" type="video/mp4" />
</video>

_Clip 18 giây: mở link, bấm Trải nghiệm, con ếch hiện trên tờ giấy, chạm vào chú thích. Lưu ý: camera trong clip là camera giả lập (ảnh bàn gỗ với tờ giấy in mã QR, đưa vào trình duyệt như một webcam). Phần nhận diện mã QR, dựng con ếch và chú thích là app AR thật đang chạy. Clip quay bằng điện thoại thật mình sẽ bổ sung sau._

## Phía giáo viên: chọn mẫu, gõ chú thích, xuất bản

Giáo viên đăng nhập, tạo dự án mới và chọn một mẫu Giáo dục. Hiện có sẵn **Giải phẫu Ếch** và **Hệ Mặt Trời**.

![Hộp chọn mẫu Giáo dục: Giải phẫu Ếch và Hệ Mặt Trời](@/assets/images/realitech/01-mau-giao-duc.webp)

Mẫu mở ra trong editor 3D: con ếch nằm sẵn trên một marker là mã QR. Giáo viên xoay, phóng to để xem như thật.

![Editor 3D: con ếch đặt trên marker QR](@/assets/images/realitech/02-editor-3d.webp)

Phần việc chính của giáo viên là soạn **chú thích** (hotspot). Mẫu ếch có 6 điểm: mắt, chi trước, chi sau... Mỗi điểm có tiêu đề và nội dung, gõ thẳng bằng tiếng Việt. Gõ tới đâu, thẻ nội dung hiện ngay trên mô hình tới đó.

![Editor đang soạn chú thích "Mắt" bằng tiếng Việt, thẻ nội dung hiện trên mô hình](@/assets/images/realitech/03-editor-chu-thich.webp)

Xong thì bấm **Xuất bản**. Hệ thống trả về một đường link và một mã QR. Mở link trên máy tính thì thấy trang giới thiệu bài học, 3 bước hướng dẫn và mã QR để quét bằng điện thoại.

![Trang mở bài học: tên bài, 3 bước và mã QR](@/assets/images/realitech/04-link-qr.webp)

## Phía học sinh: không cài gì cả

Học sinh chỉ cần:

1. Mở link (hoặc quét mã QR) trên điện thoại, bấm **Trải nghiệm**, cho phép dùng camera.
2. Hướng camera vào tờ giấy in mã QR.
3. Con ếch 3D hiện lên nằm ngay trên trang giấy, kèm 6 điểm chú thích.

![AR: con ếch 3D nằm trên tờ giấy in mã QR, có 6 điểm chú thích](@/assets/images/realitech/05-ar-ech-tren-giay.webp)

Chạm vào một điểm thì nội dung giáo viên vừa soạn hiện ra, ví dụ "Chi sau":

![AR: chạm vào chú thích "Chi sau", hiện mô tả tiếng Việt](@/assets/images/realitech/06-ar-chu-thich.webp)

Không app, không tài khoản, chạy thẳng trên trình duyệt. Với lớp học, đây là điều quan trọng nhất: chỉ cần học sinh phải cài một ứng dụng là mất toi 10 phút đầu giờ.

_Như clip ở trên, hai ảnh AR này cũng dùng camera giả lập._

## Hướng mở rộng: RealiScan

Bên cạnh **RealiStudio** (trình dựng cảnh AR/VR ở trên), team đang nghiên cứu **RealiScan**: đi một vòng quanh đồ vật thật bằng điện thoại, hệ thống dựng lại thành mô hình 3D, rồi đưa thẳng vào bài học AR. Tức là giáo viên không bị giới hạn trong thư viện mẫu có sẵn.

<video controls muted playsinline preload="metadata" poster="/videos/realitech/realiscan.jpg" width="1280" height="720" style="width:100%;height:auto;border-radius:6px">
  <source src="/videos/realitech/realiscan.mp4" type="video/mp4" />
</video>

_Clip 12 giây: quét một chiếc ghế thật thành mô hình 3D, rồi đặt vào phòng. RealiScan đang trong giai đoạn nghiên cứu phát triển, chưa phát hành._

## Giáo viên dùng thử thế nào?

- Trang giải pháp giáo dục: [realitech.vn/solutions/education](https://realitech.vn/solutions/education)
- Bảng giá gói giáo dục: [realitech.vn/pricing#edu](https://realitech.vn/pricing#edu). Gói **Teacher miễn phí 1 năm** cho giáo viên. Gói **Institution miễn phí** cho trường khi được duyệt.

Từ cái web teen copy code năm 2008 tới một nền tảng giáo viên dùng để dạy học, đường hơi dài. Nhưng cảm giác thì vẫn y như hồi đó: **làm ra một thứ rồi có người khác dùng**. Thầy cô nào thử rồi thì để lại bình luận bên dưới, mình đọc hết.
