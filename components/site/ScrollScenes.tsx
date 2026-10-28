"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type RevertibleContext = { revert: () => void };

export function ScrollScenes() {
  const pathname = usePathname();

  useEffect(() => {
    const hasHeroArrow = pathname === "/" || pathname === "/ve-du-an" || pathname === "/kho-tang-tinh-cach";
    const root = document.documentElement;
    root.removeAttribute("data-hero-arrow-hidden");
    if (!hasHeroArrow) return;

    let hidden = false;
    const hideArrowAfterScroll = () => {
      if (hidden || window.scrollY <= 8) return;
      hidden = true;
      root.setAttribute("data-hero-arrow-hidden", "true");
      window.removeEventListener("scroll", hideArrowAfterScroll);
    };

    window.addEventListener("scroll", hideArrowAfterScroll, { passive: true });
    hideArrowAfterScroll();

    return () => {
      window.removeEventListener("scroll", hideArrowAfterScroll);
      root.removeAttribute("data-hero-arrow-hidden");
    };
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    let context: RevertibleContext | undefined;

    async function createScrollScenes() {
      const hasScrollScenes = ["/", "/ve-du-an", "/tuong-thich-doi", "/kho-tang-tinh-cach"].includes(pathname);
      if (!hasScrollScenes) return;

      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      context = media;
      media.add({
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 768px)",
      }, (mediaContext) => {
        if (!mediaContext.conditions?.motion) return;

        const scrollReveal = (selector: string) => {
          if (!document.querySelector(selector)) return;

          gsap.fromTo(
            selector,
            { opacity: 0.72 },
            {
              opacity: 1,
              clearProps: "opacity",
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: {
                trigger: selector,
                start: "top 86%",
                once: true,
                invalidateOnRefresh: true,
              },
            },
          );
        };

        if (pathname === "/") {
          const homeSections = gsap.utils.toArray<HTMLElement>("[data-home-section]");
          homeSections.forEach((section) => {
            const elements = gsap.utils.toArray<HTMLElement>("[data-home-reveal]", section);
            elements.forEach((element) => {
              const direction = element.dataset.homeReveal;
              const from = direction === "left"
                ? { x: -42, y: 0 }
                : direction === "right"
                  ? { x: 42, y: 0 }
                  : { x: 0, y: 30 };

              gsap.fromTo(
                element,
                { ...from, autoAlpha: 0 },
                {
                  x: 0,
                  y: 0,
                  autoAlpha: 1,
                  clearProps: "transform,opacity,visibility",
                  duration: 0.72,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: element,
                    start: "top 88%",
                    once: true,
                    invalidateOnRefresh: true,
                  },
                },
              );
            });
          });

          if (mediaContext.conditions?.desktop) {
            [
              ".ttt-home-about-composite",
              ".ttt-home-test-composite",
              ".ttt-home-sharing-art",
            ].forEach((selector, index) => {
              const target = document.querySelector<HTMLElement>(selector);
              if (!target) return;
              gsap.fromTo(target,
                { y: index === 1 ? 18 : -18 },
                {
                  y: index === 1 ? -18 : 18,
                  ease: "none",
                  scrollTrigger: {
                    trigger: target.parentElement ?? target,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.7,
                    invalidateOnRefresh: true,
                  },
                },
              );
            });

            gsap.utils.toArray<HTMLElement>(".ttt-home-pairing-orb.desktop").forEach((orb, index) => {
              gsap.fromTo(orb,
                { y: index % 2 === 0 ? -16 : 16 },
                {
                  y: index % 2 === 0 ? 16 : -16,
                  ease: "none",
                  scrollTrigger: {
                    trigger: ".ttt-home-pairing",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.8,
                  },
                },
              );
            });
          }
        }

        if (pathname === "/ve-du-an") {
          const aboutSections = gsap.utils.toArray<HTMLElement>("[data-about-section]");
          const directions = ["left", "right", "up"] as const;

          aboutSections.forEach((section) => {
            gsap.fromTo(
              section,
              { opacity: 0.72 },
              {
                opacity: 1,
                clearProps: "opacity",
                duration: 0.9,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: section,
                  start: "top 82%",
                  once: true,
                  invalidateOnRefresh: true,
                },
              },
            );

            directions.forEach((direction) => {
              const elements = gsap.utils.toArray<HTMLElement>(`[data-about-reveal="${direction}"]`, section);
              if (!elements.length) return;

              const from = direction === "left"
                ? { x: -36, y: 0 }
                : direction === "right"
                  ? { x: 36, y: 0 }
                  : { x: 0, y: 24 };

              gsap.fromTo(
                elements,
                { ...from, autoAlpha: 0 },
                {
                  x: 0,
                  y: 0,
                  autoAlpha: 1,
                  clearProps: "opacity,visibility",
                  duration: 0.72,
                  ease: "power3.out",
                  stagger: 0.12,
                  scrollTrigger: {
                    trigger: section,
                    start: "top 78%",
                    once: true,
                    invalidateOnRefresh: true,
                  },
                },
              );
            });
          });
        }

        if (pathname === "/tuong-thich-doi") {
          scrollReveal(".ttt-coming-copy");
        }

        if (pathname === "/kho-tang-tinh-cach") {
          scrollReveal(".ttt-library-intro");
          scrollReveal(".ttt-library-controls");
          scrollReveal(".ttt-library-grid");
        }

      });

      ScrollTrigger.refresh();
      void document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    }

    void createScrollScenes();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, [pathname]);

  return null;
}
