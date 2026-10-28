"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navigation = [
  { href: "/", label: "Trang chủ", key: "home" },
  { href: "/ve-du-an", label: "Về dự án", key: "about" },
  { href: "/test-xu-huong-tai-chinh", label: "Test xu hướng", key: "test" },
  { href: "/tuong-thich-doi", label: "Ghép Ting", key: "pairing" },
  { href: "/card", label: "Card game", key: "card" },
  { href: "/kho-tang-tinh-cach", label: "Kho xu hướng", key: "library" },
  {
    href: "/blog",
    label: "Góc chia sẻ",
    key: "sharing",
    children: [
      { href: "/blog#thu-vien", label: "Thư viện hình ảnh" },
      { href: "/blog#bai-noi-bat", label: "Bài nổi bật" },
      { href: "/blog#bai-viet", label: "Tất cả bài viết" },
    ],
  },
];

function routeKey(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/ve-du-an") || pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/test-xu-huong-tai-chinh") || pathname === "/test" || pathname.startsWith("/ket-qua")) return "test";
  if (pathname.startsWith("/tuong-thich-doi") || pathname.startsWith("/compatibility")) return "pairing";
  if (pathname.startsWith("/card")) return "card";
  if (pathname.startsWith("/kho-tang-tinh-cach")) return "library";
  if (pathname.startsWith("/blog")) return "sharing";
  return "";
}

function BrandMark() {
  return (
    <span className="ttt-brand-mark">
      <Image
        src="/figma-assets/design/3b5a8.png"
        alt="Tình Tính Ting Ting"
        width={480}
        height={640}
        priority quality={95} />
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const activeKey = routeKey(pathname);
  useEffect(() => { headerRef.current?.setAttribute("data-hydrated", "true"); }, []);
  const closeMobileNavigation = () => {
    setOpen(false);
    setOpenMobileGroup(null);
  };

  return (
    <header ref={headerRef} className="ttt-site-header is-home">
      <div className="ttt-nav-bar">
        <div className="ttt-mobile-nav">
          <button
            type="button"
            className="ttt-mobile-icon-button"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => {
              setOpen((value) => !value);
              setOpenMobileGroup(null);
            }}
          >
            <Image src="/figma-assets/design/8a5f6.svg" alt="" width={24} height={24} />
          </button>
          <Link href="/" aria-label="Tình Tính Ting Ting — Trang chủ" onClick={closeMobileNavigation}>
            <BrandMark />
          </Link>
          <Link className="ttt-mobile-search-link" href="/kho-tang-tinh-cach#library-controls" aria-label="Tìm xu hướng" onClick={closeMobileNavigation}>
            <Image src="/figma-assets/design/920f8.svg" alt="" width={17} height={24} />
          </Link>
        </div>

        <div className="ttt-desktop-nav-wrap">
          <nav aria-label="Điều hướng chính" className="ttt-desktop-nav">
            <Link href="/" aria-label="Tình Tính Ting Ting — Trang chủ">
              <BrandMark />
            </Link>
            {navigation.map((item) => {
              const active = activeKey === item.key;
              if ("children" in item) {
                const expanded = openDropdown === item.key;
                return (
                  <div
                    key={item.href}
                    className={`ttt-nav-dropdown${expanded ? " is-open" : ""}`}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenDropdown(null);
                    }}
                  >
                    <Link href={item.href} aria-current={active ? "page" : undefined} className={active ? "is-active" : ""}>
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      className="ttt-nav-dropdown-toggle"
                      aria-label={`${expanded ? "Đóng" : "Mở"} menu ${item.label}`}
                      aria-haspopup="true"
                      aria-expanded={expanded}
                      aria-controls={`desktop-menu-${item.key}`}
                      onClick={() => setOpenDropdown(expanded ? null : item.key)}
                    >
                      <span aria-hidden="true" />
                    </button>
                    <div id={`desktop-menu-${item.key}`} className="ttt-nav-dropdown-menu" role="menu">
                      {item.children?.map((child) => (
                        <Link key={child.href} href={child.href} role="menuitem" onClick={() => setOpenDropdown(null)}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={active ? "is-active" : ""}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {open ? (
        <nav id="mobile-navigation" aria-label="Điều hướng di động" className="ttt-mobile-drawer">
          {navigation.map((item) => {
            const active = activeKey === item.key;
            if ("children" in item) {
              const expanded = openMobileGroup === item.key;
              return (
                <div key={item.href} className="ttt-mobile-nav-group">
                  <div className="ttt-mobile-nav-group-heading">
                    <Link href={item.href} onClick={closeMobileNavigation} aria-current={active ? "page" : undefined}>
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      aria-label={`${expanded ? "Đóng" : "Mở"} menu ${item.label}`}
                      aria-expanded={expanded}
                      aria-controls={`mobile-menu-${item.key}`}
                      onClick={() => setOpenMobileGroup(expanded ? null : item.key)}
                    >
                      <span aria-hidden="true" />
                    </button>
                  </div>
                  <div id={`mobile-menu-${item.key}`} className="ttt-mobile-nav-submenu" hidden={!expanded}>
                    {item.children?.map((child) => (
                      <Link key={child.href} href={child.href} onClick={closeMobileNavigation}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <Link key={item.href} href={item.href} onClick={closeMobileNavigation} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
