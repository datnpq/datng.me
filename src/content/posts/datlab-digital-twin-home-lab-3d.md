---
title: 'Từ "vẽ giùm cái sơ đồ mạng" đến một cái game: chuyện DatLab Digital Twin'
pubDatetime: 2026-11-17T21:00:00+07:00
featured: true
draft: false
category: home-lab
tags:
  - home-lab
  - digital-twin
  - threejs
  - proxmox
  - web-audio
  - claude-code
description: "Mình biến home lab ở TP. Hồ Chí Minh thành một bản sao 3D chạy trong trình duyệt, dùng dữ liệu mạng thật, có ping và Wake-on-LAN thật, đi bộ kiểu GTA, nhiệm vụ hằng ngày và chơi chung với bạn bè."
ogImage: ../../assets/images/datlab/09-balcony-sunset-chill.webp
---

Mọi chuyện bắt đầu rất vô hại. Home lab ở nhà mình có hai node Proxmox, vài chục máy ảo và một đống thiết bị trong LAN, và trước giờ mình chỉ xem chúng qua bảng biểu, terminal với mấy trang quản trị. Mình muốn có một cái sơ đồ mạng cho dễ nhìn: máy nào nằm đâu, cái nào đang bật, cái nào đang tắt. Vậy thôi.

Kết quả là một bản sao 3D của cả home lab chạy ngay trong trình duyệt. Có Trái Đất nhìn từ vũ trụ, có pha rơi xuyên mây, có một căn hộ tối giản, có nhân vật đi lại kiểu GTA, có nhiệm vụ hằng ngày, có nhạc lofi, và bạn bè vào chơi chung được. Thiết bị, trạng thái bật/tắt và tải CPU trên đó đều là dữ liệu thật của mạng nhà mình. Mình đặt tên nó là **DatLab Digital Twin**.

Xem video trước cho dễ hình dung (khoảng 80 giây, có tiếng, nên bật loa):

<video controls playsinline preload="metadata" poster="/videos/datlab/poster.jpg" width="1280" height="720" style="width:100%;height:auto;border-radius:6px">
  <source src="/videos/datlab/datlab-digital-twin.mp4" type="video/mp4" />
</video>

*Mọi ảnh và video trong bài đều quay ở chế độ ẩn danh: tên VM được thay bằng "VM &lt;id&gt;", máy tính của một người trong nhà được đổi tên, địa chỉ MAC bị che. Toạ độ hiện trên bản đồ là trung tâm TP. Hồ Chí Minh, không phải nhà mình; các địa chỉ IP trong ảnh chỉ là địa chỉ mạng nội bộ.*

## Ban đầu chỉ là cái sơ đồ

Nói thật luôn từ đầu: mình làm project này cùng Claude Code (một AI coding agent) trong một phiên làm việc rất dài. Câu đầu tiên mình gõ đại ý là "làm cho nó trông giống protocol-explorer". Nghe khiêm tốn lắm.

Rồi mình bắt đầu đòi thêm. "Cho nó giống phim Marvel." Rồi "metaverse". Rồi "GTA". Mỗi lần mình nâng yêu cầu lên một bậc, con AI lại làm được, nên mình lại nâng tiếp. Mình lo ý tưởng, hạ tầng thật và việc kiểm tra; agent viết phần lớn code. Mỗi bước đều là một vòng: thử, nhìn, sửa. Bài này kể lại đại khái cách mọi thứ phình ra.

## Bước một: cho nó dữ liệu thật

Sơ đồ vẽ tay thì hôm sau đã sai. Nên việc quan trọng nhất là cho nó dữ liệu thật.

Kiến trúc mình cố giữ thật gọn, gồm ba mảnh:

1. **Một server Python nhỏ** chạy trên PC của mình, chỉ dùng thư viện chuẩn, không cài thêm gói nào. Nó phục vụ file tĩnh và một API trạng thái.
2. **Một collector** chạy nền trong server đó. Cứ khoảng mười mấy giây, nó hỏi một node Proxmox nằm trong mạng nội bộ xem thiết bị nào trong LAN đang sống, máy ảo nào đang chạy, CPU và RAM ra sao.
3. **Trang 3D** viết bằng Three.js, nạp thẳng từ CDN, không có bước build. Trang chỉ vẽ những gì server đưa cho nó.

Lúc viết bài này, bản đồ đang hiện **khoảng 70 thiết bị và VM**, trong đó gần 50 là máy ảo Proxmox nằm trên 2 node. Phần mình thích nhất: thiết bị lạ nào xuất hiện trong LAN sẽ tự rơi vào khu **"Chưa nhận diện"**. Không cần khai báo gì, cứ có trong mạng là nó hiện lên bản đồ.

