import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://datng.me/",
    title: "Dat.Ng",
    description:
      "Blog cá nhân của Đạt (Dat.Ng) — ghi chép về lập trình web, self-hosting, AI và những thứ mình học được trên đường đi.",
    author: "Đạt",
    profile: "https://datng.me/about/",
    ogImage: "default-og.jpg",
    lang: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    dir: "ltr",
  },
  posts: {
    perPage: 10,
    perIndex: 5,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/datnpq/datng.me/edit/main/",
    },
    search: "pagefind",
    toc: true,
  },
  socials: [
    { name: "github", url: "https://github.com/datnpq", linkTitle: "Đạt trên GitHub" },
    { name: "linkedin", url: "https://www.linkedin.com/in/datnpq/", linkTitle: "Đạt trên LinkedIn" },
    { name: "mail", url: "mailto:dat.ngo2994@gmail.com", linkTitle: "Gửi email cho Đạt" },
  ],
  shareLinks: [
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=", linkTitle: "Chia sẻ lên Facebook" },
    { name: "x", url: "https://x.com/intent/post?url=", linkTitle: "Chia sẻ lên X" },
    { name: "telegram", url: "https://t.me/share/url?url=", linkTitle: "Chia sẻ qua Telegram" },
    { name: "mail", url: "mailto:?subject=Xem%20bài%20này&body=", linkTitle: "Chia sẻ qua email" },
  ],
});
