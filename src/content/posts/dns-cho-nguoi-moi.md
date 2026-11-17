---
title: "DNS cho người mới: nameserver, bản ghi A, CNAME, MX, TXT và đám mây cam của Cloudflare"
pubDatetime: 2026-11-17T10:00:00+07:00
draft: false
category: ten-mien-dns
tags:
  - dns
  - ten-mien
  - cloudflare
description: Mua tên miền xong rồi trỏ về đâu? Giải thích DNS bằng ví dụ thật, các loại bản ghi hay dùng, TTL, nút proxy của Cloudflare và cách kiểm tra bằng dig hoặc nslookup.
---

Mua tên miền thì dễ, trỏ nó về đúng chỗ mới là bước nhiều người bị kẹt. Có khi kẹt cả buổi chỉ vì sửa bản ghi ở sai chỗ. Bài này đi từ khái niệm tới cách kiểm tra, đủ để bạn tự trỏ tên miền về VPS hay một dịch vụ bất kỳ.

## DNS là cuốn danh bạ

Máy tính nói chuyện với nhau bằng địa chỉ IP, như `203.0.113.10`. Người thì nhớ tên, như `datng.me`. **DNS** (Domain Name System) là hệ thống tra từ tên ra IP và một số thông tin khác.

Khi bạn gõ `datng.me` vào trình duyệt, máy bạn hỏi một DNS resolver (của nhà mạng, hoặc `1.1.1.1`, `8.8.8.8`). Resolver đi hỏi tiếp cho tới khi gặp **máy chủ DNS có thẩm quyền** của tên miền đó, lấy câu trả lời về và nhớ (cache) trong một khoảng thời gian.

## Hai chỗ khác nhau: nơi mua tên miền và nơi quản lý DNS

Đây là chỗ hay nhầm nhất.

- **Nhà đăng ký (registrar)** là nơi bạn mua và gia hạn tên miền.
- **Nameserver** là nơi giữ các bản ghi DNS, tức là nơi bạn thật sự sửa A, CNAME, MX...

Hai việc này có thể ở hai công ty khác nhau. Ví dụ: mua tên miền ở nhà đăng ký A, nhưng đổi nameserver sang Cloudflare. Từ lúc đó, **mọi bản ghi phải sửa trên Cloudflare**. Sửa ở trang quản lý DNS của nhà đăng ký A sẽ không có tác dụng gì, và đây là lý do của rất nhiều câu hỏi "sao tôi sửa rồi mà không ăn".

Muốn biết tên miền đang dùng nameserver nào thì xem phần kiểm tra ở cuối bài.

## Các loại bản ghi hay dùng

| Loại | Trỏ tới | Dùng khi | Ví dụ |
| --- | --- | --- | --- |
| **A** | Địa chỉ IPv4 | Trỏ tên miền về VPS | `@ → 203.0.113.10` |
| **AAAA** | Địa chỉ IPv6 | Như A, nhưng cho IPv6 | `@ → 2001:db8::10` |
| **CNAME** | Một tên miền khác | Trỏ subdomain sang dịch vụ có sẵn | `www → datng.me` |
| **MX** | Máy chủ nhận email | Dùng email theo tên miền | `@ → mx.nha-cung-cap-mail.com` (ưu tiên 10) |
| **TXT** | Một đoạn chữ | Xác minh tên miền, SPF/DKIM cho email | `@ → "v=spf1 include:... ~all"` |

Vài quy ước:

- `@` nghĩa là chính tên miền gốc (`datng.me`). `www` nghĩa là `www.datng.me`.
- **CNAME không được nằm chung tên với bản ghi khác.** Theo chuẩn, tên gốc `@` luôn có sẵn bản ghi NS và SOA, nên không đặt CNAME ở `@` được. Cloudflare xử lý chuyện này bằng "CNAME flattening": bạn vẫn nhập CNAME ở `@`, nó tự đổi thành IP khi trả lời. Nhiều nhà cung cấp DNS khác không có tính năng này.
- MX và TXT dùng cho email. Đổi nameserver mà quên chép hai loại này sang thì email theo tên miền sẽ ngừng nhận thư.

## TTL: vì sao "sửa rồi mà chưa thấy"

Mỗi bản ghi có **TTL** (time to live): số giây mà resolver được phép nhớ câu trả lời. TTL 3600 thì trong tối đa 1 tiếng, có người vẫn nhận IP cũ.

Mẹo khi sắp chuyển server: hạ TTL xuống 300 (5 phút) từ một ngày trước, đổi IP, chạy ổn rồi thì nâng TTL lên lại.

Riêng việc **đổi nameserver** thì chậm hơn nhiều, có thể mất vài tiếng tới một ngày, vì phải chờ thông tin cập nhật lên cấp quản lý đuôi tên miền (`.me`, `.com`...).

## Đám mây cam của Cloudflare

Trên Cloudflare, cạnh mỗi bản ghi A, AAAA, CNAME có một nút đám mây:

- **Cam (Proxied):** người dùng kết nối tới Cloudflare, rồi Cloudflare mới kết nối tới server của bạn. Bạn có thêm HTTPS, cache, chống DDoS, và **IP thật của server bị giấu đi**.
- **Xám (DNS only):** Cloudflare chỉ trả lời DNS như mọi nhà cung cấp khác, người dùng kết nối thẳng tới IP của bạn.

Bật cam chỉ có tác dụng với **web** (HTTP/HTTPS). Với những thứ khác thì dùng bản ghi xám:

- SSH vào server qua tên miền: tạo một bản ghi xám riêng, ví dụ `ssh.ten-mien.com`, hoặc SSH thẳng bằng IP.
- Bản ghi trỏ tới máy chủ email thì luôn để xám.

Blog này thì không có server nào để trỏ cả. `datng.me` được gắn thẳng vào Cloudflare Workers bằng tính năng Custom Domain, Cloudflare tự tạo bản ghi và cấp chứng chỉ HTTPS.

## Kiểm tra bằng `dig` hoặc `nslookup`

macOS và Linux có `dig`. Windows có `nslookup`, hoặc dùng `Resolve-DnsName` trong PowerShell.

```bash
# Tên miền đang dùng nameserver nào?
dig NS datng.me +short

# Bản ghi A hiện tại
dig A datng.me +short

# Hỏi thẳng một resolver cụ thể, không dính cache của máy mình
dig @1.1.1.1 A datng.me +short
dig @8.8.8.8 A datng.me +short
```

Trên Windows:

```powershell
nslookup -type=NS datng.me
Resolve-DnsName datng.me -Type A -Server 1.1.1.1
```

Nếu `1.1.1.1` đã trả IP mới mà trình duyệt vẫn vào chỗ cũ, khả năng cao là máy bạn còn cache. Trên Windows chạy `ipconfig /flushdns`, rồi mở lại trình duyệt.

Bản ghi A có IP của Cloudflare (thường bắt đầu bằng `104.` hoặc `172.`) thay vì IP VPS của bạn? Đó là bình thường khi bật đám mây cam.

## Tóm tắt

1. Biết rõ nameserver đang ở đâu thì mới sửa bản ghi ở đó.
2. Trỏ về VPS dùng **A**, trỏ sang dịch vụ khác dùng **CNAME**, email cần **MX** và **TXT**.
3. Chưa thấy thay đổi thì nghĩ tới TTL và cache trước.
4. Đám mây cam chỉ dành cho web. SSH và email để xám.

Bài sau trong mục **Web server**: cài Nginx trên VPS và bật HTTPS miễn phí cho tên miền vừa trỏ.
