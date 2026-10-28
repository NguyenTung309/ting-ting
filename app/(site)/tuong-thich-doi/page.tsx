import { siteMetadata } from "@/lib/seo";
import { ComingSoon } from "@/components/site/ComingSoon";

export const metadata = siteMetadata({
  path: "/tuong-thich-doi",
  title: "Ghép Ting",
  description: "Ghép hai cách tính, mở ra một cuộc trò chuyện thú vị để hiểu nhau hơn.",
  indexable: false,
});

export default function PairingPage() {
  return <ComingSoon variant="pairing" />;
}
