---
title: "Cài WordPress trên VPS Ubuntu 24.04 với Nginx, PHP-FPM, MariaDB và HTTPS miễn phí"
pubDatetime: 2026-11-17T13:00:00+07:00
draft: false
category: wordpress
tags:
  - wordpress
  - vps
  - nginx
description: Bài mở đầu mục WordPress. Từ một VPS trống tới trang WordPress chạy HTTPS, làm tay từng bước để hiểu mỗi thành phần làm gì, kèm cách kiểm tra sau mỗi bước.
---

Có nhiều script cài WordPress chỉ bằng một lệnh, ví dụ [HocVPS Script](https://hocvps.com/). Muốn nhanh thì cứ dùng. Bài này đi đường chậm hơn: tự cài từng thành phần. Làm tay một lần thì sau này site lỗi bạn sẽ biết mở file nào ra xem.

Bộ cài này hay được gọi là **LEMP**:

- **L**inux: Ubuntu 24.04
- **E**ngine-X: Nginx, web server
- **M**ariaDB: cơ sở dữ liệu (thay thế MySQL)
- **P**HP: ngôn ngữ WordPress được viết bằng

## Chuẩn bị

1. Một VPS Ubuntu 24.04 đã làm theo hai bài trước: [SSH vào lần đầu](/posts/vps-la-gi-ssh-lan-dau/) và [5 việc làm ngay sau khi có VPS](/posts/5-viec-lam-ngay-sau-khi-co-vps/). Cấu hình 1 GB RAM là đủ cho một site nhỏ.
2. Một tên miền đã có bản ghi **A** trỏ về IP của VPS, cả `@` lẫn `www`. Chưa biết cách trỏ thì đọc [DNS cho người mới](/posts/dns-cho-nguoi-moi/). Nếu dùng Cloudflare, tạm thời để **đám mây xám** cho tới khi cài xong HTTPS.

Trong bài mình dùng `example.com` làm ví dụ. Bạn thay bằng tên miền của mình ở mọi chỗ.

## Bước 1: Cài Nginx, PHP và MariaDB

```bash
sudo apt update
sudo apt install -y nginx mariadb-server \
  php-fpm php-mysql php-curl php-gd php-intl php-mbstring php-xml php-zip php-imagick
```

`php-fpm` là PHP chạy thành một dịch vụ riêng, Nginx chuyển các request `.php` sang cho nó xử lý. Các gói `php-...` còn lại là extension mà WordPress và plugin phổ biến cần: kết nối database, xử lý ảnh, nén zip...

Kiểm tra phiên bản PHP vì lát nữa cần dùng:

```bash
php -v
```

Ubuntu 24.04 cài PHP **8.3**. Nếu máy bạn ra số khác thì đổi `8.3` trong các đường dẫn bên dưới cho khớp.

Mở cổng web trên tường lửa UFW:

```bash
sudo ufw allow 'Nginx Full'    # mở cổng 80 và 443
```

Giờ mở `http://IP-cua-VPS` trên trình duyệt. Thấy trang "Welcome to nginx!" là Nginx đã chạy.

## Bước 2: Bảo mật MariaDB và tạo database

Chạy script bảo mật đi kèm MariaDB:

```bash
sudo mariadb-secure-installation
```

Trên Ubuntu, tài khoản `root` của MariaDB đăng nhập qua **unix socket**: chỉ cần `sudo` là vào được, không dùng mật khẩu. Vì vậy:

- Câu hỏi **đổi sang unix_socket** hay **đặt mật khẩu root**: trả lời `n`.
- Các câu còn lại (xoá user ẩn danh, cấm root đăng nhập từ xa, xoá database test, reload privileges): trả lời `Y`.

Tạo database và một user riêng cho WordPress:

```bash
sudo mariadb
```

```sql
CREATE DATABASE wordpress DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wpuser'@'localhost' IDENTIFIED BY 'doi-thanh-mat-khau-dai-va-kho';
GRANT ALL PRIVILEGES ON wordpress.* TO 'wpuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

`utf8mb4` để lưu được đủ tiếng Việt có dấu và emoji. User `wpuser` chỉ có quyền trên đúng database `wordpress`. Lỡ WordPress bị hack thì kẻ tấn công cũng không đụng được database khác.

Thử đăng nhập bằng user vừa tạo:

```bash
mariadb -u wpuser -p wordpress
```

Nhập mật khẩu, vào được thì gõ `EXIT;`.

## Bước 3: Tải WordPress về

```bash
cd /tmp
curl -LO https://wordpress.org/latest.tar.gz
tar xzf latest.tar.gz
sudo mv wordpress /var/www/example.com
sudo chown -R www-data:www-data /var/www/example.com
```

`www-data` là user mà Nginx và PHP-FPM chạy dưới quyền. Cho nó làm chủ thư mục này thì WordPress mới tự cập nhật, cài plugin và upload ảnh được.

## Bước 4: Cấu hình `wp-config.php`

```bash
cd /var/www/example.com
sudo -u www-data cp wp-config-sample.php wp-config.php
sudo -u www-data nano wp-config.php
```

Sửa bốn dòng database cho khớp với bước 2:

```php title="wp-config.php"
define( 'DB_NAME', 'wordpress' );
define( 'DB_USER', 'wpuser' );
define( 'DB_PASSWORD', 'doi-thanh-mat-khau-dai-va-kho' );
define( 'DB_HOST', 'localhost' );
```

Ngay bên dưới là tám dòng `AUTH_KEY`, `SECURE_AUTH_KEY`... đang ghi `put your unique phrase here`. Đây là các khoá dùng để mã hoá cookie đăng nhập. Mở link sau, WordPress sẽ sinh sẵn một bộ khoá ngẫu nhiên:

```text
https://api.wordpress.org/secret-key/1.1/salt/
```

Copy cả tám dòng đó, thay cho tám dòng cũ trong file rồi lưu lại.

## Bước 5: Tạo server block cho Nginx

"Server block" là phần cấu hình của Nginx cho một tên miền.

```bash
sudo nano /etc/nginx/sites-available/example.com
```

```nginx title="/etc/nginx/sites-available/example.com"
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    root /var/www/example.com;
    index index.php index.html;

    client_max_body_size 64M;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    # Chặn file ẩn (.htaccess, .git...) nhưng vẫn cho /.well-known (Let's Encrypt cần)
    location ~ /\.(?!well-known) {
        deny all;
    }

    # Bot hay dò mật khẩu qua xmlrpc. Không dùng app di động hay Jetpack thì chặn luôn.
    location = /xmlrpc.php {
        deny all;
    }
}
```

Từng dòng làm gì:

- `try_files ... /index.php?$args`: bật **permalink đẹp** (`/bai-viet-dau-tien/` thay vì `/?p=1`). Đường dẫn nào không phải file có thật thì chuyển cho WordPress xử lý.
- `fastcgi_pass`: đưa request PHP sang PHP-FPM qua socket. Đường dẫn phải khớp phiên bản PHP ở bước 1.
- `client_max_body_size 64M`: cho upload file tới 64 MB. Nếu không đặt, Nginx mặc định chỉ nhận 1 MB và upload ảnh lớn sẽ báo lỗi `413`.

Bật site, tắt trang mặc định, kiểm tra cú pháp rồi nạp lại cấu hình:

```bash
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t                 # phải thấy "syntax is ok" và "test is successful"
sudo systemctl reload nginx
```

PHP cũng có giới hạn upload riêng, mặc định chỉ 2 MB. Nâng lên cho khớp với Nginx:

```bash
sudo nano /etc/php/8.3/fpm/php.ini
```

Tìm hai dòng sau và sửa lại:

```ini
upload_max_filesize = 64M
post_max_size = 64M
```

```bash
sudo systemctl restart php8.3-fpm
```

## Bước 6: Bật HTTPS miễn phí với Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

Certbot hỏi email để báo khi chứng chỉ sắp hết hạn, rồi xin chứng chỉ và **tự sửa server block** để thêm HTTPS. Nếu được hỏi có chuyển HTTP sang HTTPS không, chọn có.

Chứng chỉ Let's Encrypt có hạn ngắn nhưng được gia hạn tự động bằng một timer của systemd. Thử trước một lần gia hạn giả lập cho chắc:

```bash
sudo certbot renew --dry-run
```

**Nếu dùng Cloudflare:** cài xong HTTPS thì có thể bật đám mây cam. Sau đó vào **SSL/TLS** trên Cloudflare, chọn chế độ **Full (strict)**. Nếu để chế độ "Flexible", Cloudflare gọi về server bằng HTTP, server lại chuyển sang HTTPS, và trang sẽ báo lỗi chuyển hướng vòng tròn (`ERR_TOO_MANY_REDIRECTS`).

## Bước 7: Chạy trình cài đặt WordPress

Mở `https://example.com` và làm theo trình cài đặt:

- Chọn ngôn ngữ **Tiếng Việt**.
- Đặt tên site.
- **Tên đăng nhập: đừng dùng `admin`**, vì đây là cái tên bot thử đầu tiên.
- Mật khẩu: dùng mật khẩu dài mà WordPress gợi ý, lưu vào trình quản lý mật khẩu.

Vài việc nên làm ngay sau khi đăng nhập:

1. **Cài đặt → Đường dẫn tĩnh:** chọn "Tên bài viết". Cấu hình Nginx ở bước 5 đã sẵn sàng cho kiểu đường dẫn này.
2. **Xoá theme và plugin không dùng.** Plugin tắt rồi mà vẫn để đó vẫn có thể bị khai thác nếu có lỗ hổng.
3. **Công cụ → Tình trạng website:** WordPress tự kiểm tra và báo những thứ còn thiếu, ví dụ extension PHP hay thiết lập HTTPS.

## Khi có lỗi

| Hiện tượng | Thường là do | Xem ở đâu |
| --- | --- | --- |
| `502 Bad Gateway` | Sai đường dẫn socket PHP, hoặc PHP-FPM không chạy | `systemctl status php8.3-fpm`, `ls /run/php/` |
| "Error establishing a database connection" | Sai tên database, user hoặc mật khẩu trong `wp-config.php` | Thử lại lệnh `mariadb -u wpuser -p wordpress` |
| Trang chủ vào được, bài viết báo `404` | Thiếu dòng `try_files` | Server block, rồi chạy `nginx -t` |
| Upload báo `413` hoặc "vượt quá dung lượng" | Giới hạn upload của Nginx hoặc PHP | `client_max_body_size` và `php.ini` |
| Cài plugin bị hỏi thông tin FTP | WordPress không có quyền ghi vào thư mục | `sudo chown -R www-data:www-data /var/www/example.com` |

Log lỗi của Nginx nằm ở `/var/log/nginx/error.log`. Gặp lỗi lạ thì xem ở đây trước:

```bash
sudo tail -n 50 /var/log/nginx/error.log
```

## Tiếp theo

Site đã chạy, nhưng mới là phần khung. Các bài sau trong mục **WordPress**: chọn plugin cần thiết (và lý do nên ít plugin), tăng tốc bằng cache, sao lưu database và thư mục `wp-content` ra ngoài VPS.
