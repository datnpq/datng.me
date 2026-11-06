/**
 * Friends box (blogroll) — hiện ở trang chủ. Thêm/bớt tuỳ ý.
 * avatar: link ảnh hoặc bỏ trống để dùng chữ cái đầu.
 */
export type Friend = {
  name: string;
  url: string;
  note?: string;
  avatar?: string;
};

export const FRIENDS: Friend[] = [
  {
    name: "Thuận Bùi",
    url: "https://thuanbui.me/",
    note: "Web dev, self-hosting, chạy bộ. Blog truyền cảm hứng cho datng.me",
  },
  {
    name: "AstroPaper",
    url: "https://github.com/satnaing/astro-paper",
    note: "Theme gốc của blog này",
  },
  // { name: "Tên bạn", url: "https://...", note: "vài chữ" },
];
