"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { SITE_SOCIAL_URLS } from "@/lib/site-social";

const socialLinks = [
  { label: "Facebook", href: SITE_SOCIAL_URLS.facebook, desktopIcon: "3d827.svg", mobileIcon: "c1467.svg" },
  { label: "TikTok", href: SITE_SOCIAL_URLS.tiktok, desktopIcon: "71571.svg", mobileIcon: "0f00b.svg" },
  { label: "Threads", href: SITE_SOCIAL_URLS.threads, desktopIcon: "a704a.svg", mobileIcon: "b95b0.svg" },
] as const;

function BrandMark() {
  return (
    <span className="ttt-footer-brand-mark">
      <Image src="/figma-assets/design/3b5a8.png" alt="Tình Tính Ting Ting" width={480} height={640} quality={95} sizes="(max-width: 767px) 75px, 180px" />
    </span>
  );
}

export function SiteFooter({ embedded = false }: { embedded?: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if ((isHome || pathname.startsWith("/ve-du-an")) && !embedded) return null;

  return (
    <footer className={`ttt-site-footer ${isHome ? "is-home" : "is-standard"}${embedded ? " is-embedded" : ""}`}>
      <div className="ttt-footer-inner">
        <div className="ttt-footer-brand">
          <BrandMark />
          <p>Tính chuyện Tiền, Ting Ting chuyện Tình.</p>
        </div>

        <div className="ttt-footer-contact">
          <h2>Liên hệ</h2>
          <a href="mailto:tinhtinhtingting.project@gmail.com">
            <span className="ttt-footer-contact-icon" aria-hidden="true">
              <Image className="ttt-footer-icon-desktop" src="/figma-assets/design/c6822.svg" alt="" width={24} height={24} />
              <Image className="ttt-footer-icon-mobile" src="/figma-assets/design/cbb8b.svg" alt="" width={16} height={16} />
            </span>
            <span>tinhtinhtingting.project@gmail.com</span>
          </a>
          <a href="tel:0358903263">
            <span className="ttt-footer-contact-icon" aria-hidden="true">
              <Image className="ttt-footer-icon-desktop" src="/figma-assets/design/82dac.svg" alt="" width={24} height={24} />
              <Image className="ttt-footer-icon-mobile" src="/figma-assets/design/5b57e.svg" alt="" width={16} height={16} />
            </span>
            <span>0358903263 - 0936376143 </span>
          </a>
          <div className="ttt-social-icons" aria-label="Mạng xã hội">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} aria-label={link.label} target="_blank" rel="noopener noreferrer">
                <Image className="ttt-footer-social-desktop" src={`/figma-assets/design/${link.desktopIcon}`} alt="" width={36} height={36} />
                <Image className="ttt-footer-social-mobile" src={`/figma-assets/design/${link.mobileIcon}`} alt="" width={24} height={24} />
              </a>
            ))}
          </div>
          <div className="ttt-footer-credits">
            <h2>Credit</h2>
            <p>Dev: Vũ Huyền</p>
            <p>UI Design: Thanh Xuân <a href="https://www.behance.net/xuanthanh1106" target="_blank" rel="noopener noreferrer">https://www.behance.net/xuanthanh1106</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
