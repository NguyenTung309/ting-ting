import { Container } from "@/components/site/Container";
import { SpeedDatingStart } from "@/components/speed-dating/SpeedDatingStart";

export const metadata = { title: "Bắt đầu Speed Dating" };

export default function SpeedDatingStartPage() {
  return <Container className="py-12 sm:py-20"><SpeedDatingStart /></Container>;
}
