import Link from "next/link";

import type { PublicSiteSettings } from "@/lib/site-settings";

type CharacterVisualProps = {
  title: string;
  icon: string;
  characterAsset?: string;
  imageChoice?: "SUN" | "MOON";
};

function isImageAsset(asset: string | undefined) {
  return Boolean(asset && /^(https?:\/\/|\/|data:image\/)/i.test(asset));
}

export function CharacterVisual({ title, icon, characterAsset, imageChoice }: CharacterVisualProps) {
  const label = imageChoice === "SUN" ? "Nhân vật Sun" : imageChoice === "MOON" ? "Nhân vật Moon" : "Nhân vật kết quả";

  return (
    <div className="grid size-[min(68vw,22rem)] place-items-center rounded-[3.5rem] bg-white/80 p-8 shadow-[0_26px_70px_rgba(126,60,53,0.12)] ring-1 ring-[#ead0bd] sm:size-[min(42vw,26rem)]" aria-label={`${label}: ${title}`}>
      {isImageAsset(characterAsset) ? (
        // CMS assets are intentionally allowed to be absolute URLs, local paths, or data URLs.
        <span role="img" aria-label={label} className="size-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url("${characterAsset}")` }} />
      ) : (
        <span className="text-[clamp(5rem,14vw,10rem)] leading-none text-[var(--accent)]" aria-hidden="true">{characterAsset || icon}</span>
      )}
    </div>
  );
}

export function ResultHero({ title, icon, characterAsset, imageChoice }: CharacterVisualProps) {
  return (
    <section data-testid="result-hero" className="flex min-h-[calc(100svh-76px)] scroll-mt-24 flex-col items-center justify-center gap-8 rounded-[2.5rem] bg-[#fff0ea] px-5 py-14 text-center sm:gap-10 sm:px-10">
      <CharacterVisual title={title} icon={icon} characterAsset={characterAsset} imageChoice={imageChoice} />
      <h1 className="max-w-3xl text-balance text-5xl font-black tracking-[-0.08em] text-[var(--ink)] sm:text-7xl">{title}</h1>
    </section>
  );
}

function JourneyCard({ title, description, ctaLabel, href, tone }: { title: string; description: string; ctaLabel: string; href: string; tone: "coral" | "green" }) {
  return (
    <article className={`rounded-[2rem] p-6 sm:p-8 ${tone === "coral" ? "bg-[#fff0ea]" : "bg-[#e5efd2]"}`}>
      <p className={`text-xs font-black uppercase tracking-[0.18em] ${tone === "coral" ? "text-[var(--accent)]" : "text-[#658055]"}`}>Bước tiếp theo</p>
      <h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-[var(--ink)]">{title}</h2>
      <p className="mt-3 leading-7 text-[var(--muted)]">{description}</p>
      <Link href={href} className={`mt-6 inline-flex min-h-11 items-center rounded-full px-5 py-3 text-sm font-black text-white ${tone === "coral" ? "bg-[var(--accent)] hover:bg-[#a9433d]" : "bg-[#55734d] hover:bg-[#466040]"}`}>{ctaLabel} <span className="ml-2" aria-hidden="true">→</span></Link>
    </article>
  );
}

export function ResultJourneyCards({ settings }: { settings: PublicSiteSettings }) {
  return (
    <section data-testid="result-journey" className="grid gap-4 md:grid-cols-1">
      <JourneyCard {...settings.resultJourney.compare} href="/tuong-thich-doi" tone="coral" />
    </section>
  );
}
