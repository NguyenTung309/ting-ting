"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function GsapPulse({ children, className = "" }: { children?: ReactNode; className?: string }) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let revert: (() => void) | undefined;
    void import("gsap").then(({ default: gsap }) => {
      if (cancelled || !elementRef.current) return;
      const context = gsap.context(() => {
        gsap.to(elementRef.current, { opacity: 0.56, duration: 1.05, ease: "sine.inOut", repeat: -1, yoyo: true });
      }, elementRef);
      revert = () => context.revert();
    });
    return () => { cancelled = true; revert?.(); };
  }, []);

  return <div ref={elementRef} className={className}>{children}</div>;
}
