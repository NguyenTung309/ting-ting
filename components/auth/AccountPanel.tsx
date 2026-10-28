"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Profile = { displayName?: string; email?: string; avatar?: string; status?: string };
type Result = { tttCode?: string; characterId?: string; personalityCode?: string; resultTitle?: string; submittedAt?: string; formulaVersion?: number };

export function AccountPanel({ mode = "home" }: { mode?: "home" | "profile" | "results" }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAccount = useCallback(async () => {
    if (!session?.user) return;
    setLoadingData(true);
    setMessage("");
    try {
      const [profileResponse, resultsResponse] = await Promise.all([
        fetch("/api/me/profile", { cache: "no-store" }),
        fetch("/api/me/results", { cache: "no-store" }),
      ]);
      if (!profileResponse.ok || !resultsResponse.ok) {
        setMessage("Chưa tải được dữ liệu tài khoản. Vui lòng thử lại sau.");
        return;
      }
      const [profileValue, resultsValue] = await Promise.all([profileResponse.json(), resultsResponse.json()]);
      setProfile(profileValue);
      setName(profileValue.displayName || "");
      setResults(resultsValue.results || []);
    } catch {
      setMessage("Không tải được dữ liệu tài khoản. Vui lòng thử lại sau.");
    } finally {
      setLoadingData(false);
    }
  }, [session]);

  // This effect starts asynchronous account requests; state updates follow the responses.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAccount();
  }, [loadAccount]);

  async function startSignIn() {
    if (authBusy) return;
    setMessage("");
    if (process.env.NEXT_PUBLIC_AUTH_DEMO_MODE !== "true") {
      await signIn("google", { callbackUrl: "/tai-khoan" });
      return;
    }

    setAuthBusy(true);
    try {
      const response = await signIn("demo", { redirect: false, callbackUrl: "/tai-khoan" });
      if (!response?.ok || response.error) {
        setMessage("Đăng nhập chưa thành công. Vui lòng thử lại sau.");
        return;
      }
      await update();
      const profileResponse = await fetch("/api/me/profile", { cache: "no-store" });
      if (!profileResponse.ok) {
        setMessage("Chưa xác nhận được tài khoản. Vui lòng thử lại sau.");
        return;
      }
      router.refresh();
    } catch {
      setMessage("Không kết nối được để đăng nhập. Vui lòng thử lại sau.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      });
      const value = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(value?.error || "Không thể lưu hồ sơ. Vui lòng thử lại sau.");
        return;
      }
      setProfile(value);
      setMessage("Đã lưu hồ sơ.");
    } catch {
      setMessage("Không thể lưu hồ sơ. Vui lòng thử lại sau.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return <div className="rounded-[2rem] border border-[var(--line)] bg-white p-8 text-[var(--muted)]">Đang tải tài khoản…</div>;
  }

  if (!session?.user) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-white p-8 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Tài khoản</p>
        <h2 className="mt-4 text-3xl font-bold tracking-[-0.06em] text-[var(--ink)]">Giữ lại hành trình của bạn</h2>
        <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">
          {process.env.NEXT_PUBLIC_AUTH_DEMO_MODE === "true"
            ? "Đăng nhập Demo để xem hồ sơ và những kết quả đã lưu. Hồ sơ và lịch sử kết quả được lưu trong tài khoản của bạn."
            : "Đăng nhập bằng Google để quản lý hồ sơ, claim mã TTT và xem lại những lần bạn đã làm Test."}
        </p>
        <button type="button" disabled={authBusy} onClick={() => void startSignIn()} className="mt-7 min-h-12 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60">
          {authBusy ? "Đang kết nối…" : process.env.NEXT_PUBLIC_AUTH_DEMO_MODE === "true" ? "Vào tài khoản Demo →" : "Tiếp tục với Google →"}
        </button>
        {message ? <p className="mt-4 text-sm text-[#9a3144]" role="status">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Xin chào</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[var(--ink)]">{profile?.displayName || session.user.name || "Bạn"}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{profile?.email || session.user.email}</p>
          </div>
          <button type="button" onClick={() => void signOut({ callbackUrl: "/" })} className="rounded-full border border-[#c99689] px-4 py-2 text-sm font-bold text-[var(--accent)]">Đăng xuất</button>
        </div>
        {loadingData ? <p className="mt-4 text-sm text-[var(--muted)]">Đang đồng bộ tài khoản…</p> : null}
        {message ? <p className="mt-4 text-sm text-[#9a3144]" role="status">{message}</p> : null}
      </div>

      {mode !== "results" ? (
        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Hồ sơ cá nhân</p>
          <label className="mt-5 block text-sm font-bold text-[var(--ink)]">Tên hiển thị
            <input value={name} maxLength={80} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-12 w-full max-w-lg rounded-xl border border-[var(--line)] px-4 font-normal outline-none focus:border-[var(--accent)]" />
          </label>
          <button type="button" disabled={saving || loadingData} onClick={() => void saveProfile()} className="mt-5 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60">
            {saving ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </div>
      ) : null}

      {mode !== "profile" ? (
        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Kết quả của tôi</p><h2 className="mt-3 text-2xl font-bold tracking-[-0.05em] text-[var(--ink)]">Những mã TTT đã claim</h2></div>
            <Link href="/test-xu-huong-tai-chinh" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white">Làm Test</Link>
          </div>
          <div className="mt-6 grid gap-3">
            {results.length ? results.map((result) => <Link key={result.tttCode} href={result.tttCode ? `/ket-qua/${result.tttCode}` : "#"} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#fffaf1] px-4 py-4">
              <span><span className="block font-bold text-[var(--ink)]">{result.resultTitle || result.characterId || result.personalityCode}</span><span className="mt-1 block text-xs text-[var(--muted)]">{result.submittedAt ? new Date(result.submittedAt).toLocaleDateString("vi-VN") : ""} · công thức v{result.formulaVersion || 2}</span></span>
              <span className="font-mono text-sm font-bold tracking-[0.12em] text-[var(--accent)]">{result.tttCode}</span>
            </Link>) : <p className="rounded-2xl bg-[#f7f2ec] px-4 py-4 text-sm text-[var(--muted)]">{loadingData ? "Đang tải kết quả…" : "Chưa có kết quả đã claim. Bạn có thể claim từ trang mã TTT."}</p>}
          </div>
        </div>
      ) : null}
    </div>
  );
}
