"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import styles from "./CardExperience.module.css";

const cardPrompts = [
  {
    topic: "MÌNH VÀ TIỀN",
    question: "Khi nghĩ đến tiền, điều gì xuất hiện trong bạn đầu tiên?",
    options: ["An toàn", "Tự do", "Áp lực", "Cơ hội", "Một điều khác"],
    followUp: "Điều gì khiến bạn có cảm giác đó?",
  },
  {
    topic: "TIỀN TRONG MẮT BẠN",
    question: "Với bạn, tiền gần với điều nào nhất?",
    options: ["Một sự an tâm", "Một sự tự do", "Một công cụ để tận hưởng", "Một trách nhiệm", "Một điều khác"],
    followUp: "Vì sao bạn lại nhìn tiền theo cách đó?",
  },
  {
    topic: "KHI CÓ THÊM",
    question: "Nếu bất ngờ có thêm một khoản tiền, bạn thường muốn làm gì trước?",
    options: ["Tiết kiệm", "Tận hưởng", "Mua thứ mình cần", "Dành cho tương lai", "Chia sẻ với người khác"],
    followUp: "Điều gì khiến bạn ưu tiên điều đó?",
  },
  {
    topic: "ĐIỀU ĐÁNG CHI",
    question: "Với bạn, một khoản tiền được xem là “đáng chi” khi nào?",
    options: ["Mang lại niềm vui", "Giải quyết một nhu cầu", "Tạo giá trị lâu dài", "Mang lại trải nghiệm", "Khiến mình thấy yên tâm"],
    followUp: "“Đáng” với bạn có nghĩa là gì?",
  },
  {
    topic: "TIẾT KIỆM",
    question: "Điều gì khiến bạn muốn tiết kiệm?",
    options: ["Để cảm thấy an toàn", "Để đạt một mục tiêu", "Để chủ động hơn", "Để chuẩn bị cho tương lai", "Chưa nghĩ nhiều về việc đó"],
    followUp: "Tiết kiệm mang lại cho bạn cảm giác gì?",
  },
  {
    topic: "CÙNG CHI TIÊU",
    question: "Khi hai người cùng chi tiền, điều gì khiến bạn cảm thấy cách chia đó công bằng?",
    options: ["Chia đều", "Chia theo khả năng", "Chia theo tình huống", "Đóng góp theo nhiều cách", "Không nhất thiết phải chia"],
    followUp: "Điều gì quan trọng hơn với bạn: con số hay cảm giác công bằng?",
  },
  {
    topic: "ĐIỀU MÌNH MUỐN",
    question: "Trước một món đồ hoặc trải nghiệm mình rất muốn có, bạn thường nghe theo điều gì?",
    options: ["Mình có thật sự cần không?", "Mình có đủ khả năng không?", "Nó có đáng không?", "Mình có vui không?", "Mình sẽ nghĩ thêm"],
    followUp: "Điều gì thường khiến bạn quyết định mua hoặc không mua?",
  },
  {
    topic: "SỰ CHỦ ĐỘNG",
    question: "Trong một mối quan hệ, điều gì khiến bạn cảm thấy mình vẫn có sự chủ động về tiền?",
    options: ["Có khoản riêng", "Được tự quyết một phần", "Nói chuyện thẳng thắn", "Không bị phán xét", "Một điều khác"],
    followUp: "“Tự do về tiền” có ý nghĩa gì với bạn?",
  },
  {
    topic: "KHÁC BIỆT",
    question: "Nếu hai người có cách nhìn rất khác về tiền, bạn muốn điều gì xảy ra trước?",
    options: ["Lắng nghe nhau", "Tìm điểm giống nhau", "Hiểu lý do của nhau", "Tìm nguyên tắc chung", "Cho nhau không gian"],
    followUp: "Điều gì giúp khác biệt trở thành một cuộc trò chuyện?",
  },
  {
    topic: "CÙNG GIỮ LẤY",
    question: "Nếu chọn một điều để hai người luôn giữ khi nói về tiền, bạn chọn gì?",
    options: ["Thành thật", "Tôn trọng", "Minh bạch", "Không phán xét", "Cùng tìm cách"],
    followUp: "Vì sao điều đó quan trọng với bạn?",
  },
] as const;

