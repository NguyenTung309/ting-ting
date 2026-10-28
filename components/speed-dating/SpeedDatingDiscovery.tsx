"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

type DiscoveryProfile = { publicId: string; alias: string; ageBand: string | null; region: string | null; bio: string | null; motto: string | null; interests: string[]; characterId: string; personalityCode: string; financialSimilarity: number };
type Batch = { batchId: string; generatedAt: string; profiles: DiscoveryProfile[] };

function CharacterMark({ characterId }: { characterId: string }) {
  const sun = characterId.startsWith("SUN");
  return <div className={`grid size-20 place-items-center rounded-[1.7rem] text-4xl shadow-inner ${sun ? "bg-[#ffe4a7] text-[#b76b36]" : "bg-[#e7dff1] text-[#766184]"}`} aria-label={sun ? "Nhân vật Sun" : "Nhân vật Moon"}>{sun ? "☀" : "☾"}</div>;
}

export function SpeedDatingDiscovery() {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/speed-dating/discover", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể tải gợi ý.");
      setBatch(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tải gợi ý.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);

  async function pass(profile: DiscoveryProfile) {
    const response = await fetch(`/api/speed-dating/discover/${profile.publicId}/pass`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ batchId: batch?.batchId }) });
    if (response.ok) {
      setBatch((current) => current ? { ...current, profiles: current.profiles.filter((item) => item.publicId !== profile.publicId) } : current);
      setNotice("Đã bỏ qua hồ sơ này. Gợi ý sẽ được làm mới ở lần khám phá tiếp theo.");
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Không thể bỏ qua hồ sơ.");
    }
  }

  if (loading) return <div className="grid gap-5 md:grid-cols-3" aria-busy="true">{[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-[2rem] bg-[#f0e3d5]" />)}</div>;
  if (error) return <div className="rounded-[2rem] border border-[#e7d7c8] bg-white p-8"><p className="text-lg font-bold text-[#49352e]">Chưa thể mở gợi ý</p><p className="mt-2 leading-7 text-[#806e62]">{error}</p><button type="button" onClick={() => void load()} className="mt-6 rounded-full bg-[#49352e] px-5 py-3 text-sm font-black text-white">Thử lại</button></div>;
  if (!batch?.profiles.length) return <div className="rounded-[2rem] border border-dashed border-[#d6c2b1] bg-[#fffaf1] p-8 text-center"><p className="text-2xl font-black tracking-[-0.04em] text-[#49352e]">Chưa có hồ sơ mới</p><p className="mx-auto mt-3 max-w-md leading-7 text-[#806e62]">Bạn đã xem hết nhóm gợi ý hiện tại, hoặc chưa có người cùng tham gia. Hãy quay lại sau nhé.</p><button type="button" onClick={() => void load()} className="mt-6 rounded-full border border-[#c85a50] px-5 py-3 text-sm font-black text-[#c85a50]">Làm mới</button></div>;

  return <div><div className="grid gap-5 md:grid-cols-3">{batch.profiles.map((profile) => <motion.article key={profile.publicId} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.16} onDragEnd={(_, info) => { if (info.offset.x < -120) void pass(profile); else if (info.offset.x > 120) setNotice("Lời chào sẽ mở ở phase tiếp theo — hiện bạn có thể xem hồ sơ trước."); }} className="rounded-[2rem] border border-[#e7d7c8] bg-white p-6 shadow-[0_20px_70px_rgba(101,71,55,0.08)]"><div className="flex items-start justify-between gap-3"><CharacterMark characterId={profile.characterId} /><span className="rounded-full bg-[#f7efe5] px-3 py-1 text-xs font-black text-[#806e62]">{profile.characterId}</span></div><h2 className="mt-6 text-2xl font-black tracking-[-0.05em] text-[#49352e]">{profile.alias}</h2><p className="mt-2 text-sm text-[#806e62]">{profile.ageBand || "18+"}{profile.region ? ` · ${profile.region}` : ""}</p><p className="mt-5 font-mono text-4xl font-black text-[#c85a50]">{profile.financialSimilarity}%</p><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#806e62]">tương đồng tài chính</p>{profile.motto ? <p className="mt-5 border-l-2 border-[#e7d7c8] pl-3 text-sm italic leading-6 text-[#806e62]">“{profile.motto}”</p> : null}<div className="mt-5 flex flex-wrap gap-2">{profile.interests.slice(0, 4).map((interest) => <span key={interest} className="rounded-full bg-[#f2f6e8] px-3 py-1 text-xs font-bold text-[#55734d]">{interest}</span>)}</div><div className="mt-7 grid grid-cols-2 gap-2"><button type="button" onClick={() => void pass(profile)} className="rounded-full border border-[#c99689] px-3 py-3 text-sm font-black text-[#a9433d]">Bỏ qua</button><Link href={`/speed-dating/profile/${profile.publicId}`} className="rounded-full bg-[#49352e] px-3 py-3 text-center text-sm font-black text-white">Xem hồ sơ</Link></div><button type="button" disabled className="mt-2 w-full rounded-full border border-[#e7d7c8] px-3 py-3 text-sm font-black text-[#806e62] opacity-55">Gửi lời chào · sắp ra mắt</button></motion.article>)}</div>{notice ? <p className="mt-5 rounded-2xl bg-[#f2f6e8] px-4 py-3 text-sm text-[#55734d]">{notice}</p> : null}</div>;
}
