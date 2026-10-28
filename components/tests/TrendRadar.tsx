type TrendRadarProps = {
  scoresA: Record<string, number>;
  scoresB?: Record<string, number>;
  label?: string;
};

const dimensions = [
  { key: "security", label: "An tâm" },
  { key: "experience", label: "Trải nghiệm" },
  { key: "avoidance", label: "Mở lời" },
  { key: "control", label: "La bàn" },
  { key: "independence", label: "Tự chủ" },
];

function polygonPoints(values: Record<string, number>, center: number, radius: number) {
  return dimensions.map((dimension, index) => {
    const angle = -Math.PI / 2 + (index / dimensions.length) * Math.PI * 2;
    const distance = radius * Math.max(0.08, Math.min(100, values[dimension.key] ?? 0) / 100);
    return [center + Math.cos(angle) * distance, center + Math.sin(angle) * distance].join(",");
  }).join(" ");
}

export function TrendRadar({ scoresA, scoresB, label = "Biểu đồ 5 xu hướng" }: TrendRadarProps) {
  const center = 180;
  const radius = 116;
  const outline = (level: number) => dimensions.map((_, index) => {
    const angle = -Math.PI / 2 + (index / dimensions.length) * Math.PI * 2;
    return [center + Math.cos(angle) * radius * level, center + Math.sin(angle) * radius * level].join(",");
  }).join(" ");

  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[#fffaf0] p-4 sm:p-7">
      <svg viewBox="0 0 360 360" className="mx-auto block w-full max-w-[390px]" role="img" aria-label={label}>
        {[0.25, 0.5, 0.75, 1].map((level) => <polygon key={level} points={outline(level)} fill="none" stroke="#e5cdb7" strokeWidth="1" />)}
        {dimensions.map((dimension, index) => {
          const angle = -Math.PI / 2 + (index / dimensions.length) * Math.PI * 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          const labelX = center + Math.cos(angle) * radius * 1.18;
          const labelY = center + Math.sin(angle) * radius * 1.18;
          return <g key={dimension.key}><line x1={center} y1={center} x2={x} y2={y} stroke="#ecdccc" strokeWidth="1" /><text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fill="#806e62" fontSize="10" fontWeight="600">{dimension.label}</text></g>;
        })}
        {scoresB ? <polygon points={polygonPoints(scoresB, center, radius)} fill="#658055" fillOpacity="0.12" stroke="#658055" strokeWidth="2.5" strokeDasharray="6 4" /> : null}
        <polygon points={polygonPoints(scoresA, center, radius)} fill="#c85a50" fillOpacity="0.16" stroke="#c85a50" strokeWidth="2.5" />
      </svg>
      {scoresB ? <div className="mt-2 flex justify-center gap-4 text-xs font-semibold text-[var(--muted)]"><span><i className="mr-1 inline-block size-2 rounded-full bg-[var(--accent)]" />Người thứ nhất</span><span><i className="mr-1 inline-block size-2 rounded-full bg-[#658055]" />Người thứ hai</span></div> : null}
      <p className="mt-3 text-center text-xs leading-5 text-[var(--muted)]">Điểm được chuẩn hóa theo 5 nhóm xu hướng trong bài test.</p>
    </div>
  );
}
