"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Detail = { publicId: string; alias: string; ageBand: string | null; region: string | null; bio: string | null; motto: string | null; interests: string[]; characterId: string; personalityCode: string; financialSimilarity: number };

export function SpeedDatingProfileDetail({ publicId }: { publicId: string }) {
  const [profile, setProfile] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passed, setPassed] = useState(false);

  useEffect(() => { void fetch(`/api/speed-dating/profiles/${publicId}`).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Không thể tải hồ sơ."); setProfile(data); }).catch((reason) => setError(reason instanceof Error ? reason.message : "Không thể tải hồ sơ.")).finally(() => setLoading(false)); }, [publicId]);

  async function pass() { const response = await fetch(`/api/speed-dating/discover/${publicId}/pass`, { method: "POST" }); if (response.ok) setPassed(true); else setError("Không thể bỏ qua hồ sơ này."); }

  if (loading) return <div className="h-96 animate-pulse rounded-[2rem] bg-[#f0e3d5]" />;
  if (error || !profile) return <div className="rounded-[2rem] border border-[#e7d7c8] bg-white p-8"><p className="text-lg font-bold text-[#49352e]">Không thể mở hồ sơ</p><p className="mt-2 text-[#806e62]">{error || "Hồ sơ không tồn tại hoặc đã được ẩn."}</p><Link href="/speed-dating/discover" className="mt-6 inline-block rounded-full bg-[#49352e] px-5 py-3 text-sm font-black text-white">Quay lại khám phá</Link></div>;

  return <article className="rounded-[2rem] border border-[#e7d7c8] bg-white p-7 shadow-[0_20px_70px_rgba(101,71,55,0.08)] sm:p-10"><div className="flex flex-wrap items-start justify-between gap-5"><div className={`grid size-24 place-items-center rounded-[2rem] text-5xl ${profile.characterId.startsWith("SUN") ? "bg-[#ffe4a7] text-[#b76b36]" : "bg-[#e7dff1] text-[#766184]"}`}>{profile.characterId.startsWith("SUN") ? "☀" : "☾"}</div><div className="text-right"><p className="font-mono text-4xl font-black text-[#c85a50]">{profile.financialSimilarity}%</p><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#806e62]">tương đồng tài chính</p></div></div><h1 className="mt-8 text-4xl font-black tracking-[-0.06em] text-[#49352e]">{profile.alias}</h1><p className="mt-2 text-[#806e62]">{profile.ageBand || "18+"}{profile.region ? ` · ${profile.region}` : ""} · {profile.characterId}</p>{profile.motto ? <p className="mt-7 text-xl font-bold leading-8 text-[#49352e]">“{profile.motto}”</p> : null}{profile.bio ? <p className="mt-5 leading-8 text-[#806e62]">{profile.bio}</p> : null}<div className="mt-7 flex flex-wrap gap-2">{profile.interests.map((interest) => <span key={interest} className="rounded-full bg-[#f2f6e8] px-3 py-1.5 text-sm font-bold text-[#55734d]">{interest}</span>)}</div><p className="mt-8 rounded-2xl bg-[#fffaf1] px-5 py-4 text-sm leading-6 text-[#806e62]">Hồ sơ đang ở chế độ ẩn danh. Tính năng gửi lời chào sẽ được mở trong phase tiếp theo.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/speed-dating/discover" className="rounded-full border border-[#c99689] px-5 py-3 text-sm font-black text-[#a9433d]">Quay lại</Link><button type="button" disabled={passed} onClick={() => void pass()} className="rounded-full bg-[#49352e] px-5 py-3 text-sm font-black text-white disabled:opacity-60">{passed ? "Đã bỏ qua" : "Bỏ qua hồ sơ"}</button></div></article>;
}
