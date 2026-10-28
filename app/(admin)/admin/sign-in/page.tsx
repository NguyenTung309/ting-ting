import { GoogleSignIn } from "@/components/admin/GoogleSignIn";

export default async function AdminSignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const notAuthorized = error === "not-authorized";
  const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const adminConfigured = Boolean((process.env.ADMIN_EMAILS || "").split(",").some((email) => email.trim()));

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fe] px-5 py-12">
      <section className="w-full max-w-[440px] rounded-3xl border border-[#e7eaf3] bg-white p-8 shadow-[0_24px_80px_rgba(31,41,55,0.09)] sm:p-10">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0f3] text-2xl text-[#ff4164]">✦</div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#ff4164]">Tình Tính Ting Ting</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#1d2939]">Đăng nhập quản trị</h1>
        <p className="mt-3 text-sm leading-6 text-[#667085]">Dùng tài khoản Google được cấp quyền quản trị để tiếp tục.</p>
        {notAuthorized && (
          <div role="alert" className="mt-6 rounded-xl border border-[#fecdca] bg-[#fff6f5] px-4 py-3 text-sm leading-5 text-[#b42318]">
            Tài khoản này chưa có trong danh sách quản trị. Hãy dùng email đã được cấp quyền.
          </div>
        )}
        {!googleConfigured && <div role="status" className="mt-6 rounded-xl border border-[#fedf89] bg-[#fffaeb] px-4 py-3 text-sm leading-5 text-[#b54708]">Google OAuth chưa được cấu hình trên môi trường này.</div>}
        {!adminConfigured && <div role="status" className="mt-3 rounded-xl border border-[#fedf89] bg-[#fffaeb] px-4 py-3 text-sm leading-5 text-[#b54708]">Chưa có email quản trị. Thêm email Google vào biến môi trường `ADMIN_EMAILS`.</div>}
        <GoogleSignIn disabled={!googleConfigured || !adminConfigured} />
        <p className="mt-6 text-center text-xs leading-5 text-[#98a2b3]">Chỉ quản trị viên được chỉ định mới xem được nội dung quản lý.</p>
      </section>
    </main>
  );
}
