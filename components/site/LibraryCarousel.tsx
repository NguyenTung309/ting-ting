"use client";

import Image from "next/image";
import { useState } from "react";

const slides = [
  { src: "/figma-assets/design/dca23.png", alt: "Tình Tính Ting Ting cùng những câu chuyện tình và tiền" },
  { src: "/figma-assets/design/d0c97.png", alt: "Chú heo hồng giữa những đồng xu" },
  { src: "/figma-assets/design/66abf.png", alt: "Hai người cùng khám phá chuyện tài chính" },
];

export function LibraryCarousel() {
  const [active, setActive] = useState(0);
  const move = (step: number) => setActive((index) => (index + step + slides.length) % slides.length);
  return <div className="figma-blog-carousel" aria-roledescription="carousel" aria-label="Thư viện hình ảnh">
    <button type="button" className="figma-blog-carousel-arrow is-previous" onClick={() => move(-1)} aria-label="Ảnh trước">←</button>
    <div className="figma-blog-carousel-image">
      <Image src={slides[active].src} alt={slides[active].alt} fill sizes="(max-width: 767px) calc(100vw - 36px), 1080px" priority />
    </div>
    <button type="button" className="figma-blog-carousel-arrow is-next" onClick={() => move(1)} aria-label="Ảnh tiếp theo">→</button>
    <div className="figma-blog-carousel-dots" aria-label="Chọn ảnh">
      {slides.map((slide, index) => <button key={slide.src} type="button" aria-label={`Ảnh ${index + 1}`} aria-current={active === index ? "true" : undefined} onClick={() => setActive(index)} />)}
    </div>
  </div>;
}
