import { CompatibilityMatcher } from "@/components/tests/CompatibilityMatcher";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  path: "/compatibility",
  title: "So sánh tương thích",
  description: "Dùng hai mã kết quả để cùng nhìn lại những điểm đồng điệu và khác biệt.",
  indexable: false,
});

export default function CompatibilityPage() {
  return (
    <Container className="py-12 sm:py-20">
      <SectionHeading eyebrow="Tương thích" title="Bạn và người ấy, có hợp nhau?" description="Dùng hai mã TTT để nhìn thấy những điểm đồng điệu, khác biệt và cách bắt đầu một cuộc trò chuyện nhẹ nhàng hơn." />
      <div className="mt-9 max-w-5xl"><CompatibilityMatcher /></div>
    </Container>
  );
}
