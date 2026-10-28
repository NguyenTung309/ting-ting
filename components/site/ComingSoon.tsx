import Image from "next/image";
import { SITE_SOCIAL_URLS } from "@/lib/site-social";

const socialIcons = [
  { src: "/figma-assets/design/f1970.svg", label: "Facebook", href: SITE_SOCIAL_URLS.facebook },
  { src: "/figma-assets/design/b711c.svg", label: "TikTok", href: SITE_SOCIAL_URLS.tiktok },
  { src: "/figma-assets/design/2a6c8.svg", label: "Threads", href: SITE_SOCIAL_URLS.threads },
];

type ComingSoonProps = { variant: "pairing" | "card" };

export function ComingSoon({ variant }: ComingSoonProps) {
  const isCard = variant === "card";

  return (
    <div className="ttt-coming-page">
      <div className="ttt-coming-threads" aria-hidden="true">
        <Image className="ttt-coming-thread thread-one" src="/figma-assets/design/a19d6.svg" alt="" width={440} height={56} />
        <Image className="ttt-coming-thread thread-two" src="/figma-assets/design/bef05.svg" alt="" width={412} height={83} />
        <Image className="ttt-coming-thread thread-three" src="/figma-assets/design/a19d6.svg" alt="" width={440} height={56} />
        <Image className="ttt-coming-thread ttt-coming-thread-mobile mobile-thread-one" src="/figma-assets/design/0eba0.svg" alt="" width={201} height={41} />
        <Image className="ttt-coming-thread ttt-coming-thread-mobile mobile-thread-two" src="/figma-assets/design/b607b.svg" alt="" width={215} height={28} />
        <Image className="ttt-coming-thread ttt-coming-thread-mobile mobile-thread-three" src="/figma-assets/design/b607b.svg" alt="" width={215} height={28} />
      </div>
      <section className="ttt-coming-panel" aria-labelledby="coming-title">
        <div className="ttt-coming-stars" aria-hidden="true">
          <Image className="ttt-coming-star star-five" src="/figma-assets/design/b01cf.svg" alt="" width={26} height={26} />
          <Image className="ttt-coming-star star-six" src="/figma-assets/design/e9815.svg" alt="" width={20} height={20} />
          <Image className="ttt-coming-star star-seven" src="/figma-assets/design/a7ef9.svg" alt="" width={9} height={9} />
        </div>
        <div className="ttt-coming-art" aria-hidden="true">
          <Image className="ttt-coming-pig" src="/figma-assets/design/a637a.png" alt="" width={447} height={394} priority quality={95} sizes="(max-width: 767px) 44vw, 25vw" />
          <Image className="ttt-coming-pair" src="/figma-assets/design/e0c22.png" alt="" width={638} height={368} priority quality={95} sizes="(max-width: 767px) 100vw, 44vw" />
        </div>
        <div className="ttt-coming-copy">
          <div className="ttt-coming-intro">
            <h1 id="coming-title">Coming soon</h1>
            <h2>{isCard ? "Card game sắp ra mắt!" : "Ghép “tính”, chờ “ting”!"}</h2>
            <div className="ttt-coming-description">
              {isCard ? (
                <>
                  <p>Card game của Tình Tính “Ting Ting” đang được chuẩn bị.</p>
                  <p className="ttt-coming-emphasis">Chờ một chút nhé, Card game sẽ sớm ra mắt!</p>
                </>
              ) : (
                <>
                  <p>Khi đặt hai cách “tính” cạnh nhau, liệu nhịp “ting” có xuất hiện?</p>
                  <p><strong>Ghép Ting</strong> sắp ra mắt - cho bạn thử đặt xu hướng tài chính của mình cạnh một người bất kỳ: người yêu, bạn bè hay đơn giản là một ai đó khiến bạn tò mò. Cùng nhịp hay khác “tính”, biết đâu lại mở ra một cuộc trò chuyện thú vị để hiểu nhau hơn.</p>
                  <p className="ttt-coming-emphasis">Chờ một chút nhé, Ghép Ting đang trên đường tới rùiii!</p>
                </>
              )}
            </div>
          </div>
          <div className="ttt-coming-follow">
            <p>Theo dõi <strong>Tình Tính “Ting Ting”</strong> để hóng ngày mở tính năng nha</p>
            <div className="ttt-coming-social" aria-label="Mạng xã hội">
              {socialIcons.map((icon) => (
                <a key={icon.label} href={icon.href} aria-label={icon.label} target="_blank" rel="noopener noreferrer">
                  <Image src={icon.src} alt="" width={36} height={36} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
