import Image from "next/image";

type ResponsiveFigmaArtProps = {
  desktopSrc?: string;
  className?: string;
  alt?: string;
  mobileSrc?: string;
  sizes?: string;
};

export function ResponsiveFigmaArt({
  className,
  desktopSrc = "/figma-assets/design/94eaa-desktop.webp",
  mobileSrc = "/figma-assets/design/94eaa-mobile.webp",
  alt = "",
  sizes = "(max-width: 767px) 92vw, 50vw",
}: ResponsiveFigmaArtProps) {
  return (
    <picture className={className}>
      <source media="(max-width: 767px)" srcSet={mobileSrc} />
      <Image src={desktopSrc} alt={alt} fill sizes={sizes} unoptimized />
    </picture>
  );
}
