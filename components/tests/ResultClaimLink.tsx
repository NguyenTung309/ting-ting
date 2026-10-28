"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function ResultClaimLink({ code, enabled }: { code: string; enabled: boolean }) {
  const router = useRouter();
  const started = useRef(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!enabled || started.current) return;
    started.current = true;
    void fetch(`/api/results/${encodeURIComponent(code)}/claim`, { method: "POST" }).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) setMessage(body.error || "Kết quả chưa được gắn vào tài khoản.");
      else router.replace(`/ket-qua/${encodeURIComponent(code)}`);
    }).catch(() => setMessage("Chưa thể gắn kết quả vào tài khoản. Bạn tải lại trang để thử lại nhé."));
  }, [code, enabled, router]);
  if (!enabled) return null;
  return <p aria-live="polite" className="mb-4 text-xs text-[var(--muted)]">{message || "Đang liên kết lượt làm với tài khoản Google…"}</p>;
}
