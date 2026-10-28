import type { ReactNode } from "react";

export function ResultCard({ title, summary, score, tttCode, characterId, imageChoice, children }: { title: string; summary: string; score?: number; tttCode?: string; characterId?: string; imageChoice?: "SUN" | "MOON"; children?: ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#fbf3e5", color: "#49352e", fontFamily: "Arial" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", color: "#c85a50", fontSize: 24, fontWeight: 700, letterSpacing: 5 }}>TÌNH TÍNH TING TING</div>
        <div style={{ display: "flex", color: "#806e62", fontSize: 22 }}>Kết quả của bạn</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 700, letterSpacing: -2 }}>{title}</div>
          {imageChoice ? <div style={{ display: "flex", color: "#658055", fontSize: 22, fontWeight: 700 }}>{imageChoice}</div> : null}
        </div>
        {characterId ? <div style={{ display: "flex", color: "#77658a", fontSize: 24, fontWeight: 700, letterSpacing: 3 }}>{characterId}</div> : null}
        <div style={{ display: "flex", maxWidth: 900, color: "#806e62", fontSize: 28, lineHeight: 1.35 }}>{summary}</div>
        {typeof score === "number" ? <div style={{ display: "flex", color: "#c85a50", fontSize: 30, fontWeight: 700 }}>Điểm tương thích: {score}/100</div> : children}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "#658055", fontSize: 21 }}><span>hiểu mình, hiểu nhau</span>{tttCode ? <span>{tttCode}</span> : null}</div>
    </div>
  );
}
