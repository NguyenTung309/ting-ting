"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "G-XN7ERYXNF9";

declare global {
  interface Window {
    dataLayer: IArguments[];
    gtag?: (...args: unknown[]) => void;
  }
}

function GoogleAnalyticsPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !window.gtag) return;

    // Avoid sending unique result codes as analytics dimensions.
    const pagePath = pathname.replace(/^\/(ket-qua|result)\/[^/]+\/?$/, "/$1/:code");
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: `${window.location.origin}${pagePath}`,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}

export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  const initScript = `
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments);};
    window.gtag("js", new Date());
    window.gtag("config", ${JSON.stringify(GA_ID)}, { send_page_view: false });
  `;

  return (
    <>
      <Script id="google-analytics-init" strategy="afterInteractive">
        {initScript}
      </Script>
      <Script
        id="google-analytics-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
        strategy="afterInteractive"
      />
      <GoogleAnalyticsPageView />
    </>
  );
}
