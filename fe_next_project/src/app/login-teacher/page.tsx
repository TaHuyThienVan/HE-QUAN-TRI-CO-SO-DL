"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { login, storeToken } from "@/lib/api";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const response = await login({ email: email.trim(), password });

      // Get role from response (could be in response.role or response.user.role)
      const role = (response.role || response.user?.role)?.toUpperCase();
      
      console.log('Login response:', { 
        role: role, 
        responseRole: response.role, 
        userRole: response.user?.role,
        fullResponse: response 
      });

      // Backend uses TUTOR, frontend uses TEACHER - check for both
      if (!role || (role !== "TEACHER" && role !== "TUTOR")) {
        console.error('Role check failed:', { role, expected: ['TEACHER', 'TUTOR'] });
        throw new Error("Tài khoản này không có quyền giảng viên");
      }

      storeToken(response.token);

      if (typeof window !== "undefined") {
        localStorage.setItem("teacherEmail", email.trim());
        localStorage.setItem("teacherLastLogin", new Date().toISOString());
      }

      setStatus("Đăng nhập thành công! Đang chuyển tới trung tâm giảng dạy…");
      router.push("/teacher/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#3c0d03] via-[#140301] to-black px-4 py-10 text-orange-50">
      <div className="absolute inset-0 overflow-hidden opacity-60">
        <div className="absolute -top-10 left-10 h-64 w-64 rounded-full bg-orange-400/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-pink-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-6xl flex-col gap-8 md:flex-row">
        <section className="w-full rounded-3xl border border-orange-900/30 bg-[#1c0601]/80 p-8 shadow-[0_0_60px_rgba(0,0,0,0.65)] backdrop-blur">
          <span className="text-sm uppercase tracking-[0.3em] text-orange-200/70">MathBridge Faculty</span>
          <h1 className="mt-3 text-3xl font-extrabold text-orange-200">Cổng giảng viên</h1>
          <p className="mt-3 text-sm text-orange-100/80">
            Đăng nhập một lần để truy cập hồ sơ cá nhân, lịch dạy, lớp học đang phụ trách và đặc biệt là toàn bộ phản hồi học viên từ form
            <Link href="/feedback" className="ml-1 font-semibold text-orange-300 underline-offset-4 hover:underline">
              Feedback
            </Link>
            .
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { title: "Kiểm tra phản hồi", desc: "Theo dõi mức độ hài lòng và góp ý theo thời gian thực." },
              { title: "Cập nhật hồ sơ", desc: "Điền thông tin giảng viên, lịch dạy, học vị và tài liệu giảng dạy." },
              { title: "Đồng bộ lớp", desc: "Tự động kết nối với danh sách lớp trong trang Admin." },
              { title: "Quản lý chất lượng", desc: "Phân tích các góp ý nổi bật để nâng cao trải nghiệm học." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-orange-900/40 bg-[#2a0a02]/60 p-4">
                <p className="text-sm font-semibold text-orange-300">{item.title}</p>
                <p className="mt-1 text-sm text-orange-100/70">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-sm text-orange-100/80">
            <div className="flex items-center gap-2 rounded-full border border-orange-900/50 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Bảo mật token OAuth2
            </div>
            <div className="flex items-center gap-2 rounded-full border border-orange-900/50 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-sky-400"></span>
              Đồng bộ dữ liệu thời gian thực
            </div>
          </div>
        </section>

        <section className="w-full max-w-xl rounded-3xl border border-orange-900/30 bg-white/95 p-8 text-gray-900 shadow-2xl">
          <h2 className="text-center text-xl font-bold text-orange-700">Đăng nhập giảng viên</h2>
          <p className="mt-1 text-center text-sm text-gray-500">Sử dụng tài khoản được cấp bởi quản trị hệ thống.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">Email giảng viên</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="giangvien@mathbridge.edu.vn"
                className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-orange-500/40 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Đang kiểm tra…" : "Đăng nhập"}
            </button>

            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
            {status && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</p>}
          </form>

          <div className="mt-8 space-y-3 text-center text-sm text-gray-600">
            <p>
              Quay lại{" "}
              <Link href="/login" className="font-semibold text-orange-600 hover:underline">
                trang học viên
              </Link>
            </p>
            <p>
              Cần hỗ trợ? Liên hệ{" "}
              <a href="mailto:support@mathbridge.edu.vn" className="font-semibold text-orange-600 hover:underline">
                support@mathbridge.edu.vn
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

