import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteMetadata } from "@/lib/seo";
import { ResponsiveFigmaArt } from "@/components/site/ResponsiveFigmaArt";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata = siteMetadata({
  path: "/",
  title: "Tình Tính Ting Ting – Tài chính trong tình yêu",
  description: "Khám phá xu hướng tài chính trong tình yêu, làm bài test và mở những cuộc trò chuyện giúp hai người hiểu nhau hơn.",
});

function ArrowLink({ href, children, variant = "primary", reveal }: { href: string; children: ReactNode; variant?: "primary" | "secondary"; reveal?: "left" | "right" | "up" }) {
  return (
    <Link href={href} className={`ttt-pill-link${variant === "secondary" ? " secondary" : ""}`} data-home-reveal={reveal}>
      {children}
      <Image className="ttt-pill-arrow" src={variant === "secondary" ? "/figma-assets/design/deb76.svg" : "/figma-assets/design/1ed75.svg"} alt="" width={15} height={14} aria-hidden="true" />
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="ttt-home">
      <section className="ttt-home-screen ttt-home-screen-opening" data-home-section>
        <div className="ttt-home-opening">
          <section className="ttt-home-hero" aria-label="Tình Tính Ting Ting" data-home-reveal="up">
            <h1 className="sr-only">Tình Tính Ting Ting: tài chính trong tình yêu</h1>
            <div className="ttt-home-hero-image">
              <Image src="/tinhtinhtingting.gif" alt="Minh họa Tình Tính Ting Ting với những câu chuyện về tiền và tình yêu" width={2944} height={1248} preload unoptimized />
            </div>
          </section>

          <section className="ttt-home-intro">
            <div className="ttt-home-wave">
              <Image className="desktop" src="/figma-assets/design/5f9b6.svg" alt="" width={1280} height={117} />
              <Image className="mobile" src="/figma-assets/design/cb6df.svg" alt="" width={393} height={36} />
              <p data-home-reveal="up">
                <span className="ttt-home-intro-lead">Một chiến dịch truyền thông</span>{" "}
                <br className="sm:hidden" />
                <span className="ttt-home-intro-support">nhằm tăng cường nhận thức</span>
                <br className="hidden sm:block" />
                <br className="sm:hidden" />
                <span className="ttt-home-intro-support">và tương tác tích cực về tài chính cặp đôi</span>
              </p>
              <a className="ttt-down-arrow" href="#ve-du-an" aria-label="Xem nội dung tiếp theo">
                <Image className="ttt-down-arrow-icon desktop" src="/figma-assets/design/9986b.svg" alt="" width={38} height={21} />
                <Image className="ttt-down-arrow-icon mobile" src="/figma-assets/design/493c1.svg" alt="" width={28} height={16} />
              </a>
            </div>
          </section>
        </div>
      </section>

      <section className="ttt-home-screen ttt-home-screen-about" id="ve-du-an" data-home-section>
        <section className="ttt-home-about">
          <Image className="ttt-home-ticket" src="/figma-assets/design/feb0e.svg" alt="" fill sizes="(max-width: 767px) 100vw, min(1080px, calc(100vw - 48px))" />
          <div className="ttt-home-about-content">
            <div className="ttt-home-copy">
              <h2 data-home-reveal="left">Về dự án</h2>
              <p data-home-reveal="left">Từ câu chuyện tài chính khô khan, Tình Tính “Ting Ting” mong muốn mang đến cho Gen Z một cách nhìn gần gũi, vui vẻ và tích cực hơn về tài chính cặp đôi - để chuyện tiền bạc không còn khó nói, mà có thể trở thành một phần giúp hai người hiểu nhau hơn và cùng xây dựng một mối quan hệ{" "}<br className="ttt-home-mobile-break" />bền vững.</p>
              <ArrowLink href="/ve-du-an" reveal="left">Hiểu hơn về dự án</ArrowLink>
            </div>
            <div className="ttt-home-about-art" aria-hidden="true" data-home-reveal="right">
              <ResponsiveFigmaArt
                className="ttt-home-about-composite"
                desktopSrc="/figma-assets/design/home-about-desktop.png"
                mobileSrc="/figma-assets/design/home-about-mobile-cutout.png"
                sizes="(max-width: 767px) 92vw, 557px"
              />
            </div>
          </div>
        </section>
      </section>

      <section className="ttt-home-screen ttt-home-screen-test" data-home-section>
        <section className="ttt-home-test">
          <div className="ttt-home-test-art" aria-hidden="true" data-home-reveal="left">
            <ResponsiveFigmaArt
              className="ttt-home-test-composite"
              desktopSrc="/figma-assets/design/home-test-desktop-cutout.png"
              mobileSrc="/figma-assets/design/home-test-mobile-cutout.png"
              sizes="(max-width: 767px) 88vw, 492px"
            />
          </div>
          <div className="ttt-home-copy">
            <h2 data-home-reveal="right">Bạn “tính” thế nào khi yêu?</h2>
            <p data-home-reveal="right">Khi đứng trước những câu chuyện về chi tiêu, tiết kiệm, chia sẻ hay tự chủ tài chính, mỗi người đều có những ưu tiên rất riêng.</p>
            <p data-home-reveal="right">15 xu hướng – 15 cách “tính” chuyện tiền khác nhau. Trả lời <span className="ttt-home-desktop-count">22</span><span className="ttt-home-mobile-count">22</span> tình huống để khám phá đâu là xu hướng nổi bật của bạn trong tình yêu.</p>
            <div className="ttt-home-actions">
              <ArrowLink href="/test-xu-huong-tai-chinh" reveal="up">Làm test ngay</ArrowLink>
              <ArrowLink href="/kho-tang-tinh-cach" variant="secondary" reveal="up">Khám phá 15 xu hướng</ArrowLink>
            </div>
          </div>
        </section>
      </section>

      <section className="ttt-home-screen ttt-home-screen-pairing" data-home-section>
        <section className="ttt-home-pairing">
          <Image className="ttt-home-pairing-orb orb-top-left desktop" src="/figma-assets/design/ea2c5.svg" alt="" width={340} height={340} />
          <Image className="ttt-home-pairing-orb orb-top-right desktop" src="/figma-assets/design/e327f.svg" alt="" width={359} height={359} />
          <Image className="ttt-home-pairing-orb orb-bottom-left desktop" src="/figma-assets/design/d388a.svg" alt="" width={384} height={384} />
          <Image className="ttt-home-pairing-orb orb-bottom-right desktop" src="/figma-assets/design/0b41f.svg" alt="" width={420} height={420} />
          <Image className="ttt-home-pairing-orb orb-top-left mobile" src="/figma-assets/design/25676.svg" alt="" width={133} height={133} />
          <Image className="ttt-home-pairing-orb orb-top-right mobile" src="/figma-assets/design/d21b5.svg" alt="" width={108} height={108} />
          <Image className="ttt-home-pairing-orb orb-bottom-left mobile" src="/figma-assets/design/49700.svg" alt="" width={238} height={238} />
          <Image className="ttt-home-pairing-orb orb-bottom-right mobile" src="/figma-assets/design/676b0.svg" alt="" width={187} height={187} />
          <div className="ttt-home-pairing-copy">
            <h2 data-home-reveal="up">Hai cách “tính”, có cùng nhịp “ting”?</h2>
            <div className="ttt-home-pairing-details">
              <div className="ttt-home-pairing-prose">
                <p data-home-reveal="up">Khi cả hai đã có kết quả test, hãy Ghép Ting để khám phá cách hai xu hướng tài chính gặp nhau. Từ những điểm tương đồng đến những khác biệt, kết quả sẽ giúp hai bạn nhận ra điều gì đang cùng nhịp, điều gì cần hiểu thêm và đâu có thể là câu chuyện đáng để cả hai cùng mở lời.</p>
                <p className="ttt-pairing-note" data-home-reveal="up">% Ghép Ting thể hiện mức độ tương đồng về xu hướng tài chính, không phải tỷ lệ thành công của một mối quan hệ</p>
              </div>
              <ArrowLink href="/tuong-thich-doi" reveal="up">Thử ghép Ting</ArrowLink>
            </div>
          </div>
          <div className="ttt-home-pairing-art" aria-hidden="true" data-home-reveal="up">
            <Image className="ttt-pairing-hand-left" src="/figma-assets/design/home-pairing-hands.png" alt="" width={4724} height={2362} sizes="(max-width: 767px) 198px, 446px" quality={95} />
            <Image className="ttt-pairing-hand-right" src="/figma-assets/design/home-pairing-hands.png" alt="" width={4724} height={2362} sizes="(max-width: 767px) 194px, 418px" quality={95} />
            <Image className="ttt-pairing-coin" src="/figma-assets/design/home-pairing-coin.png" alt="" width={1181} height={1181} sizes="127px" quality={95} />
          </div>
        </section>
      </section>

      <section className="ttt-home-screen ttt-home-screen-sharing" data-home-section>
        <section className="ttt-home-sharing">
          <div className="ttt-home-sharing-art">
            <Image src="/figma-assets/design/e0c22.png" alt="Minh họa hai bạn trẻ cùng khám phá câu chuyện tài chính" width={979} height={566} sizes="(max-width: 767px) 100vw, 575px" quality={95} data-home-reveal="left" />
          </div>
          <div className="ttt-home-sharing-copy">
            <h2 data-home-reveal="right">Có những chuyện về tiền, nói ra lại hiểu nhau hơn</h2>
            <p data-home-reveal="right">Những câu chuyện, góc nhìn và gợi ý nhỏ về tài chính trong tình yêu - để bạn có thêm một cách nhìn, một câu hỏi hay đơn giản là một lý do để bắt đầu trò chuyện cùng người ấy.</p>
            <ArrowLink href="/blog" reveal="up">Ghé góc chia sẻ ngay</ArrowLink>
          </div>
        </section>
        <SiteFooter embedded />
      </section>
    </div>
  );
}
