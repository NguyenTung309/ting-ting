import type { Metadata } from "next";

const productionSiteUrl = "https://tinhtinhtingting.com";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const fallbackSiteUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : productionSiteUrl;

export const SITE_URL = new URL(configuredSiteUrl || fallbackSiteUrl);
export const DEFAULT_SOCIAL_IMAGE = "/figma-assets/design/dca23.png";

export function canonicalUrl(path: string, override?: string): string {
  const safePath = path.startsWith("/") ? path : "/" + path;
  const fallbackUrl = new URL(safePath, SITE_URL);
  const fallback = safePath === "/" ? SITE_URL.origin : fallbackUrl.href;

  if (!override?.trim()) return fallback;

  try {
    const candidate = new URL(override, SITE_URL);
    if (candidate.origin !== SITE_URL.origin || candidate.search || candidate.hash) return fallback;
    return candidate.pathname === "/" ? candidate.origin : candidate.href;
  } catch {
    return fallback;
  }
}

export function absoluteUrl(value: string): string {
  return new URL(value, SITE_URL).href;
}

type SiteMetadataOptions = {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  canonicalOverride?: string;
  indexable?: boolean;
  type?: "website" | "article";
};

export function siteMetadata(options: SiteMetadataOptions): Metadata {
  const indexable = options.indexable !== false;
  const canonical = canonicalUrl(options.path, options.canonicalOverride);
  const image = absoluteUrl(options.image || DEFAULT_SOCIAL_IMAGE);

  return {
    title: options.title,
    description: options.description,
    ...(options.keywords?.length ? { keywords: options.keywords } : {}),
    robots: { index: indexable, follow: true },
    ...(indexable ? { alternates: { canonical } } : {}),
    openGraph: {
      type: options.type || "website",
      locale: "vi_VN",
      siteName: "Tình Tính Ting Ting",
      title: options.title,
      description: options.description,
      url: canonical,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [image],
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
