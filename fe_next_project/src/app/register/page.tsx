"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  //  State để lưu dữ liệu người nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [availableTime, setAvailableTime] = useState("");
  const [loading, setLoading] = useState(false);

  const subjectOptions = [
    "Toán cơ bản",
    "Toán nâng cao",
    "Olympic",
    "Luyện thi THPT",
    "SAT/GMAT",
  ];

  //  Hàm xử lý khi nhấn nút Đăng ký
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (role === "TEACHER") {
      if (!subjects.length) {
        alert("Vui lòng chọn ít nhất một môn giảng dạy.");
        return;
      }
      if (!availableTime.trim()) {
        alert("Vui lòng nhập khung giờ nhận lớp.");
        return;
      }
    }

    setLoading(true);

    try {
      await register({
        email,
        password,
        role,
        subjects: role === "TEACHER" ? subjects.join(", ") : undefined,
        availableTime: role === "TEACHER" ? availableTime : undefined,
      });
      if (role === "TEACHER") {
        alert("🎉 Đăng ký giảng viên thành công! Hãy đăng nhập tại cổng giảng viên nhé!");
        router.push("/login-teacher");
      } else {
        alert("🎉 Đăng ký thành công! Hãy đăng nhập nhé!");
        router.push("/login");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi server, vui lòng thử lại!";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (value: string) => {
    setSubjects((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-200 via-pink-100 to-orange-100 px-4 py-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 left-10 h-72 w-72 rounded-full bg-white/60 blur-[120px]" />
        <div className="absolute top-1/2 right-10 h-48 w-48 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-white/60 blur-2xl" />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl gap-8 md:grid-cols-[1.1fr_0.9fr]">
        {/* Left column: intro + role highlights */}
        <section className="rounded-3xl border border-pink-100 bg-white/90 p-8 shadow-2xl shadow-pink-200/40 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-500">
            MathBridge Account
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-gray-900 leading-tight">
            Tạo tài khoản để đồng bộ lộ trình học và quản lý lớp Toán
          </h1>
          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            Chúng tôi lưu mọi thông tin đăng ký (email, vai trò, hồ sơ giảng viên) trong cơ sở dữ liệu trung tâm để đảm bảo đăng nhập thống nhất
            giữa cổng học sinh và cổng giảng viên.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              {
                badge: "Học sinh",
                title: "Theo dõi tiến độ học",
                desc: "Nhận video, bài tập và lịch học cá nhân hoá.",
              },
              {
                badge: "Giảng viên",
                title: "Quản lý hồ sơ & phản hồi",
                desc: "Sau khi đăng ký lưu role TEACHER vào DB để bạn đăng nhập cổng giảng viên và xem feedback học viên.",
              },
            ].map((item) => (
              <div key={item.badge} className="rounded-2xl border border-pink-100 bg-pink-50/60 p-4">
                <div className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-pink-500 shadow-sm">
                  {item.badge}
                </div>
                <p className="mt-3 text-lg font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Right column: form */}
        <section className="rounded-3xl border border-white/70 bg-white p-8 text-gray-900 shadow-2xl shadow-pink-200/50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h2>
            <p className="mt-1 text-sm text-gray-500">Thông tin được bảo mật và sử dụng để phân quyền đăng nhập.</p>
          </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block mb-1 font-semibold text-black">Email</label>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 text-black font-medium placeholder:text-gray-400"
              required
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block mb-1 font-semibold text-black">Mật khẩu</label>
            <input
              type="password"
              placeholder="Tạo mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 text-black font-medium placeholder:text-gray-400"
              required
            />
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block mb-1 font-semibold text-black">Xác nhận mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 text-black font-medium placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-black">Bạn là?</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: "Học sinh / Phụ huynh", value: "STUDENT", desc: "Nhận bài học, theo dõi tiến độ" },
                { label: "Giảng viên", value: "TEACHER", desc: "Quản lý lớp, nhận feedback", accent: true },
              ].map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => {
                    setRole(option.value as "STUDENT" | "TEACHER");
                    if (option.value === "STUDENT") {
                      setSubjects([]);
                      setAvailableTime("");
                    }
                  }}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    role === option.value
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white hover:border-orange-300"
                  }`}
                >
                  <p className="font-semibold text-black">{option.label}</p>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Lựa chọn này được lưu xuống cơ sở dữ liệu để phân quyền khi đăng nhập.
            </p>
          </div>

          {role === "TEACHER" && (
            <div className="space-y-4 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-orange-700">Môn giảng dạy</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {subjectOptions.map((subject) => (
                    <label
                      key={subject}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                        subjects.includes(subject)
                          ? "border-orange-500 bg-white"
                          : "border-gray-200 bg-white/80 hover:border-orange-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={subjects.includes(subject)}
                        onChange={() => toggleSubject(subject)}
                        className="accent-orange-500"
                      />
                      <span className="text-black">{subject}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Chọn ít nhất một môn, sẽ được lưu vào hồ sơ giảng viên.
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-semibold text-orange-700">
                  Khung giờ nhận lớp
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tối 19h-21h các ngày trong tuần; Cuối tuần 8h-11h"
                  value={availableTime}
                  onChange={(e) => setAvailableTime(e.target.value)}
                  className="w-full rounded-lg border border-orange-200 px-3 py-2 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
                <p className="mt-1 text-xs text-gray-600">
                  Thông tin này lưu vào DB để admin phân lịch dạy.
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 py-2.5 font-semibold text-white shadow-lg shadow-orange-300/50 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <div className="mt-6 grid gap-3 text-center text-sm">
          <p>
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-orange-500 font-semibold hover:underline">
              Đăng nhập học sinh
            </Link>
          </p>
          <p>
            Giảng viên đã có tài khoản?{" "}
            <Link href="/login-teacher" className="text-orange-500 font-semibold hover:underline">
              Vào cổng giảng viên
            </Link>
          </p>
        </div>
        </section>
      </div>
    </div>
  );
}
