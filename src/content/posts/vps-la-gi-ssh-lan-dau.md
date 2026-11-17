---
title: "VPS là gì, có cần không, và SSH vào VPS lần đầu"
pubDatetime: 2026-11-17T08:00:00+07:00
draft: false
category: vps-linux
tags:
  - vps
  - linux
  - ssh
description: Bài mở đầu mục VPS & Linux. Phân biệt hosting, VPS và serverless, khi nào thật sự cần VPS, chọn cấu hình nào, rồi tạo SSH key và đăng nhập lần đầu trên Ubuntu.
---

Mở mục **Kỹ thuật** bằng bài cơ bản nhất: VPS. Bài viết cho người chưa từng đụng tới server. Ai rành rồi thì lướt qua phần sau, có mấy mẹo nhỏ về SSH config.

## Hosting, VPS, serverless khác nhau chỗ nào

| | Shared hosting | VPS | Serverless / web tĩnh |
| --- | --- | --- | --- |
| Bạn được gì | Một thư mục trên server chung | Một máy ảo riêng, quyền root | Chỗ để chạy code hoặc file tĩnh, không thấy server |
| Ai lo hệ điều hành | Nhà cung cấp | **Bạn** | Nhà cung cấp |
| Hợp với | WordPress nhỏ, web PHP | App chạy liên tục, database, bot, VPN | Blog, landing page, API nhẹ |

Blog này thuộc cột thứ ba: Astro build ra file tĩnh, đẩy lên Cloudflare Workers, không có VPS nào cả. Mình có viết riêng [cách dựng blog này](/posts/dung-blog-astro-cloudflare/).

Vậy khi nào mới cần VPS? Khi bạn cần một thứ **chạy liên tục** và **tự quyết mọi thứ**: một con bot Telegram, một database, một app Node/PHP/Python có tiến trình nền, hoặc đơn giản là muốn học Linux cho đàng hoàng. Học server thì không có cách nào nhanh hơn là tự thuê một cái rồi tự làm hỏng nó.

## Chọn VPS thế nào

Đừng nghĩ nhiều ở bước này. Cho người mới học, cấu hình sau là đủ:

- **1 vCPU, 1–2 GB RAM, 20–25 GB SSD.** Gói rẻ nhất của hầu hết nhà cung cấp.
- **Hệ điều hành: Ubuntu 24.04 LTS.** LTS là bản hỗ trợ dài hạn, tài liệu và hỏi đáp trên mạng nhiều nhất.
- **Vị trí: Singapore** (hoặc Việt Nam nếu dùng nhà cung cấp trong nước) để ping từ Việt Nam thấp.
- Nhà cung cấp nào tính tiền theo giờ thì càng tốt: làm hỏng thì xoá, tạo lại cái mới, mất vài nghìn đồng.

Giá và khuyến mãi thay đổi liên tục nên mình không ghi số cụ thể ở đây.

## Bước 1: Tạo SSH key trước khi tạo VPS

Có hai cách đăng nhập server: **mật khẩu** hoặc **SSH key**. Dùng key ngay từ đầu, khỏi phải đổi sau.

SSH key là một cặp: **khoá riêng** (private key) nằm trên máy bạn, không bao giờ gửi cho ai; **khoá công khai** (public key) thì dán lên server. Server chỉ cho vào ai cầm đúng khoá riêng.

Windows 10/11, macOS và Linux đều có sẵn lệnh `ssh-keygen`. Mở Terminal (Windows thì PowerShell) và chạy:

```bash
ssh-keygen -t ed25519 -C "laptop-cua-minh"
```

Cứ Enter để lưu ở chỗ mặc định. Khi hỏi passphrase, nên đặt một cái: lỡ mất laptop thì khoá riêng vẫn bị khoá. Xong bạn có hai file:

```text
~/.ssh/id_ed25519       ← khoá riêng, giữ kỹ
~/.ssh/id_ed25519.pub   ← khoá công khai, đem đi dán
```

Xem nội dung khoá công khai để copy:

```bash
cat ~/.ssh/id_ed25519.pub
```

Lúc tạo VPS, nhà cung cấp sẽ có ô **SSH Keys**. Dán dòng này vào đó.

## Bước 2: SSH vào lần đầu

VPS tạo xong sẽ có một địa chỉ IP. Đăng nhập bằng user `root`:

```bash
ssh root@203.0.113.10
```

(Thay bằng IP thật của bạn. `203.0.113.x` là dải IP dành cho ví dụ.)

Lần đầu kết nối, SSH sẽ hỏi có tin "fingerprint" của server không. Gõ `yes`. Từ giờ máy bạn nhớ server này; nếu một ngày nó báo fingerprint **đã thay đổi** mà bạn không cài lại server, hãy dừng lại và tìm hiểu trước khi gõ tiếp.

## Bước 3: Cập nhật hệ thống

Việc đầu tiên trên mọi server mới:

```bash
apt update && apt upgrade -y
```

`apt update` tải danh sách gói mới nhất, `apt upgrade` cài bản cập nhật. Nếu nó báo cần khởi động lại thì `reboot`, đợi một phút rồi SSH vào lại.

## Bước 4: Tạo user riêng, thôi dùng root

`root` làm được mọi thứ, kể cả xoá sạch server chỉ bằng một lệnh gõ nhầm. Thói quen tốt là tạo user thường, khi nào cần quyền cao thì gõ `sudo`.

```bash
adduser dat              # đổi "dat" thành tên bạn muốn, đặt mật khẩu khi được hỏi
usermod -aG sudo dat     # cho user này dùng sudo
```

Mật khẩu này dùng cho `sudo`, không phải để đăng nhập SSH. Giờ copy SSH key từ root sang user mới để đăng nhập được bằng key:

```bash
rsync --archive --chown=dat:dat ~/.ssh /home/dat
```

**Đừng thoát phiên root vội.** Mở một cửa sổ terminal khác và thử:

```bash
ssh dat@203.0.113.10
sudo whoami    # phải in ra: root
```

Vào được và `sudo` chạy được thì mới yên tâm. Nguyên tắc này dùng suốt: **sửa gì liên quan tới đăng nhập thì luôn giữ một phiên cũ đang mở**, lỡ khoá mình ở ngoài thì còn đường quay lại.

## Mẹo: đặt tên tắt trong `~/.ssh/config`

Gõ IP mãi thì mệt. Trên máy **của bạn** (không phải trên server), mở file `~/.ssh/config` (chưa có thì tạo) và thêm:

```text title="~/.ssh/config"
Host vps
    HostName 203.0.113.10
    User dat
    IdentityFile ~/.ssh/id_ed25519
```

Từ giờ chỉ cần:

```bash
ssh vps
```

Lệnh `scp` và `rsync` cũng hiểu tên tắt này, ví dụ `scp file.txt vps:~/`.

## Tiếp theo

VPS lúc này đã vào được bằng key và có user riêng, nhưng vẫn còn để ngỏ vài cửa: root vẫn đăng nhập được, mật khẩu vẫn dùng được, chưa có tường lửa. Bài tiếp theo trong mục **Bảo mật & sao lưu**: [5 việc làm ngay sau khi có VPS](/posts/5-viec-lam-ngay-sau-khi-co-vps/).
