import { permanentRedirect } from "next/navigation";

export default async function LegacyResultPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  permanentRedirect(`/ket-qua/${encodeURIComponent(code)}`);
}
