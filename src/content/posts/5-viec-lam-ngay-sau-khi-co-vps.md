---
title: "5 việc làm ngay sau khi có VPS: khoá SSH, tường lửa, fail2ban, tự cập nhật, sao lưu"
pubDatetime: 2026-11-17T09:00:00+07:00
draft: false
category: bao-mat-sao-luu
tags:
  - vps
  - linux
  - bao-mat
description: Server vừa lên mạng vài phút là đã có bot thử đăng nhập. Năm việc nên làm ngay trên Ubuntu 24.04, mỗi việc vài lệnh, kèm cách kiểm tra lại cho chắc.
---

Bài này nối tiếp [VPS là gì và SSH vào lần đầu](/posts/vps-la-gi-ssh-lan-dau/). Giả sử bạn đã có:

- VPS Ubuntu 24.04,
- một user thường có quyền `sudo`,
- đăng nhập được bằng SSH key.

Thử gõ lệnh này trên một VPS vừa tạo được vài tiếng:

```bash
sudo journalctl -u ssh --since "1 hour ago" | grep -c "Invalid user"
```

Con số thường không nhỏ. Đó là bot quét khắp Internet, thử những user kiểu `admin`, `test`, `oracle` với mật khẩu phổ biến. Không ai nhắm vào bạn cả, nhưng cũng không cần để cửa mở cho chúng.

> **Quy tắc vàng:** trong lúc sửa SSH và tường lửa, **luôn giữ một phiên SSH đang mở** và thử đăng nhập bằng một cửa sổ khác. Nếu lỡ tay khoá mình ở ngoài, hầu hết nhà cung cấp VPS có "Console" trên web để vào cứu.

## 1. Tắt đăng nhập bằng root và bằng mật khẩu

Thay vì sửa thẳng `/etc/ssh/sshd_config`, tạo một file riêng trong thư mục `sshd_config.d`:

```bash
sudo nano /etc/ssh/sshd_config.d/00-hardening.conf
```

```text title="/etc/ssh/sshd_config.d/00-hardening.conf"
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
```

**Tại sao lại là `00-`?** Với OpenSSH, giá trị nào được đọc **trước** thì thắng. Nhiều VPS có sẵn file `50-cloud-init.conf` bật `PasswordAuthentication yes`, và các file trong thư mục này được đọc theo thứ tự tên. Đặt tên bắt đầu bằng `00-` thì file của mình được đọc trước nên thắng.

Kiểm tra cú pháp, xem cấu hình thực tế đang áp dụng, rồi khởi động lại:

```bash
sudo sshd -t                                     # không in gì = cú pháp ổn
sudo sshd -T | grep -Ei 'permitrootlogin|passwordauthentication'
sudo systemctl restart ssh
```

Lệnh thứ hai phải ra `permitrootlogin no` và `passwordauthentication no`. Giờ mở cửa sổ mới và thử `ssh root@IP`: phải bị từ chối. Thử `ssh user@IP` bằng key: vẫn phải vào được.

## 2. Bật tường lửa UFW

UFW (Uncomplicated Firewall) có sẵn trên Ubuntu. Chặn hết chiều vào, chỉ mở những gì cần. **Mở SSH trước khi bật**, nếu không thì tự khoá mình ở ngoài:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status verbose
```

Sau này cài web server thì mở thêm cổng web:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Nhiều nhà cung cấp còn có **firewall ở tầng mạng** (Cloud Firewall, Security Group…). Dùng cả hai cũng được, chỉ cần nhớ là có hai lớp: mở cổng ở UFW mà vẫn không vào được thì kiểm tra lớp kia.

## 3. Cài fail2ban để chặn IP thử sai liên tục

Đã tắt mật khẩu thì bot không thể đoán trúng. Nhưng fail2ban vẫn có ích: nó cấm luôn những IP cứ thử hoài, log đỡ rác hơn.

```bash
sudo apt install -y fail2ban python3-systemd
```

Đừng sửa `jail.conf` vì file này sẽ bị ghi đè khi cập nhật. Tạo `jail.local`:

```bash
sudo nano /etc/fail2ban/jail.local
```

```ini title="/etc/fail2ban/jail.local"
[sshd]
enabled  = true
backend  = systemd
maxretry = 5
findtime = 10m
bantime  = 1h
```

Nghĩa là: trong 10 phút, IP nào sai 5 lần thì bị chặn 1 tiếng. `backend = systemd` để fail2ban đọc log từ journal của systemd. Bật và kiểm tra:

```bash
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

Đợi một lúc rồi chạy lại lệnh cuối, dòng `Currently banned` sẽ bắt đầu có IP.

## 4. Để server tự cài bản vá bảo mật

Ubuntu có sẵn gói `unattended-upgrades` để tự cài các bản **vá bảo mật**. Kiểm tra cho chắc là nó đang bật:

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades   # chọn Yes
```

Mặc định nó chỉ cài bản vá bảo mật, không tự nâng phiên bản lớn nên khá an toàn. Thỉnh thoảng SSH vào thấy dòng `*** System restart required ***` thì chọn lúc vắng người dùng mà `sudo reboot`.

## 5. Sao lưu, và thử khôi phục ít nhất một lần

Bốn việc trên giúp server khó bị phá. Việc này để **lỡ có chuyện thì không mất gì**: xoá nhầm, cập nhật hỏng, hoặc chính mình gõ sai lệnh.

Mức tối thiểu, theo thứ tự dễ làm:

1. **Bật backup tự động của nhà cung cấp**, thường tốn thêm khoảng 10–20% tiền VPS. Rẻ nhất, đỡ việc nhất.
2. **Chụp snapshot thủ công trước mỗi thay đổi lớn**: nâng cấp hệ điều hành, cài thứ lạ, sửa cấu hình mạng.
3. **Có một bản nằm ngoài nhà cung cấp đó.** Ví dụ dump database và đẩy sang một chỗ lưu trữ khác. Tài khoản VPS bị khoá thì backup nằm cùng chỗ cũng mất theo.

Backup chưa từng thử khôi phục thì coi như chưa có. Làm thử một lần: tạo VPS mới từ snapshot, xem nó chạy được không, rồi xoá đi. Tốn vài phút và ít tiền, nhưng lần sau có chuyện bạn sẽ không phải lần mò.

## Tóm tắt

| Việc | Lệnh chính | Kiểm tra |
| --- | --- | --- |
| Khoá SSH | `sshd_config.d/00-hardening.conf` | `sudo sshd -T` |
| Tường lửa | `ufw allow OpenSSH` → `ufw enable` | `ufw status verbose` |
| fail2ban | `jail.local` với `[sshd]` | `fail2ban-client status sshd` |
| Tự vá | `unattended-upgrades` | `dpkg-reconfigure` |
| Sao lưu | backup/snapshot của nhà cung cấp | khôi phục thử một lần |

Xong năm việc này, VPS của bạn đã an toàn hơn phần lớn server đang chạy ngoài kia. Bài sau sẽ trỏ tên miền về server: [DNS cho người mới](/posts/dns-cho-nguoi-moi/).