![Toàn cảnh lab ở chế độ hologram: thiết bị, các node Proxmox và các tầng VM](@/assets/images/datlab/04-hologram-overview.webp)

## Bấm trên bản đồ, mạng thật phản hồi

Bản đồ không chỉ để ngắm. Từ giao diện mình bấm **ping** hoặc **Wake-on-LAN** được thật: magic packet được gửi đi từ node Proxmox, vì node đó nằm thẳng trong LAN. Trên màn hình, gói tin được vẽ thành một chấm sáng chạy dọc theo dây. Bấm ping một cái máy rồi nhìn chấm sáng bò tới nó, cảm giác khá đã mắt.

![Một lệnh ping thật đang chạy dọc theo dây, đường đi phát sáng](@/assets/images/datlab/05-hologram-ping.webp)

## "Cho nó giống phim Marvel"

Có dữ liệu rồi thì tới phần làm màu. Giao diện đầu tiên là kiểu HUD hologram khoa học viễn tưởng: bloom, sàn lưới phát sáng, sóng xung kích lan ra mỗi khi bấm chọn, ping hay đánh thức một thiết bị. Nhìn vào thấy như đang ngồi trong phòng điều khiển của một tập đoàn phản diện nào đó, dù thật ra chỉ là cái lab ở nhà.

Mô hình thiết bị (server, router, PC…) được sinh bằng một script Python chạy trong Blender rồi xuất ra glTF. Không ai phải ngồi nặn từng cái bằng tay.

## Từ vũ trụ nhảy xuống nhà

Phim Marvel nào cũng phải có cảnh mở đầu hoành tráng. Trang đầu tiên là Trái Đất nhìn từ vũ trụ, mỗi Digital Twin là một đèn hiệu (beacon). Hiện mới có một cái là DatLab, nhưng danh sách site nằm trong file `sites.json`, nên sau này muốn thêm nơi khác chỉ cần thêm một mục.

Bấm **"Nhảy vào"** là camera lao thẳng về tọa độ đó.

![Lao về phía beacon, có hiệu ứng vệt tốc độ](@/assets/images/datlab/02-space-dive.webp)

Gần tới nơi, camera chuyển sang giai đoạn hai: rơi thẳng đứng xuyên qua mấy lớp mây, bên dưới là ảnh vệ tinh thật từ Esri World Imagery, chồng nhiều tầng zoom từ 3 tới 17. Càng xuống thấp ảnh càng nét, cho tới khi thấy trung tâm TP. Hồ Chí Minh rồi chuyển vào lab. Đây là đoạn mình xem lại nhiều lần nhất.

![Rơi xuyên qua các lớp mây, bên dưới là ảnh vệ tinh TP. Hồ Chí Minh](@/assets/images/datlab/03-satellite-descent.webp)

## "Metaverse": xây luôn cái nhà

Hologram đẹp nhưng hơi lạnh. Nên cùng bộ dữ liệu và cùng layout thiết bị đó, mình có thêm chế độ thứ hai: **"nhà thật"**. Đó là một căn hộ tối giản, chill: tường, sàn gỗ và sàn bê tông, sofa thấp, vườn có cây và hồ nước, một ban công đặt trên cột có cầu thang đi lên. Thiết bị vẫn nằm đúng chỗ, giờ thì nằm trong từng phòng.

![Chế độ nhà thật nhìn từ trên cao: các phòng, khu vườn, thiết bị nằm trong phòng](@/assets/images/datlab/06-house-overview.webp)

Ngày đêm chạy theo **giờ thật ở TP. Hồ Chí Minh**: 6h mặt trời mọc ở hướng đông, 18h lặn ở hướng tây, buổi chiều có nắng vàng ấm, tối thì có sao và đèn trong nhà bật lên. Mở bản đồ lúc nửa đêm để kiểm tra server thì ngoài trời cũng tối, sao lên, đèn vàng trong nhà và ngoài vườn sáng lên. Chi tiết nhỏ nhưng làm cảnh "sống" hẳn lên.

## "GTA": sơ đồ mạng có nhân vật

Tới đây thì mình không dừng được nữa. Mình muốn đi bộ trong cái nhà đó.

Thế là có nhân vật góc nhìn thứ ba, điều khiển bằng WASD và chuột, camera kiểu GTA, chạy được, nhảy được. Nhân vật là model Soldier miễn phí trong bộ ví dụ của three.js (gốc từ Mixamo).

![Nhân vật đi qua phòng khách tối giản, góc màn hình có bảng nhiệm vụ](@/assets/images/datlab/07-walk-living-room.webp)

Có nhân vật thì phải có nhiệm vụ. Mỗi ngày game chọn ra vài nhiệm vụ **dựa trên trạng thái mạng thật** lúc đó, ví dụ:

