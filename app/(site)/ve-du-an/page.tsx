import Image from "next/image";
import Link from "next/link";
import { siteMetadata } from "@/lib/seo";
import { ResponsiveFigmaArt } from "@/components/site/ResponsiveFigmaArt";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata = siteMetadata({
  path: "/ve-du-an",
  title: "Về dự án",
  description: "Tình Tính Ting Ting — một chiến dịch truyền thông tích cực về tài chính cặp đôi.",
});

const values = [
  { icon: "9c805.svg", mobileIcon: "9588b.svg", title: "Tôn trọng", text: "Tôn trọng hoàn cảnh, lựa chọn, quyền riêng tư và ranh giới tài chính của mỗi người." },
  { icon: "6b0fc.svg", mobileIcon: "5b6b7.svg", title: "Thấu hiểu", text: "Tìm hiểu suy nghĩ, kỳ vọng và ý nghĩa phía sau mỗi quan điểm tài chính." },
  { icon: "f4b5d.svg", mobileIcon: "6a240.svg", title: "Thương lượng", text: "Xem khác biệt là điều có thể trao đổi và cùng tìm cách phù hợp với cả hai." },
  { icon: "f6949.svg", mobileIcon: "778bc.svg", title: "Tương tác tích cực", text: "Khuyến khích cả hai được nói, được lắng nghe và cùng tham gia." },
];

const journey = [
  { number: "1", title: "Tính sao tình", text: "Gợi mở vấn đề – Khơi gợi chia sẻ: Giúp Gen Z nhận ra những câu chuyện và vấn đề tài chính quen thuộc trong tình yêu." },
  { number: "2", title: "Tính rồi tính", text: "Thấu hiểu bản thân – Trang bị công cụ: Hiểu mình, hiểu những khác biệt của người bên cạnh, cùng suy ngẫm và tăng cường đối thoại qua các giải pháp của dự án." },
  { number: "3", title: "Tính cho “tình”", text: "Trải nghiệm thực tế – Kết nối tích cực: Cùng trải nghiệm và tương tác trong những tình huống tài chính theo cách tích cực hơn." },
];

