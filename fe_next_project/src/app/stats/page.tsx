"use client";

import React, { useState } from "react";
import Link from "next/link";

type Chapter = { name: string; percent: number };
type History = {
  date: string;
  topic: string;
  duration: string;
  status: "Hoàn thành" | "Đang học";
};

type YearCourse = {
  name: string;
  math: {
    mid: number | null;
    final: number | null;
    chapters: Chapter[];
  };
  history: History[];
};

const years: Record<string, YearCourse> = {
  "2023_2024": {
    name: "Khóa 2023–2024",
    math: {
      mid: 7.6,
      final: 8.1,
      chapters: [
        { name: "Đại số cơ bản", percent: 100 },
        { name: "Hình học phẳng", percent: 95 },
        { name: "Giải tích nhập môn", percent: 88 },
      ],
    },
    history: [
      {
        date: "2024-05-20",
        topic: "Ôn tập cuối khóa",
        duration: "40 phút",
        status: "Hoàn thành",
      },
      {
        date: "2024-04-18",
        topic: "Hình học: đường tròn nội/ngoại tiếp",
        duration: "35 phút",
        status: "Hoàn thành",
      },
    ],
  },
  "2024_2025": {
    name: "Khóa 2024–2025",
    math: {
      mid: 8.0,
      final: 8.5,
      chapters: [
        { name: "Đại số nâng cao", percent: 100 },
        { name: "Hình học không gian", percent: 92 },
        { name: "Giải tích 1", percent: 84 },
      ],
    },
    history: [
      {
        date: "2025-05-15",
        topic: "Giải tích: đạo hàm ứng dụng",
        duration: "30 phút",
        status: "Hoàn thành",
      },
      {
        date: "2025-03-12",
        topic: "Không gian: hình chóp – thể tích",
        duration: "25 phút",
        status: "Hoàn thành",
      },
    ],
  },
  "2025_2026": {
    name: "Khóa 2025–2026",
    math: {
      mid: 8.2,
      final: null,
      chapters: [
        { name: "Đại số – Hệ phương trình", percent: 75 },
        { name: "Hình học – Góc & Đường tròn", percent: 60 },
        { name: "Giải tích – Giới hạn dãy & hàm", percent: 35 },
      ],
    },
    history: [
      {
        date: "2025-10-09",
        topic: "Giải tích: giới hạn dãy số",
        duration: "20 phút",
        status: "Đang học",
      },
      {
        date: "2025-10-08",
        topic: "Hình học: tiếp tuyến & cát tuyến",
        duration: "30 phút",
        status: "Hoàn thành",
      },
      {
        date: "2025-10-06",
        topic: "Đại số: hệ phương trình 2 ẩn",
        duration: "35 phút",
        status: "Hoàn thành",
      },
      {
        date: "2025-10-04",
        topic: "Đại số: Tích phân ",
        duration: "35 phút",
        status: "Hoàn thành",
      },
    ],
  },
};

export default function StudentMathStatsPage() {
  const [yearKey, setYearKey] = useState<keyof typeof years>("2025_2026");
  const cur = years[yearKey];

  const avg =
    cur.math.mid != null && cur.math.final != null
      ? Number(((cur.math.mid + cur.math.final) / 2).toFixed(2))
      : null;

  const sortedHistory = [...cur.history].sort((a, b) => {
    if (a.status !== b.status) return a.status === "Đang học" ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

  const fmt = (n: number | null) => (n == null ? "—" : n.toFixed(1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-50 to-rose-200">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header + actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-rose-700">
              Thống kê học tập – Toán
            </h1>
            <p className="text-gray-600">
              {cur.name} • Số chương:{" "}
              <span className="font-semibold text-gray-800">
                {cur.math.chapters.length}
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/student"
              className="inline-flex h-11 min-w-[150px] items-center justify-center rounded-full bg-rose-500 px-5 font-semibold text-white shadow hover:bg-rose-600"
            >
              ← Trang sinh viên
            </Link>
          </div>
        </div>

        {/* Bộ chọn Khóa (năm học) */}
        <div className="mt-4">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Khóa (năm học)
          </label>
          <div className="relative w-full sm:w-80">
            <select
              value={yearKey}
              onChange={(e) =>
                setYearKey(e.target.value as keyof typeof years)
              }
              className="h-11 w-full appearance-none rounded-xl border border-rose-300 bg-white px-3 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              {Object.entries(years).map(([key, y]) => (
                <option key={key} value={key}>
                  {y.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-rose-600"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-6 grid grid-cols-1 gap-6">
          {/* Điểm & tiến độ Toán */}
          <section className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-rose-100">
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat label="Điểm giữa khóa" value={fmt(cur.math.mid)} />
              <Stat label="Điểm cuối khóa" value={fmt(cur.math.final)} />
              <Stat
                label="Trung bình"
                value={avg == null ? "—" : avg.toFixed(2)}
                highlight
              />
            </div>

            <h2 className="mb-2 text-lg font-bold text-gray-800">
              Tiến độ theo chương
            </h2>
            <div className="space-y-4">
              {cur.math.chapters.map((c) => (
                <div key={c.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">
                      {c.name}
                    </span>
                    <span className="text-gray-600">{c.percent}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-rose-100">
                    <div
                      className="h-3 rounded-full bg-rose-500"
                      style={{ width: `${c.percent}%` }}
                      aria-label={`Tiến độ ${c.name}: ${c.percent}%`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Lịch sử học */}
          <section className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-rose-100">
            <h2 className="mb-3 text-lg font-bold text-gray-800">
              Lịch sử học gần đây
            </h2>
            <ul className="divide-y divide-rose-100">
              {sortedHistory.map((h, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{h.topic}</p>
                    <p className="text-sm text-gray-600">
                      Ngày: {h.date} • Thời lượng: {h.duration}
                    </p>
                  </div>
                  <span
                    className={
                      "inline-flex w-max rounded-full px-3 py-1 text-sm font-semibold " +
                      (h.status === "Đang học"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700")
                    }
                  >
                    {h.status}
                  </span>
                </li>
              ))}
            </ul>

            {/* nút đi tới feedback */}
            <div className="mt-4 flex justify-end">
              <Link
                href="/feedback"
                className="inline-flex h-10 items-center justify-center rounded-full bg-rose-500 px-5 text-sm font-semibold text-white shadow hover:bg-rose-600"
              >
                Gửi đánh giá buổi học
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border px-4 py-3 " +
        (highlight
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-rose-100 bg-rose-50/40 text-gray-800")
      }
    >
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
