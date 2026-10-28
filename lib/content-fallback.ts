export type PublicPost = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt?: string;
  updatedAt?: string;
  category?: string;
  tags?: string[];
  body: unknown;
  html?: string;
  coverUrl?: string;
  coverAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoImageUrl?: string;
  seoCanonicalUrl?: string;
  seoNoIndex?: boolean;
  relatedPosts?: Array<{ title: string; slug: string; excerpt: string }>;
};

export const fallbackPosts: PublicPost[] = [
  {
    title: "Bắt đầu từ một câu hỏi nhỏ",
    slug: "bat-dau-tu-mot-cau-hoi-nho",
    excerpt: "Đôi khi hiểu mình không cần một câu trả lời thật lớn, chỉ cần một khoảnh khắc thành thật.",
    publishedAt: "2026-09-20",
    category: "Bắt đầu",
    body: {
      root: {
        children: [
          { type: "paragraph", children: [{ text: "Chúng ta thường đi rất nhanh qua những câu hỏi quan trọng. Mình muốn tạo một nơi đủ nhẹ để bạn dừng lại, nhìn lại và gọi tên điều đang diễn ra bên trong." }] },
          { type: "paragraph", children: [{ text: "Tình Tính Ting Ting bắt đầu từ tinh thần đó: không phán xét, không ép buộc, chỉ gợi mở vừa đủ để mỗi người có thêm một góc nhìn về mình và về người đối diện." }] },
        ],
      },
    },
  },
  {
    title: "Tiền bạc cũng là một câu chuyện về cảm xúc",
    slug: "tien-bac-cung-la-mot-cau-chuyen-ve-cam-xuc",
    excerpt: "Cách mình tiêu, giữ và nói về tiền thường kể nhiều điều hơn một bảng ngân sách.",
    publishedAt: "2026-09-18",
    category: "Tài chính",
    body: {
      root: {
        children: [
          { type: "paragraph", children: [{ text: "Một quyết định tài chính hiếm khi chỉ là phép tính. Nó có thể là nhu cầu an toàn, mong muốn tự do, hay cách mình chăm sóc những người mình thương." }] },
          { type: "paragraph", children: [{ text: "Bài test xu hướng tài chính không nhằm dán nhãn bạn. Nó chỉ là một tấm gương nhỏ để bắt đầu cuộc trò chuyện." }] },
        ],
      },
    },
  },
];
