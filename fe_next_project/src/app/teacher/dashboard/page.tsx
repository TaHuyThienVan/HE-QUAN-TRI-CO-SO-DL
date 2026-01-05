"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ScheduleItem = {
  id: string;
  className: string;
  grade: string;
  topic: string;
  startTime: string;
  endTime: string;
  mode: "Online" | "Offline";
  room: string;
  materials: string[];
};

type CurriculumBlock = {
  id: string;
  title: string;
  focus: string;
  objectives: string[];
  resources: string[];
};

type SupportChannel = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
};

const scheduleData: ScheduleItem[] = [
  {
    id: "mon-am",
    className: "Toán Tư Duy 7A",
    grade: "Khối 7",
    topic: "Hệ thức lượng trong tam giác",
    startTime: "Thứ 2, 08:00",
    endTime: "09:30",
    mode: "Online",
    room: "Zoom · MB-489211",
    materials: ["Slide 07.pdf", "Bài tập hình 7A.docx"],
  },
  {
    id: "tue-pm",
    className: "Chuyên đề Luyện Thi 9",
    grade: "Khối 9",
    topic: "Ôn tập Đại số – Bất đẳng thức",
    startTime: "Thứ 3, 19:30",
    endTime: "21:15",
    mode: "Offline",
    room: "CS1 · Phòng 402",
    materials: ["Handout BDT.pdf", "Quizizz code #998177"],
  },
  {
    id: "thu-am",
    className: "MathBridge Mentor 10",
    grade: "Khối 10",
    topic: "Hàm số bậc nhất – đồ thị & ứng dụng",
    startTime: "Thứ 5, 09:45",
    endTime: "11:15",
    mode: "Online",
    room: "Zoom · MB-777204",
    materials: ["Notebook GeoGebra", "Google Sheet theo dõi tiến độ"],
  },
];

const curriculumBlocks: CurriculumBlock[] = [
  {
    id: "logic",
    title: "Logic & Số học nền tảng",
    focus: "Kiến thức cốt lõi lớp 6–7",
    objectives: [
      "Vững vàng về tập hợp, số nguyên, phân số",
      "Tăng khả năng lập luận qua bài toán đếm",
      "Tạo thói quen trình bày lời giải rõ ràng",
    ],
    resources: ["Lesson plan 6-7.pdf", "Video micro-learning (12 clip)", "Tài liệu luyện tập 120 câu"],
  },
  {
    id: "geometry",
    title: "Hình học trực quan",
    focus: "Ứng dụng thực tế lớp 8–9",
    objectives: [
      "Hiểu sâu góc, đường tròn, phép biến hình",
      "Kết hợp GeoGebra để minh họa",
      "Đổi mới hoạt động nhóm trong 20 phút cuối",
    ],
    resources: ["Bộ thẻ hình học A3", "Kịch bản hoạt động nhóm", "Kho bài tập nâng cao"],
  },
  {
    id: "analysis",
    title: "Hàm số & Xác suất",
    focus: "Lộ trình lớp 10–12",
    objectives: [
      "Liên kết kiến thức đại số – giải tích",
      "Tăng cường ví dụ gắn với STEM",
      "Chuẩn bị ngân hàng câu hỏi luyện thi",
    ],
    resources: ["Deck Slides 10-12", "Mẫu đề kiểm tra 45'", "Template phân tích dữ liệu bằng Python"],
  },
];

