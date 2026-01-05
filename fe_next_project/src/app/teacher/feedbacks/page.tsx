"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Feedback, getAllFeedbacks, apiCall } from "@/lib/api";

export default function TeacherFeedbacksPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState("ALL");
  const [filterRating, setFilterRating] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [teacherEmail, setTeacherEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const email = localStorage.getItem("teacherEmail");
    if (!email) {
      router.replace("/login-teacher");
      return;
    }
    setTeacherEmail(email);
  }, [router]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAllFeedbacks();
        setFeedbacks(data);
        setLastSyncedAt(new Date().toISOString());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Không thể tải danh sách feedback. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  // Extract unique courses from feedbacks
  const courseOptions = useMemo(() => {
    const courses = new Set<string>();
    feedbacks.forEach((fb) => {
      if (fb.course) courses.add(fb.course);
    });
    return Array.from(courses).sort();
  }, [feedbacks]);

  // Filter feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      // Course filter
      if (filterCourse !== "ALL" && fb.course !== filterCourse) {
        return false;
      }

      // Rating filter
      if (filterRating !== "ALL" && fb.rating !== parseInt(filterRating)) {
        return false;
      }

      // Keyword search
      if (searchKeyword.trim()) {
        const keyword = searchKeyword.toLowerCase();
        return (
          fb.course?.toLowerCase().includes(keyword) ||
          fb.teacher?.toLowerCase().includes(keyword) ||
          fb.comments?.toLowerCase().includes(keyword) ||
          fb.suggestions?.toLowerCase().includes(keyword) ||
          fb.name?.toLowerCase().includes(keyword)
        );
      }

      return true;
    });
  }, [feedbacks, filterCourse, filterRating, searchKeyword]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = feedbacks.length;
    const averageRating =
      total > 0
        ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / total
        : 0;
    const displaying = filteredFeedbacks.length;

    return {
      total,
      averageRating: averageRating.toFixed(1),
      displaying,
    };
  }, [feedbacks, filteredFeedbacks]);

  const formatDateLabel = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTimeLabel = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return null;
      return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const formatLastSynced = () => {
    if (!lastSyncedAt) return null;
    try {
      const date = new Date(lastSyncedAt);
      if (Number.isNaN(date.getTime())) return null;
      return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const handleReload = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllFeedbacks();
      setFeedbacks(data);
      setLastSyncedAt(new Date().toISOString());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách feedback. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0501] via-[#260803] to-[#140301] text-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/40 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-xl text-orange-400">MathBridge</span>
            <span className="text-sm text-orange-300/80 hidden sm:inline">| Phản hồi từ học viên</span>
          </div>
          <Link
            href="/teacher/dashboard"
            className="text-sm font-semibold text-orange-300 hover:underline"
          >
            ← Quay lại Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Header Section */}
        <section className="bg-[#2a1207] border border-orange-800/60 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.65)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-orange-200">Phản hồi từ học viên</h1>
              <p className="text-sm text-orange-100/70 mt-1">
                {formatLastSynced()
                  ? `Đã đồng bộ lần cuối lúc ${formatLastSynced()}.`
                  : "Nhấn \"Tải lại\" để đồng bộ dữ liệu từ form Feedback."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleReload}
              disabled={loading}
              className="rounded-full border border-orange-600/60 bg-[#3c1b0b] px-5 py-2 text-sm font-semibold text-orange-100 transition hover:bg-[#4b210f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang đồng bộ..." : "Tải lại"}
            </button>
          </div>

          {/* Statistics */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-orange-800/60 bg-[#1b0703] p-4">
              <p className="text-xs uppercase tracking-widest text-orange-300/70">Tổng số</p>
              <p className="mt-2 text-3xl font-extrabold text-orange-200">{stats.total}</p>
              <p className="text-sm text-orange-200/60">Feedback đã lưu</p>
            </div>

            <div className="rounded-2xl border border-orange-800/60 bg-[#1b0703] p-4">
              <p className="text-xs uppercase tracking-widest text-orange-300/70">Điểm trung bình</p>
              <p className="mt-2 text-3xl font-extrabold text-orange-200">{stats.averageRating}</p>
              <p className="text-sm text-orange-200/60">/5 sao</p>
            </div>

            <div className="rounded-2xl border border-orange-800/60 bg-[#1b0703] p-4">
              <p className="text-xs uppercase tracking-widest text-orange-300/70">Đang hiển thị</p>
              <p className="mt-2 text-3xl font-extrabold text-orange-200">{stats.displaying}</p>
              <p className="text-sm text-orange-200/60">Sau khi áp dụng bộ lọc</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-orange-200/80">
                Khoá học
              </label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="h-11 w-full rounded-xl border border-orange-700/60 bg-[#1b0703] px-3 text-sm text-orange-50 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
              >
                <option value="ALL">Tất cả môn học</option>
                {courseOptions.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-orange-200/80">
                Mức sao
              </label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="h-11 w-full rounded-xl border border-orange-700/60 bg-[#1b0703] px-3 text-sm text-orange-50 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
              >
                <option value="ALL">Tất cả</option>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} sao
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-orange-200/80">
                Từ khoá
              </label>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Ví dụ: bài tập khó, lớp 9..."
                className="h-11 w-full rounded-xl border border-orange-700/60 bg-[#1b0703] px-3 text-sm text-orange-50 placeholder:text-orange-200/50 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
              />
            </div>
          </div>
        </section>

        {/* Feedback List */}
        <section className="space-y-4">
          {loading && (
            <div className="rounded-2xl border border-orange-800/60 bg-[#1b0703] p-6 text-center text-sm text-orange-200">
              Đang tải feedback từ máy chủ...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/50 bg-red-900/20 p-6 text-center text-sm text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && filteredFeedbacks.length === 0 && (
            <div className="rounded-2xl border border-orange-800/60 bg-[#1b0703] p-6 text-center text-sm text-orange-200">
              Chưa có phản hồi phù hợp với bộ lọc hiện tại.
            </div>
          )}

          {!loading &&
            !error &&
            filteredFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="rounded-2xl border border-orange-800/60 bg-[#1b0703] p-5 hover:border-orange-700/80 transition"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-orange-300/80 font-semibold">
                      {fb.course}
                    </p>
                    <h4 className="text-xl font-semibold text-orange-50 mt-1">
                      Giảng viên: {fb.teacher}
                    </h4>
                    <p className="text-sm text-orange-200/70 mt-1">
                      {formatDateLabel(fb.date)} • {fb.mode || "Không rõ hình thức"}
                    </p>
                    {fb.id && (
                      <p className="text-xs text-orange-200/60 mt-1">ID: {fb.id}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-amber-300">
                      {fb.rating}
                      <span className="text-base font-semibold text-amber-100">/5</span>
                    </span>
                    {formatDateTimeLabel(fb.createdAt) && (
                      <p className="text-xs text-orange-200/60 mt-1">
                        Gửi lúc {formatDateTimeLabel(fb.createdAt)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-orange-800/50">
                  <p className="text-sm text-orange-50 leading-relaxed">{fb.comments}</p>
                </div>

                {fb.suggestions && (
                  <div className="mt-3 pt-3 border-t border-orange-800/50">
                    <p className="text-xs text-orange-200/80">
                      <span className="font-semibold text-orange-100">Góp ý:</span> {fb.suggestions}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-orange-200/80">
                  <span className="rounded-full border border-orange-700/70 px-3 py-1">
                    {fb.anonymous ? "Ẩn danh" : `Người gửi: ${fb.name || "Học viên"}`}
                  </span>
                  {fb.useful && (
                    <span className="rounded-full border border-orange-700/70 px-3 py-1">
                      Đánh giá hữu ích: {fb.useful === "yes" ? "Có" : "Không"}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </section>
      </main>
    </div>
  );
}