const stars = Array.from({ length: 24 }, (_, index) => ({
  left: `${(index * 43 + 7) % 100}%`,
  top: `${(index * 67 + 13) % 100}%`,
  delay: `${-((index % 8) * 0.37)}s`,
  size: `${2 + (index % 3)}px`,
}));

type SwipeDirection = "left" | "right";

export function CardExperience() {
  const [isOpening, setIsOpening] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isChangingCard, setIsChangingCard] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [history, setHistory] = useState([0]);
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null);
  const [dragX, setDragX] = useState(0);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const readerCloseRef = useRef<HTMLButtonElement>(null);
  const openingScrollYRef = useRef(0);
  const artworkRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ pointerId: number; startX: number; startY: number } | null>(null);
  const current = cardPrompts[currentCard];

  function followPointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || isOpening || isReading || !artworkRef.current || !boxRef.current) return;
    const bounds = artworkRef.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const rotateX = -8 + (0.5 - y) * 18;
    const rotateY = -22 + (x - 0.5) * 36;
    boxRef.current.style.setProperty("--pointer-rotate-x", rotateX.toFixed(1) + "deg");
    boxRef.current.style.setProperty("--pointer-rotate-y", rotateY.toFixed(1) + "deg");
  }

  function resetBox() {
    if (!boxRef.current) return;
    boxRef.current.style.setProperty("--pointer-rotate-x", "-8deg");
    boxRef.current.style.setProperty("--pointer-rotate-y", "-22deg");
  }

  function openDeck() {
    if (isOpening || isReading) return;
    openingScrollYRef.current = window.scrollY;
    resetBox();
    setIsOpening(true);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const openingDelay = reduceMotion ? 0 : 900;
    window.setTimeout(() => {
      setIsOpening(false);
      setIsReading(true);
      setCurrentCard(0);
      setHistory([0]);
      setIsFlipped(false);
      window.requestAnimationFrame(() => {
        readerCloseRef.current?.focus({ preventScroll: true });
        window.scrollTo(0, openingScrollYRef.current);
        window.setTimeout(() => setIsFlipped(true), reduceMotion ? 0 : 820);
      });
    }, openingDelay);
  }

  function finishCardChange(nextIndex: number, nextHistory: number[], direction: SwipeDirection) {
    if (isChangingCard) return;
    setIsChangingCard(true);
    setIsFlipped(false);
    setExitDirection(direction);
    window.setTimeout(() => {
      setCurrentCard(nextIndex);
      setHistory(nextHistory);
      setDragX(0);
      setExitDirection(null);
      setIsChangingCard(false);
      window.requestAnimationFrame(() => window.setTimeout(() => setIsFlipped(true), 40));
    }, 220);
  }

  function nextCard(direction: SwipeDirection) {
    const nextIndex = (currentCard + 1) % cardPrompts.length;
    finishCardChange(nextIndex, [...history, nextIndex], direction);
  }

  function previousCard() {
    if (history.length < 2 || isChangingCard) return;
    const nextHistory = history.slice(0, -1);
    finishCardChange(nextHistory[nextHistory.length - 1], nextHistory, "right");
  }

  function closeReader() {
    setIsReading(false);
    setIsOpening(false);
    setIsFlipped(false);
    setIsChangingCard(false);
    setCurrentCard(0);
    setHistory([0]);
    setExitDirection(null);
    resetBox();
    window.requestAnimationFrame(() => openButtonRef.current?.focus({ preventScroll: true }));
  }

  function startSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    if (isChangingCard || event.target instanceof HTMLElement && event.target.closest("button")) return;
    swipeRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    if (!swipeRef.current || swipeRef.current.pointerId !== event.pointerId || isChangingCard) return;
    const dx = event.clientX - swipeRef.current.startX;
    const dy = event.clientY - swipeRef.current.startY;
    if (Math.abs(dx) > Math.abs(dy)) setDragX(dx);
  }

  function endSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    if (!swipeRef.current || swipeRef.current.pointerId !== event.pointerId) return;
    const dx = event.clientX - swipeRef.current.startX;
    swipeRef.current = null;
    setDragX(0);
    if (Math.abs(dx) > 55) nextCard(dx < 0 ? "left" : "right");
  }

  return (
    <div className={styles.page}>
      <section className={`${styles.hero} ${isReading ? styles.heroReading : ""}`} aria-labelledby="card-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>BỘ THẺ TRÒ CHUYỆN · TÌNH TÍNH “TING TING”</p>
          <h1 id="card-title">Tính chuyện tiền,<br /><span>Ting Ting chuyện tình.</span></h1>
          <p className={styles.intro}>Một bộ thẻ để những chuyện về tiền trở nên dễ mở lời hơn — cùng nhau, theo cách thật tự nhiên.</p>
          <button
            ref={openButtonRef}
            className={`ttt-pill-link ${styles.openButton}`}
            type="button"
            aria-expanded={isOpening || isReading}
            aria-controls="card-reader"
            disabled={isOpening || isReading}
            onClick={openDeck}
          >
            Mở bộ bài
            <svg className="ttt-pill-arrow" viewBox="0 0 14.6805 14.0932" aria-hidden="true" fill="none">
              <path d="M7.93333 1.41324L14 7.04658L7.93333 12.6799" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="bevel" />
              <path d="M1 6.81444H13.1333" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="bevel" />
            </svg>
          </button>
        </div>

        <div
          ref={artworkRef}
          className={styles.heroArtwork}
          role="img"
          aria-label="Hộp Card Tình Tính Ting Ting giữa những hình minh họa đồng xu, hoa và nhân vật của chiến dịch."
          onPointerMove={followPointer}
          onPointerLeave={resetBox}
        >
          <span className={styles.artWash} aria-hidden="true" />
          <span className={styles.artOrbit} aria-hidden="true" />
          <Image className={styles.artCoin} src="/figma-assets/design/993c9.png" alt="" width={643} height={566} quality={95} sizes="(max-width: 767px) 22vw, 125px" />
          <Image className={styles.artFlower} src="/figma-assets/design/490b5.png" alt="" width={582} height={566} quality={95} sizes="(max-width: 767px) 15vw, 84px" />
          <Image className={styles.artStar} src="/figma-assets/design/d7ef8.png" alt="" width={582} height={566} quality={95} sizes="(max-width: 767px) 10vw, 54px" />
          <Image className={styles.character} src="/figma-assets/design/812c1.png" alt="" width={2025} height={2700} quality={95} sizes="(max-width: 767px) 40vw, 250px" />

          <div className={`${styles.boxPlacement} ${isReading ? styles.boxPlacementDim : ""}`}>
            <div className={`${styles.box} ${isOpening || isReading ? styles.boxOpened : ""}`} ref={boxRef} aria-hidden="true">
              <div className={styles.boxFront}>
                <span className={styles.boxKicker}>TÌNH TÍNH “TING TING”</span>
                <strong className={styles.boxBrand}>Tính chuyện<br />Tiền,<br /><span>Ting Ting</span><br />chuyện Tình.</strong>
                <Image className={styles.boxCoin} src="/figma-assets/design/993c9.png" alt="" width={643} height={566} />
                <span className={styles.boxCaption}>Mỗi lá bài, một câu chuyện.</span>
              </div>
              <div className={styles.boxBack}>
                <span className={styles.boxKicker}>MỞ LỜI TỪ NHỮNG ĐIỀU NHỎ</span>
                <strong className={styles.backBrand}>Để chuyện tiền<br />dễ nói hơn.</strong>
                <span className={styles.backCaption}>Lắng nghe nhau, rồi cùng tìm tiếng nói chung.</span>
              </div>
              <div className={styles.boxRight}><span className={styles.sideText}>CHOICE CARDS</span></div>
              <div className={styles.boxLeft}><span className={styles.sideText}>OPEN A CONVERSATION</span></div>
              <div className={styles.boxBottom}><span>CARD</span></div>
              <div className={`${styles.boxTopHinge} ${isOpening || isReading ? styles.boxTopHingeOpen : ""}`}>
                <div className={styles.boxTop}><span>CARD</span></div>
              </div>
            </div>
            <div className={`${styles.cardBurst} ${isOpening || isReading ? styles.cardBurstOpen : ""}`}>
              <span className={`${styles.burstCard} ${styles.burstCardOne}`} />
              <span className={`${styles.burstCard} ${styles.burstCardTwo}`} />
              <span className={`${styles.burstCard} ${styles.burstCardThree}`} />
              <span className={`${styles.burstCard} ${styles.burstCardFour}`} />
              <span className={`${styles.burstCard} ${styles.burstCardFive}`} />
            </div>
          </div>
        </div>

        {isReading && (
          <div className={styles.readerScene} id="card-reader" aria-label="Bộ bài Card">
            <div className={styles.twinkles} aria-hidden="true">
              {stars.map((star, index) => <i key={index} className={styles.twinkle} style={{ left: star.left, top: star.top, animationDelay: star.delay, width: star.size, height: star.size }} />)}
            </div>
            <button ref={readerCloseRef} className={styles.readerClose} type="button" aria-label="Đóng bộ bài" onClick={closeReader}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
            <div className={styles.readerLayout}>
              <button className={styles.readerArrow} type="button" aria-label="Lá trước" disabled={history.length < 2 || isChangingCard} onClick={previousCard}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m0 0 7-7m-7 7 7 7" /></svg>
              </button>

              <div
                className={styles.cardScene}
                role="group"
                aria-label={`Lá bài ${currentCard + 1}: ${current.topic}`}
                onPointerDown={startSwipe}
                onPointerMove={moveSwipe}
                onPointerUp={endSwipe}
                onPointerCancel={endSwipe}
              >
                <Image className={styles.cardFloatCoin} src="/figma-assets/design/993c9.png" alt="" width={643} height={566} quality={95} />
                <Image className={styles.cardFloatFlower} src="/figma-assets/design/490b5.png" alt="" width={582} height={566} quality={95} />
                <Image className={styles.cardFloatStar} src="/figma-assets/design/d7ef8.png" alt="" width={582} height={566} quality={95} />
                <div
                  className={`${styles.card} ${isFlipped ? styles.cardFlipped : ""} ${exitDirection === "left" ? styles.cardOutLeft : ""} ${exitDirection === "right" ? styles.cardOutRight : ""}`}
                  style={{
                    translate: exitDirection ? (exitDirection === "left" ? "-130% 0" : "130% 0") : `${dragX * 0.28}px 0`,
                    rotate: exitDirection ? (exitDirection === "left" ? "-10deg" : "10deg") : `${dragX * 0.025}deg`,
                  }}
                >
                  <div className={`${styles.cardFace} ${styles.cardBackFace}`} aria-hidden="true">
                    <div className={styles.cardBackFrame}>
                      <span className={styles.cardBackBrand}>Tình Tính<br /><strong>“Ting Ting”</strong></span>
                      <div className={styles.cardBackOrnament}><span>♡</span><i /><b /></div>
                      <span className={styles.cardBackFooter}>MỞ LỜI TỪ NHỮNG ĐIỀU NHỎ</span>
                    </div>
                  </div>
                  <article className={`${styles.cardFace} ${styles.cardFrontFace}`} aria-label={current.question}>
                    <div className={styles.cardFrontTop}>
                      <div className={styles.cardMasthead}>
                        <span className={styles.cardMastheadMark}><span>T<span>·</span>T</span></span>
                        <span className={styles.cardMastheadText}>CHUYỆN TIỀN · CHUYỆN TÌNH</span>
                        <i aria-hidden="true" />
                      </div>
                      <span className={styles.cardTopic}>{current.topic}</span>
                    </div>
                    <div className={styles.cardQuestionWrap}>
                      <span className={styles.cardQuote} aria-hidden="true">“</span>
                      <h2>{current.question}</h2>
                    </div>
                    <div className={styles.cardIllustration} aria-hidden="true">
                      <span className={styles.cardIllustrationHalo} />
                      <Image className={styles.cardIllustrationCoin} src="/figma-assets/design/993c9.png" alt="" width={643} height={566} quality={95} />
                      <i className={styles.cardIllustrationSparkOne} />
                      <i className={styles.cardIllustrationSparkTwo} />
                    </div>
                    <div className={styles.answerOptions} aria-label="Một vài gợi ý trả lời">
                      {current.options.map(option => <span key={option}>{option}</span>)}
                    </div>
                    <p className={styles.followUp}>{current.followUp}</p>
                    <div className={styles.cardProgress} aria-hidden="true">
                      {cardPrompts.map((_, index) => <span key={index} className={index === currentCard ? styles.progressActive : index < currentCard ? styles.progressVisited : ""} />)}
                    </div>
                  </article>
                </div>
              </div>

              <button className={styles.readerArrow} type="button" aria-label="Lá tiếp theo" disabled={isChangingCard} onClick={() => nextCard("left")}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m0 0-7-7m7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