- Đánh thức một thiết bị đang tắt
- Kiểm tra con VM đang ngốn CPU nhiều nhất
- Điều tra một thiết bị lạ
- Ping thử một thiết bị tự nhiên im lặng
- Ra ban công ngồi chơi

Làm xong thì có XP, lên level, có minimap, tiến độ được lưu lại trong trình duyệt. Nghĩa là "chơi game" ở đây cũng chính là đi một vòng kiểm tra home lab. Lần đầu tiên mình thấy việc đi ping một con máy im lặng lại có cảm giác "quest".

![Nhân vật trong phòng server, có các điểm đánh dấu nhiệm vụ](@/assets/images/datlab/08-walk-server-room-missions.webp)

## Ngồi ban công, bật lofi

Nhiệm vụ cuối nghe hơi lạc đề, nhưng thật ra là phần mình chăm chút nhất. Nhân vật ngồi được lên sofa, ghế và ban công. Tư thế ngồi không lấy từ clip animation có sẵn mà được tạo bằng code. Vừa ngồi xuống là một bản lofi bắt đầu phát.

![Nhân vật ngồi ngoài ban công lúc hoàng hôn, giao diện được ẩn](@/assets/images/datlab/09-balcony-sunset-chill.webp)

![Cũng ban công đó vào ban đêm, có dây đèn và sao trời](@/assets/images/datlab/10-balcony-night.webp)

## Âm thanh: không có lấy một file

Về mặt kỹ thuật, đây là phần mình thấy vui nhất: toàn bộ âm thanh được tổng hợp ngay trong trình duyệt bằng Web Audio, không có file âm thanh nào.

- Tiếng bước chân đổi theo mặt sàn: gỗ, gạch, cỏ.
- Ping thì kêu bíp, Wake-on-LAN thì có tiếng quét "vút".
- Ban ngày có chim hót, ban đêm có dế kêu.
- Nhạc lofi là một vòng lặp sinh bằng code, nhạc nền kiểu trailer trong video cũng vậy.

Vì mọi thứ đều là code nên có thể dựng lại cùng những âm thanh đó, đúng thời điểm, ở chỗ khác. Phần quay video bên dưới dựa đúng vào điều này.

## Rủ bạn bè vào chơi

Ở nhà một mình thì buồn, nên có luôn multiplayer. Vài người bạn mình mời riêng có thể vào chung, thấy nhau đi lại và ngồi theo thời gian thực. Khách chỉ xem và đi dạo, không điều khiển được thiết bị. Server không mở ra Internet, chỉ chạy trong mạng riêng.

![Hai người chơi trong phòng khách, một người đang ngồi sofa](@/assets/images/datlab/11-multiplayer.webp)

## Quay video bằng đồng hồ ảo

Quay màn hình trực tiếp thì giật, nhất là khi cảnh nặng bloom. Nên video demo được làm theo kiểu từng khung hình: một script điều khiển Chrome headless qua DevTools protocol và chạy trang trên một **đồng hồ ảo**. Thời gian trong trang do script quyết định, mỗi bước là một frame được chụp lại, nên máy chậm cỡ nào video vẫn đều 30 fps.

Âm thanh xử lý riêng: trong lúc quay, mỗi sự kiện âm thanh được ghi lại theo frame. Sau đó soundtrack được render offline bằng chính bộ code âm thanh của trang, rồi ffmpeg chuẩn hóa độ lớn về -14 LUFS. Hình và tiếng cùng bám một trục thời gian nên khớp nhau từng frame.

## Công nghệ

- **Three.js** r160, nạp từ CDN, không có bước build
- **Blender 5.3** (script Python) để sinh mô hình thiết bị, xuất glTF
- **Python** HTTP server, chỉ dùng thư viện chuẩn, kiêm collector
- **Web Audio API** cho toàn bộ âm thanh
- **Proxmox VE** (2 node) làm nguồn dữ liệu và điểm gửi ping/WOL
- **Chrome headless** qua DevTools protocol và **ffmpeg** để quay video

## Tiếp theo

Nhìn lại thì cái sơ đồ 2D gọn gàng như ý định ban đầu vẫn chỉ là bản nháp chạy dữ liệu mẫu. Nó cũng không thay được công cụ giám sát nghiêm túc. Thay vào đó mình có một nơi để "về nhà" mỗi tối: rơi từ vũ trụ xuống, đi một vòng xem máy nào im lặng, đánh thức con nào đang ngủ, rồi ra ban công ngồi nghe lofi nhìn trời TP. Hồ Chí Minh tối dần. Bài học rút ra: đừng bao giờ nói "cho nó giống phim Marvel" với một con AI biết code, trừ khi bạn thật sự rảnh. Còn bước tiếp theo thì có lẽ là thêm một đèn hiệu nữa vào `sites.json`.
