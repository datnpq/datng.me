/**
 * "Kỹ thuật" sections: basic, practical write-ups grouped by topic.
 * A post joins a section with `category: <slug>` in its frontmatter.
 * Order here = order on /ky-thuat.
 */
export type Category = {
  slug: string;
  name: string;
  icon: string;
  desc: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "nhap-mon",
    name: "Nhập môn",
    icon: "🌱",
    desc: "Terminal, Git, HTTP: mấy thứ nền tảng ai làm web cũng phải đụng tới.",
  },
  {
    slug: "vps-linux",
    name: "VPS & Linux",
    icon: "🖥️",
    desc: "Thuê VPS, SSH vào, quản lý user, cập nhật hệ thống. Đi từ con số 0.",
  },
  {
    slug: "ten-mien-dns",
    name: "Tên miền & DNS",
    icon: "🌐",
    desc: "Mua tên miền xong thì trỏ về đâu, các loại bản ghi, Cloudflare làm gì ở giữa.",
  },
  {
    slug: "web-server",
    name: "Web server",
    icon: "⚙️",
    desc: "Nginx, reverse proxy, HTTPS miễn phí với Let's Encrypt.",
  },
  {
    slug: "bao-mat-sao-luu",
    name: "Bảo mật & sao lưu",
    icon: "🔒",
    desc: "Khoá cửa server cho đàng hoàng và luôn có bản sao lưu trước khi lỡ tay.",
  },
  {
    slug: "web-tinh-serverless",
    name: "Web tĩnh & serverless",
    icon: "⚡",
    desc: "Không cần VPS vẫn có web: Astro, Cloudflare Workers, deploy bằng git push.",
  },
  {
    slug: "home-lab",
    name: "Home lab & self-host",
    icon: "🏠",
    desc: "Tự chạy dịch vụ trên máy ở nhà: Proxmox, máy ảo, container.",
  },
];

export const CATEGORY_SLUGS = CATEGORIES.map(c => c.slug) as [string, ...string[]];

export const getCategory = (slug?: string) =>
  slug ? CATEGORIES.find(c => c.slug === slug) : undefined;