const supportChannels: SupportChannel[] = [
  {
    id: "chat",
    title: "Chat trực tiếp với học sinh",
    description: "Phản hồi câu hỏi bài tập, gửi link hướng dẫn nhanh.",
    actionLabel: "Mở MathBridge Chat",
    actionHref: "/chat",
  },
  {
    id: "ticket",
    title: "Phiếu hỗ trợ phụ huynh",
    description: "Cập nhật tiến độ học, trao đổi lịch học bù.",
    actionLabel: "Tạo ticket hỗ trợ",
    actionHref: "/feedback",
  },
  {
    id: "mentor",
    title: "Tổ hỗ trợ chuyên môn",
    description: "Hẹn cố vấn học thuật, nhận bộ giáo án chuẩn.",
    actionLabel: "Đặt lịch cố vấn",
    actionHref: "/schedule",
  },
];

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [teacherEmail, setTeacherEmail] = useState<string | null>(null);
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const email = localStorage.getItem("teacherEmail");
    if (!email) {
      router.replace("/login-teacher");
      return;
    }
    setTeacherEmail(email);
    setLastLogin(localStorage.getItem("teacherLastLogin"));
  }, [router]);

  const greeting = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 11) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  const formattedLogin = useMemo(() => {
    if (!lastLogin) return null;
    const date = new Date(lastLogin);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("vi-VN", { hour12: false });
  }, [lastLogin]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0401] via-[#1b0602] to-[#260803] text-orange-50">
      <header className="border-b border-orange-900/50 bg-[#150402]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-orange-200/70">MathBridge Faculty</p>
            <h1 className="text-3xl font-black text-orange-300">Teaching Command Center</h1>
            <p className="text-sm text-orange-200/70">
              {greeting}
              {teacherEmail ? `, ${teacherEmail}` : ""}. Chúc thầy/cô một ngày hiệu quả!
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-orange-200/70">
            {formattedLogin && (
              <span className="rounded-full border border-orange-800/70 px-4 py-1">Đăng nhập gần nhất: {formattedLogin}</span>
            )}
            <Link
              href="/teacher"
              className="rounded-full border border-orange-700/80 px-4 py-2 text-sm font-semibold text-orange-50 transition hover:bg-orange-500 hover:text-black"
            >
              Hồ sơ giảng viên
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-10">
        <section id="schedule" className="rounded-3xl border border-orange-900/60 bg-[#1f0803]/80 p-6 shadow-[0_0_50px_rgba(0,0,0,0.55)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-orange-200/70">Teaching timeline</p>
              <h2 className="text-2xl font-extrabold text-orange-200">Lịch dạy trong tuần</h2>
              <p className="text-sm text-orange-100/70">Luân phiên online/offline, đồng bộ với trang Lịch.</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/schedule"
                className="rounded-full border border-orange-700/70 px-4 py-2 text-sm font-semibold text-orange-100 hover:bg-orange-500 hover:text-black transition"
              >
                Mở trang Lịch
              </Link>
              <Link
                href="/admin"
                className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_0_20px_rgba(248,148,80,0.6)] hover:bg-orange-400 transition"
              >
                Quản lý lớp
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {scheduleData.map((slot) => (
              <article key={slot.id} className="flex flex-col gap-3 rounded-2xl border border-orange-900/50 bg-[#2a0b04]/80 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.4em] text-orange-200/70">{slot.grade}</p>
                  <span className="rounded-full border border-orange-700/60 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {slot.mode}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-orange-50">{slot.className}</h3>
                  <p className="text-sm text-orange-200/70">{slot.topic}</p>
                </div>
                <p className="text-sm font-semibold text-orange-100">
                  {slot.startTime} → {slot.endTime}
                </p>
                <p className="text-xs text-orange-200/60">{slot.room}</p>
                <div className="border-t border-orange-900/50 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-200/80">Tài liệu chuẩn bị</p>
                  <ul className="mt-2 space-y-1 text-sm text-orange-50">
                    {slot.materials.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="curriculum" className="rounded-3xl border border-orange-900/60 bg-[#1c0703]/80 p-6 shadow-[0_0_50px_rgba(0,0,0,0.55)]">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-orange-200/70">Curriculum stack</p>
            <h2 className="text-2xl font-extrabold text-orange-200">Giáo trình giảng dạy</h2>
            <p className="text-sm text-orange-100/70">Tùy chỉnh theo khối lớp và mục tiêu từng tuần.</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {curriculumBlocks.map((block) => (
              <article key={block.id} className="rounded-2xl border border-orange-900/50 bg-[#2b0b04] p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-orange-200/80">{block.focus}</p>
                <h3 className="mt-2 text-xl font-bold text-orange-50">{block.title}</h3>
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-200/70">Mục tiêu trọng tâm</p>
                  <ul className="mt-2 space-y-1 text-sm text-orange-50">
                    {block.objectives.map((objective) => (
                      <li key={objective} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-400" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 border-t border-orange-900/50 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-200/70">Tài nguyên</p>
                  <ul className="mt-2 space-y-1 text-sm text-orange-50">
                    {block.resources.map((resource) => (
                      <li key={resource}>{resource}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="support" className="rounded-3xl border border-orange-900/60 bg-[#230803]/80 p-6 shadow-[0_0_50px_rgba(0,0,0,0.55)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-orange-200/70">Student success</p>
              <h2 className="text-2xl font-extrabold text-orange-200">Support &amp; Care</h2>
              <p className="text-sm text-orange-100/70">
                Kết nối học sinh – phụ huynh – cố vấn. Kích hoạt hỗ trợ chỉ với một cú nhấp.
              </p>
            </div>
            <Link
              href="/teacher/feedbacks"
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_0_20px_rgba(248,148,80,0.6)] hover:bg-orange-400 transition"
            >
              Xem phản hồi mới
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {supportChannels.map((channel) => (
              <article key={channel.id} className="flex flex-col gap-4 rounded-2xl border border-orange-900/50 bg-[#300c05] p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">Kênh #{channel.id}</p>
                  <h3 className="mt-1 text-xl font-bold text-orange-50">{channel.title}</h3>
                  <p className="text-sm text-orange-200/70">{channel.description}</p>
                </div>
                <Link
                  href={channel.actionHref}
                  className="inline-flex items-center justify-center rounded-2xl border border-orange-700/70 px-4 py-2 text-sm font-semibold text-orange-100 hover:bg-orange-500 hover:text-black transition"
                >
                  {channel.actionLabel}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

