---
title: "MultiCloud: dashboard gom 5 tài khoản Google Drive, chuyển file qua lại không cần tải về"
pubDatetime: 2026-11-17T22:00:00+07:00
featured: false
draft: false
tags:
  - multicloud
  - cloudflare
  - side-project
description: Dự án cuối tuần. Mình có 5 tài khoản Google, mấy cái miễn phí lúc nào cũng đầy 15 GB, còn một cái 5 TB thì gần như trống. Google không cho chuyển file giữa các tài khoản của chính mình, nên mình tự làm một cái dashboard.
ogImage: ../../assets/images/multicloud/01-tong-quan.webp
---

Mình có 5 tài khoản Google. Mấy tài khoản miễn phí lúc nào cũng báo "đầy" ở mức 15 GB, trong khi một tài khoản 5 TB thì gần như bỏ trống. Google lại không có cách nào để chuyển file giữa các tài khoản của chính mình. Thế là cuối tuần ngồi làm **MultiCloud**: một dashboard cá nhân gom hết vào một chỗ và chuyển qua lại được.

<video controls muted playsinline preload="metadata" poster="/videos/multicloud/poster.jpg" width="1440" height="900" style="width:100%;height:auto;border-radius:6px">
  <source src="/videos/multicloud/multicloud-demo.mp4" type="video/mp4" />
</video>

_Clip 35 giây: tổng quan → duyệt tệp → chọn 3 mục → xác nhận → theo dõi tiến độ → xong. Toàn bộ tài khoản, email và file trong clip lẫn ảnh đều là dữ liệu giả lập._

Lần chạy thật đầu tiên: khoảng **127 GB / ~69.000 file**, từ một tài khoản 15 GB đã đầy sang tài khoản 5 TB. File lớn đi trước, mấy tiếng đầu đã xong khoảng 111 GB. Lúc viết bài này thì hàng chục nghìn tấm ảnh nhỏ vẫn đang nhỏ giọt chạy tiếp.

## Nó làm được gì

- Liên kết nhiều tài khoản Google Drive. Mỗi tài khoản hiện dung lượng đã dùng, **tách riêng Drive, thùng rác Drive, Gmail và Google Photos**, kèm gợi ý cái gì đang chiếm chỗ.

![Tổng quan: 5 tài khoản, dung lượng tách theo Drive, thùng rác, Gmail, Photos](@/assets/images/multicloud/01-tong-quan.webp)

- Trình duyệt tệp hai ngăn, mỗi ngăn một tài khoản. Chọn hoặc kéo thả rồi bấm **Sao chép** hay **Di chuyển** sang bên kia.

![Hộp xác nhận chuyển tệp: nguồn, đích, số mục, dung lượng](@/assets/images/multicloud/03-xac-nhan-chuyen.webp)

- Việc sao chép chạy ngầm phía server, không tải qua trình duyệt. Mỗi job tiếp tục được, thử lại được và có kiểm tra lại kết quả.
- **Di chuyển** = sao chép, kiểm tra bản sao, rồi đưa bản gốc vào thùng rác. Có thêm bước **"Giải phóng dung lượng"** để xoá vĩnh viễn (phải xác nhận rõ ràng).
- Tôn trọng giới hạn của Google: 750 GB tải lên/sao chép mỗi tài khoản mỗi ngày, gặp rate limit thì lùi lại rồi thử tiếp.

![Sao chép xong, file đã nằm bên tài khoản kia](@/assets/images/multicloud/05-hoan-tat.webp)

## Làm bằng gì

- TypeScript monorepo: React 19 + Vite ở frontend, một "lõi" chuyển file dùng chung, gọi thẳng Google Drive API v3 bằng `fetch`.
- Chạy trên **Cloudflare Workers + SQLite Durable Object**. Hàng đợi job nằm trong SQLite của Durable Object, chạy từng lát nhỏ theo alarm, nên gập laptop lại job vẫn chạy.
- Đặt sau **Cloudflare Access**, chỉ mình mở được. Refresh token được mã hoá khi lưu.

## Mấy bài toán vui gặp trên đường

1. **Shortcut của Drive không sao chép sang tài khoản khác được**: Google từ chối thẳng. Engine phải tạo lại từng shortcut ở bên đích, trỏ vào _bản sao_ của file gốc nếu file đó cũng được chuyển trong cùng job.
2. **69.000 mục so với giới hạn 128 MB bộ nhớ**: Durable Object sập vì vượt bộ nhớ, do vài chỗ trong code nạp nguyên cả job vào RAM. Sửa lại hết thành truy vấn SQL có lọc, phân trang và `COUNT`. Danh sách gửi lên giao diện cũng giới hạn: hiện 2.000 mục, phần còn lại chỉ đếm.
3. **Thùng rác vẫn tính dung lượng**: "di chuyển" xong mà chẳng trống thêm chút nào, vì file trong thùng rác vẫn ăn quota. Nên mới có bước xoá vĩnh viễn, có xác nhận.
4. **Dung lượng của mình đi đâu?** Drive API v3 không trả về phần Drive riêng cho mấy tài khoản này. Phải lùi về Drive **v2** với `quotaBytesByService` mới tách được Drive / Gmail / Photos, và lòi ra một tài khoản "đầy" mà 80% là Google Photos.
5. **Google Photos bị khoá chặt** từ tháng 3/2025: app bên thứ ba không đọc được cả thư viện Photos nữa. Phần Photos thì dùng tính năng "Chia sẻ với đối tác" có sẵn của Google.

Dự án làm cho mình dùng, chưa có ý định mở cho người khác. Nhưng nếu bạn cũng đang có vài tài khoản Google đầy ứ thì để lại bình luận, biết đâu có động lực dọn code cho gọn.
