import type { UIStrings } from "../types";

export default {
  nav: {
    home: "Trang chủ",
    posts: "Bài viết",
    tags: "Chủ đề",
    about: "Giới thiệu",
    archives: "Lưu trữ",
    search: "Tìm kiếm",
  },
  post: {
    publishedAt: "Đăng ngày",
    updatedAt: "Cập nhật",
    sharePostIntro: "Chia sẻ bài viết:",
    sharePostOn: "Chia sẻ bài viết lên {{platform}}",
    sharePostViaEmail: "Chia sẻ bài viết qua email",
    tagLabel: "Chủ đề",
    backToTop: "Lên đầu trang",
    tableOfContents: "Mục lục",
    goBack: "Quay lại",
    editPage: "Sửa trang này",
    previousPost: "Bài trước",
    nextPost: "Bài sau",
  },
  pagination: {
    prev: "Trước",
    next: "Sau",
    page: "Trang",
  },
  home: {
    socialLinks: "Liên hệ",
    featured: "Nổi bật",
    recentPosts: "Bài mới",
    allPosts: "Tất cả bài viết",
  },
  footer: {
    copyright: "Bản quyền",
    allRightsReserved: "Đã đăng ký bản quyền.",
  },
  pages: {
    tagTitle: "Chủ đề",
    tagDesc: "Tất cả bài viết thuộc chủ đề",

    tagsTitle: "Chủ đề",
    tagsDesc: "Tất cả chủ đề được dùng trong các bài viết.",

    postsTitle: "Bài viết",
    postsDesc: "Tất cả bài viết mình đã đăng.",

    archivesTitle: "Lưu trữ",
    archivesDesc: "Toàn bộ bài viết sắp xếp theo thời gian.",

    searchTitle: "Tìm kiếm",
    searchDesc: "Tìm bài viết bất kỳ ...",
  },
  a11y: {
    skipToContent: "Bỏ qua tới nội dung",
    skipTableOfContents: "Bỏ qua mục lục",
    openMenu: "Mở menu",
    closeMenu: "Đóng menu",
    toggleTheme: "Đổi giao diện sáng/tối",
    searchPlaceholder: "Tìm bài viết...",
    noResults: "Không tìm thấy kết quả",
    goToPreviousPage: "Trang trước",
    goToNextPage: "Trang sau",
  },
  notFound: {
    title: "404 Không tìm thấy",
    message: "Trang này không tồn tại",
    goHome: "Về trang chủ",
  },
} satisfies UIStrings;
