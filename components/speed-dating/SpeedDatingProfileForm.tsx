"use client";

import { useEffect, useState } from "react";

type ProfileForm = {
  dateOfBirth: string;
  alias: string;
  region: string;
  bio: string;
  motto: string;
  interests: string;
  minAge: string;
  maxAge: string;
  enabled: boolean;
};

const emptyForm: ProfileForm = { dateOfBirth: "", alias: "", region: "", bio: "", motto: "", interests: "", minAge: "", maxAge: "", enabled: false };

function dateValue(value: unknown) {
  return typeof value === "string" ? value.slice(0, 10) : "";
}

export function SpeedDatingProfileForm() {
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/speed-dating/profile").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể tải hồ sơ.");
      if (data.profile) {
        const profile = data.profile;
        setForm({
          dateOfBirth: dateValue(profile.dateOfBirth),
          alias: profile.alias || "",
          region: profile.region || "",
          bio: profile.bio || "",
          motto: profile.motto || "",
          interests: Array.isArray(profile.interests) ? profile.interests.join(", ") : "",
          minAge: profile.preferences?.minAge ? String(profile.preferences.minAge) : "",
          maxAge: profile.preferences?.maxAge ? String(profile.preferences.maxAge) : "",
          enabled: profile.enabled === true,
        });
      }
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Không thể tải hồ sơ.")).finally(() => setLoading(false));
  }, []);

  function update(key: keyof ProfileForm, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
    setError("");
  }

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    const payload = {
      dateOfBirth: form.dateOfBirth,
      alias: form.alias,
      region: form.region,
      bio: form.bio,
      motto: form.motto,
      interests: form.interests.split(",").map((item) => item.trim()).filter(Boolean),
      preferences: {
        ...(form.minAge ? { minAge: Number(form.minAge) } : {}),
        ...(form.maxAge ? { maxAge: Number(form.maxAge) } : {}),
      },
      enabled: form.enabled,
    };
    try {
      const response = await fetch("/api/speed-dating/profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể lưu hồ sơ.");
      setMessage(form.enabled ? "Hồ sơ đã bật. Bạn có thể bắt đầu khám phá." : "Đã lưu hồ sơ. Hồ sơ hiện đang tắt.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể lưu hồ sơ.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="rounded-[2rem] border border-[#e7d7c8] bg-white p-8 text-[#806e62]">Đang tải hồ sơ…</div>;

  return (
    <div className="rounded-[2rem] border border-[#e7d7c8] bg-white p-6 shadow-[0_20px_70px_rgba(101,71,55,0.08)] sm:p-9">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c85a50]">Hồ sơ ẩn danh</p>
      <p className="mt-3 max-w-2xl leading-7 text-[#806e62]">Ngày sinh chỉ dùng để kiểm tra 18+ và tính nhóm tuổi. Người khác không nhìn thấy ngày sinh, email hay mã nội bộ của bạn.</p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-[#49352e]">Ngày sinh<input required type="date" value={form.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[#e7d7c8] bg-[#fffaf1] px-4 font-normal" /></label>
        <label className="text-sm font-bold text-[#49352e]">Tên hiển thị<input required value={form.alias} onChange={(event) => update("alias", event.target.value)} placeholder="Ví dụ: Người thích bình yên" className="mt-2 min-h-12 w-full rounded-xl border border-[#e7d7c8] bg-[#fffaf1] px-4 font-normal" /></label>
        <label className="text-sm font-bold text-[#49352e]">Khu vực tổng quát<input value={form.region} onChange={(event) => update("region", event.target.value)} placeholder="Ví dụ: TP. Hồ Chí Minh" className="mt-2 min-h-12 w-full rounded-xl border border-[#e7d7c8] bg-[#fffaf1] px-4 font-normal" /></label>
        <label className="text-sm font-bold text-[#49352e]">Phương châm<input value={form.motto} onChange={(event) => update("motto", event.target.value)} placeholder="Một câu nói về bạn" className="mt-2 min-h-12 w-full rounded-xl border border-[#e7d7c8] bg-[#fffaf1] px-4 font-normal" /></label>
        <label className="text-sm font-bold text-[#49352e] sm:col-span-2">Giới thiệu<textarea value={form.bio} onChange={(event) => update("bio", event.target.value)} rows={4} placeholder="Bạn muốn người cùng tần số biết điều gì?" className="mt-2 w-full rounded-xl border border-[#e7d7c8] bg-[#fffaf1] px-4 py-3 font-normal" /></label>
        <label className="text-sm font-bold text-[#49352e] sm:col-span-2">Sở thích <span className="font-normal text-[#806e62]">(ngăn cách bằng dấu phẩy)</span><input value={form.interests} onChange={(event) => update("interests", event.target.value)} placeholder="cà phê, đọc sách, du lịch" className="mt-2 min-h-12 w-full rounded-xl border border-[#e7d7c8] bg-[#fffaf1] px-4 font-normal" /></label>
        <label className="text-sm font-bold text-[#49352e]">Tuổi tối thiểu<input type="number" min={18} max={100} value={form.minAge} onChange={(event) => update("minAge", event.target.value)} placeholder="18" className="mt-2 min-h-12 w-full rounded-xl border border-[#e7d7c8] bg-[#fffaf1] px-4 font-normal" /></label>
        <label className="text-sm font-bold text-[#49352e]">Tuổi tối đa<input type="number" min={18} max={100} value={form.maxAge} onChange={(event) => update("maxAge", event.target.value)} placeholder="45" className="mt-2 min-h-12 w-full rounded-xl border border-[#e7d7c8] bg-[#fffaf1] px-4 font-normal" /></label>
      </div>
      <label className="mt-7 flex items-start gap-3 text-sm font-bold text-[#49352e]"><input type="checkbox" checked={form.enabled} onChange={(event) => update("enabled", event.target.checked)} className="mt-0.5 size-5 accent-[#c85a50]" /><span><span className="block">Đang tham gia Speed Dating</span><span className="mt-1 block font-normal leading-6 text-[#806e62]">Khi bật, hồ sơ có thể xuất hiện ẩn danh trong gợi ý của người khác.</span></span></label>
      {error ? <p className="mt-5 rounded-2xl bg-[#fff0ea] px-4 py-3 text-sm text-[#a33d36]">{error}</p> : null}
      {message ? <p className="mt-5 rounded-2xl bg-[#f2f6e8] px-4 py-3 text-sm text-[#55734d]">{message}</p> : null}
      <button type="button" disabled={saving} onClick={() => void save()} className="mt-6 rounded-full bg-[#49352e] px-6 py-3 text-sm font-black text-white transition hover:bg-[#c85a50] disabled:cursor-wait disabled:opacity-60">{saving ? "Đang lưu…" : "Lưu hồ sơ"}</button>
    </div>
  );
}