export default function AboutPage() {
  return (
    <div className="ttt-about-page">
      <div className="ttt-about-hero-wrap" data-about-section>
        <section className="ttt-about-hero">
          <Image className="ttt-about-hero-bg" src="/figma-assets/design/70e7d.svg" alt="" fill sizes="100vw" priority />
          <Image className="ttt-about-hero-ellipse" src="/figma-assets/design/175be.svg" alt="" width={940} height={940} priority />
          <Image className="ttt-about-hero-hand left" src="/figma-assets/design/1b8b1.png" alt="" width={4096} height={2048} quality={95} sizes="(max-width: 767px) 36vw, 1072px" />
          <Image className="ttt-about-hero-hand right" src="/figma-assets/design/1b8b1.png" alt="" width={4096} height={2048} quality={95} sizes="(max-width: 767px) 36vw, 1072px" />
          <Image className="ttt-about-mobile-bg first" src="/figma-assets/design/abf45.png" alt="" width={4724} height={2362} sizes="699px" quality={95} />
          <Image className="ttt-about-mobile-bg second" src="/figma-assets/design/abf45.png" alt="" width={4724} height={2362} sizes="699px" quality={95} />
          <Image className="ttt-about-mobile-hands" src="/figma-assets/design/1b8b1.png" alt="" width={4096} height={2048} sizes="540px" quality={95} />
          <Image className="ttt-about-mobile-ellipse" src="/figma-assets/design/120d0.svg" alt="" width={448} height={75} />
          <div className="ttt-about-hero-copy">
            <h1 data-about-reveal="up">Tổng quan dự án</h1>
            <p data-about-reveal="up">Tình Tính “Ting Ting” là chiến dịch truyền thông dành cho Gen Z, tập trung vào việc tăng cường nhận thức và tương tác tích cực về tài chính cặp đôi, giúp người trẻ thêm hiểu nhau và xây dựng mối quan hệ bền vững theo cách hài hước, hiện đại và văn minh.</p>
            <span className="ttt-slogan" data-about-reveal="up">Tính chuyện Tiền, Ting Ting chuyện Tình.</span>
          </div>
          <Image className="ttt-about-wave" src="/figma-assets/design/about-wave-cream.svg" alt="" width={1595} height={145} />
        </section>
        <a href="#cau-chuyen" className="ttt-about-arrow" aria-label="Xem nội dung tiếp theo">
          <Image className="ttt-down-arrow-icon desktop" src="/figma-assets/design/9986b.svg" alt="" width={38} height={21} />
          <Image className="ttt-down-arrow-icon mobile" src="/figma-assets/design/493c1.svg" alt="" width={28} height={16} />
        </a>
      </div>

      <section className="ttt-about-intro" id="cau-chuyen" data-about-section>
        <div className="ttt-about-copy">
          <h2 data-about-reveal="left">Hiểu chuyện tiền, để hiểu nhau hơn trong chuyện tình.</h2>
          <p data-about-reveal="left">Chuyện tiền bạc vẫn luôn hiện diện trong tình yêu theo những cách rất đời thường - từ một bữa ăn, một món quà, những khoản chi tiêu chung cho đến những dự định xa hơn của hai người.</p>
          <p data-about-reveal="left">Với Tình Tính “Ting Ting”, tài chính cặp đôi không chỉ dừng lại ở chuyện chia tiền hay quản lý chi tiêu, mà còn là một phần trong cách hai người giao tiếp với nhau - nơi mỗi người bày tỏ quan điểm, chia sẻ kỳ vọng, tôn trọng ranh giới và cùng tìm tiếng nói chung trước những khác biệt.</p>
        </div>
        <div className="ttt-about-art" aria-hidden="true" data-about-reveal="right">
          <ResponsiveFigmaArt
            className="ttt-about-art-composite"
            desktopSrc="/figma-assets/design/about-intro-desktop-cutout.png"
            mobileSrc="/figma-assets/design/about-intro-mobile-cutout.png"
            alt=""
            sizes="(max-width: 767px) 65vw, 569px"
          />
        </div>
      </section>

      <section className="ttt-about-name" data-about-section>
        <div className="ttt-about-logo-card" data-about-reveal="left">
          <ResponsiveFigmaArt
            desktopSrc="/figma-assets/design/614f5-desktop.webp"
            mobileSrc="/figma-assets/design/614f5-mobile.webp"
            alt="Logo Tình Tính Ting Ting trên nền hồng"
          />
        </div>
        <div className="ttt-about-name-copy" data-about-reveal="right">
          <h2 data-about-reveal="up">Ý nghĩa tên dự án</h2>
          <div className="ttt-name-cards">
            <article className="ttt-name-card pink" data-about-reveal="up">
              <h3>Tình</h3>
              <p>Là tình yêu và mối quan hệ - bối cảnh trung tâm của những câu chuyện mà dự án muốn kể.</p>
            </article>
            <article className="ttt-name-card mint" data-about-reveal="up">
              <h3>Tính</h3>
              <p>Vừa gợi chuyện tính toán tiền bạc, vừa là cách mỗi người suy nghĩ, cân nhắc và lựa chọn trong một mối quan hệ.</p>
            </article>
            <article className="ttt-name-card cream wide" data-about-reveal="up">
              <h3>Ting ting</h3>
              <p>Gợi âm thanh quen thuộc của giao dịch tài chính số, đồng thời là tín hiệu của một bước tiến tích cực: đã nhận ra và bắt đầu tương tác với vấn đề.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="ttt-about-values" data-about-section>
        <h2 data-about-reveal="up">Hệ giá trị cốt lõi</h2>
        <p className="ttt-about-values-intro" data-about-reveal="up"><strong>Chúng mình tin vào 4T</strong><em>Không cần “tính” giống nhau, quan trọng là biết cách “tính” cùng nhau.</em></p>
        <div className="ttt-about-values-grid">
          {values.map((value) => (
            <article key={value.title} className="ttt-value-card" data-about-reveal="up">
              <div className="ttt-value-heading">
                <Image className="desktop" src={`/figma-assets/design/${value.icon}`} alt="" width={24} height={24} />
                <Image className="mobile" src={`/figma-assets/design/${value.mobileIcon}`} alt="" width={24} height={24} />
                <h3>{value.title}</h3>
              </div>
              <p>{value.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ttt-about-timeline" data-about-section>
        <h2 data-about-reveal="up">Hành trình dự án</h2>
        <div className="ttt-about-timeline-canvas">
          <div className="ttt-about-timeline-illustration" aria-hidden="true">
            <Image className="desktop" src="/figma-assets/design/about-journey-new-desktop.png" alt="" width={2560} height={690} unoptimized />
            <Image className="mobile" src="/figma-assets/design/about-journey-new-mobile.png" alt="" width={786} height={1172} unoptimized />
          </div>
          <div className="ttt-timeline-grid">
            {journey.map((step) => (
              <article key={step.number} className="ttt-timeline-step" data-about-reveal="up">
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="ttt-about-final-scene" data-about-section>
        <section className="ttt-about-team">
          <div className="ttt-about-team-art" data-about-reveal="left"><Image src="/figma-assets/design/a185b.png" alt="Nhóm bạn trẻ minh họa cho đội ngũ thực hiện dự án" width={735} height={735} sizes="(max-width: 767px) 297px, (max-width: 1200px) 40vw, 560px" quality={95} /></div>
          <div data-about-reveal="right">
            <h2>Nhóm thực hiện</h2>
            <p className="ttt-team-subtitle">Những người đứng sau Tình Tính “Ting Ting”</p>
            <p>Tình Tính “Ting Ting” được thực hiện bởi nhóm sinh viên ngành Truyền thông Đa phương tiện – Đại học FPT, cùng tham gia vào quá trình nghiên cứu, xây dựng chiến lược, sáng tạo nội dung, sản xuất, triển khai và đánh giá chiến dịch.</p>
            <Link href="/blog" className="ttt-pill-link">Ghé góc chia sẻ <Image src="/figma-assets/design/1ed75.svg" alt="" width={15} height={14} /></Link>
          </div>
        </section>
        <SiteFooter embedded />
      </div>
    </div>
  );
}
