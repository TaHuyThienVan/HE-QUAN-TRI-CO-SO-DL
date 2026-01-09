"use client";

import React, { useState } from "react";
import Link from "next/link";

type UserRole = "teacher" | "student";

type Participant = {
  id: string;
  name: string;
  role: UserRole;
};

const PARTICIPANTS: Participant[] = [
  { id: "t1", name: "Thầy Dũng", role: "teacher" },
  { id: "s1", name: "Minh", role: "student" },
  { id: "s2", name: "Lan", role: "student" },
  { id: "s3", name: "Huy", role: "student" },
  { id: "s4", name: "Anh", role: "student" },
  { id: "s5", name: "Khoa", role: "student" },
  { id: "s6", name: "My", role: "student" },
  { id: "s7", name: "Tuấn", role: "student" },
  { id: "s8", name: "Linh", role: "student" },
];

export default function DemoZoomPage() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const teacher = PARTICIPANTS[0];
  const students = PARTICIPANTS.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-4 space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-extrabold text-orange-400">
              MathBridge Live
            </span>
            <span className="hidden text-sm text-slate-300/80 sm:inline">
              | Lớp Toán online demo
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Nút quay về trang sinh viên */}
            <Link
              href="/student"
              className="rounded-full border border-orange-400/70 px-4 py-1.5 text-xs sm:text-sm font-semibold text-orange-200 hover:bg-orange-500/10"
            >
              ← Quay về trang sinh viên
            </Link>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          {/* Left: teacher video + students grid */}
          <div className="space-y-4">
            {/* Teacher tile */}
            <div className="relative overflow-hidden rounded-3xl border border-orange-600/60 bg-gradient-to-br from-orange-900/70 via-slate-950 to-slate-900 shadow-lg">
              <div className="flex items-center justify-between px-4 py-2 text-xs text-orange-100/90">
                <span className="font-semibold">
                  Phòng học: Toán cao cấp (Giải tích) – Nhóm 1
                </span>
                <span className="rounded-full bg-black/40 px-3 py-0.5 text-[11px]">
                  Thầy đang giảng bài
                </span>
              </div>
              <div className="grid min-h-[220px] place-items-center px-6 pb-6 pt-2">
                <div className="flex flex-col items-center gap-3">
                  <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-400 text-4xl font-extrabold text-slate-900 shadow-xl">
                    {teacher.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-orange-100">
                      {teacher.name}
                    </p>
                    <p className="text-xs text-orange-200/70">
                      Giảng viên Toán – Đại học
                    </p>
                  </div>
                  <div className="mt-2 rounded-full bg-black/40 px-3 py-1 text-[11px] text-orange-100/90">
                    “Đến đoạn này em nào còn thắc mắc thì bật mic hỏi thầy nhé!”
                  </div>
                </div>
              </div>
            </div>

            {/* Students grid */}
            <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-4 shadow-inner">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-slate-100">
                  Học sinh trong lớp ({students.length})
                </span>
                <span className="rounded-full bg-black/40 px-2 py-0.5 text-[11px]">
                  Chế độ demo – Không ghi hình thật
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {students.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 p-3 text-center text-xs"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-700 text-lg font-bold text-slate-50">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-100">
                      {s.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      SV năm 1 • Toán cao cấp
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: sidebar – info, chat demo, control */}
          <div className="space-y-4">
            {/* Class info */}
            <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 shadow">
              <h2 className="mb-2 text-sm font-semibold text-slate-100">
                Thông tin buổi học
              </h2>
              <ul className="space-y-1 text-xs text-slate-300">
                <li>
                  <span className="font-semibold text-slate-100">
                    Môn:
                  </span>{" "}
                  Đại số 10 – Hàm số bậc nhất
                </li>
                <li>
                  <span className="font-semibold text-slate-100">
                    Thời gian:
                  </span>{" "}
                  19:30 – 20:15
                </li>
                <li>
                  <span className="font-semibold text-slate-100">
                    Nền tảng:
                  </span>{" "}
                  Zoom / Google Meet (demo giả lập)
                </li>
                <li>
                  <span className="font-semibold text-slate-100">
                    Trạng thái:
                  </span>{" "}
                  Đang diễn ra (demo)
                </li>
              </ul>
            </div>

            {/* Chat demo */}
            <div className="flex h-56 flex-col rounded-3xl border border-slate-700 bg-slate-900/80 p-4 shadow">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-100">
                  Chat lớp học (demo)
                </span>
                <span className="rounded-full bg-black/40 px-2 py-0.5 text-[11px] text-slate-300">
                  Chế độ xem trước
                </span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto text-[11px] text-slate-200">
                <div>
                  <span className="font-semibold text-emerald-300">
                    Minh:
                  </span>{" "}
                  Thầy ơi, phần đồ thị cắt trục hoành giải sao ạ?
                </div>
                <div>
                  <span className="font-semibold text-sky-300">
                    Thầy Dũng:
                  </span>{" "}
                  Em nhìn giúp thầy hệ số a &amp; b trong hàm số y = ax + b nhé.
                </div>
                <div>
                  <span className="font-semibold text-pink-300">
                    Lan:
                  </span>{" "}
                  Em hiểu rồi ạ, cảm ơn thầy!
                </div>
                <div className="rounded-2xl bg-slate-800/70 p-2 text-[11px] text-slate-300">
                  💡 Gợi ý: Bản thật có thể kết nối với chat Zoom / Meet hoặc
                  chat riêng của MathBridge.
                </div>
              </div>
              <div className="mt-2">
                <div className="rounded-2xl bg-slate-800/80 px-3 py-2 text-[11px] text-slate-400">
                  Ô nhập tin nhắn sẽ hiển thị ở đây trong bản thật.  
                  Bản demo chỉ minh họa giao diện.
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 shadow-lg">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMicOn((v) => !v)}
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${
                    micOn
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-700 text-slate-100"
                  }`}
                >
                  {micOn ? "🎙 Đang bật mic" : "🔇 Đang tắt mic"}
                </button>
                <button
                  onClick={() => setCamOn((v) => !v)}
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${
                    camOn
                      ? "bg-sky-500 text-slate-950"
                      : "bg-slate-700 text-slate-100"
                  }`}
                >
                  {camOn ? "📷 Đang bật camera" : "🚫 Đang tắt camera"}
                </button>
              </div>
              <Link
                href="/student"
                className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                ⏹ Rời lớp (về trang sinh viên)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
