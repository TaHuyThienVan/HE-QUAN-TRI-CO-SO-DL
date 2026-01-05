"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createFeedback, FeedbackRequest } from "@/lib/api";

export default function ClassFeedbackPage() {
  const [form, setForm] = useState({
    name: "",
    course: "",
    teacher: "",
    date: "",
    mode: "", // Trực tiếp / Online
    rating: 0, // 1..5
    useful: "", // yes/no
    comments: "",
    suggestions: "",
    anonymous: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const setRating = (n: number) =>
    setForm((p) => ({
      ...p,
      rating: n,
    }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate
    if (!form.course.trim()) {
      setError("Vui lòng nhập môn/lớp");
      setLoading(false);
      return;
    }
    if (!form.teacher.trim()) {
      setError("Vui lòng nhập giảng viên");
      setLoading(false);
      return;
    }
    if (!form.date) {
      setError("Vui lòng chọn ngày học");
      setLoading(false);
      return;
    }
    if (!form.rating || form.rating < 1 || form.rating > 5) {
      setError("Vui lòng chọn mức độ hài lòng (1-5 sao)");
      setLoading(false);
      return;
    }
    if (!form.comments.trim()) {
      setError("Vui lòng nhập nhận xét tổng quan");
      setLoading(false);
      return;
    }

    try {
      const payload: FeedbackRequest = {
        name: form.name || undefined,
        course: form.course,
        teacher: form.teacher,
        date: form.date,
        mode: form.mode || undefined,
        rating: form.rating,
        useful: form.useful || undefined,
        comments: form.comments,
        suggestions: form.suggestions || undefined,
        anonymous: form.anonymous,
      };

      await createFeedback(payload);
      alert("Cảm ơn bạn! Đánh giá đã được ghi nhận.");
      
      // reset form
      setForm({
        name: "",
        course: "",
        teacher: "",
        date: "",
        mode: "",
        rating: 0,
        useful: "",
        comments: "",
        suggestions: "",
        anonymous: false,
      });
    } catch (err: unknown) {
      console.error("Submit feedback failed:", err);
      const message = err instanceof Error ? err.message : "Gửi đánh giá thất bại. Vui lòng thử lại.";
      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-50 to-rose-200">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <header className="rounded-2xl bg-white/90 p-6 text-center shadow-xl ring-1 ring-rose-100">
          <h1 className="text-2xl font-extrabold tracking-tight text-rose-700">
            Đánh giá & Nhận xét sau buổi học
          </h1>
          <p className="mt-1 text-gray-600">
            Vui lòng dành ít phút để phản hồi giúp buổi học sau tốt hơn ✨
          </p>
        </header>

        {/* Form */}
        <main className="mt-6 rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-rose-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hàng 2 cột */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Họ và tên (tuỳ chọn)"
                name="name"
                value={form.name}
                placeholder="Nhập họ và tên"
                onChange={handleChange}
              />

              <Field
                label="Môn/Lớp"
                name="course"
                value={form.course}
                placeholder="VD: Lập trình Java - K17"
                onChange={handleChange}
                required
              />

              <Field
                label="Giảng viên"
                name="teacher"
                value={form.teacher}
                placeholder="VD: ThS. Nguyễn Văn A"
                onChange={handleChange}
                required
              />

              <Field
                label="Ngày học"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Select: Hình thức buổi học */}
            <div>
              <Label>Hình thức buổi học</Label>
              <div className="relative">
                <select
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  className="h-11 w-full appearance-none rounded-xl border border-rose-300 bg-white px-3 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                >
                  <option value="">— Chọn hình thức —</option>
                  <option value="Trực tiếp">Trực tiếp</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Kết hợp (Hybrid)</option>
                </select>

                {/* mũi tên đơn giản, không dùng SVG để khỏi lỗi TS */}
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-rose-600">
                  <span className="text-xs">▼</span>
                </span>
              </div>
            </div>

            {/* Rating */}
            <div>
              <Label>Mức độ hài lòng <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRating(n)}
                    aria-label={`Chọn ${n} sao`}
                    className={`h-10 w-10 rounded-full border transition ${
                      form.rating >= n
                        ? "border-amber-400 bg-amber-100 text-amber-600"
                        : "border-gray-300 bg-white text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {form.rating
                  ? `Bạn chọn ${form.rating}/5`
                  : "Chọn số sao để đánh giá."}
              </p>
            </div>

            {/* Hữu ích? */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RadioGroup
                label="Nội dung buổi học có hữu ích?"
                name="useful"
                value={form.useful}
                onChange={handleChange}
                options={[
                  { label: "Có", value: "yes" },
                  { label: "Chưa", value: "no" },
                ]}
                required
              />

              <div className="flex items-end">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="anonymous"
                    checked={form.anonymous}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-gray-700">Gửi ẩn danh</span>
                </label>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">
                {error}
              </div>
            )}

            {/* Nhận xét */}
            <div>
              <Label>Nhận xét tổng quan <span className="text-red-500">*</span></Label>
              <textarea
                name="comments"
                value={form.comments}
                onChange={handleChange}
                rows={4}
                placeholder="Bạn thích điều gì? Phần nào còn khó?"
                className="w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-400"
                required
              />
            </div>

            {/* Góp ý cải thiện */}
            <div>
              <Label>Góp ý cải thiện</Label>
              <textarea
                name="suggestions"
                value={form.suggestions}
                onChange={handleChange}
                rows={3}
                placeholder="Đề xuất để buổi học sau tốt hơn…"
                className="w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setForm({
                    name: "",
                    course: "",
                    teacher: "",
                    date: "",
                    mode: "",
                    rating: 0,
                    useful: "",
                    comments: "",
                    suggestions: "",
                    anonymous: false,
                  })
                }
                className="rounded-xl border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Đặt lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-rose-500 px-5 py-2 font-semibold text-white shadow hover:bg-rose-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </form>
        </main>

        {/* Footer nav */}
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/student"
            className="inline-flex items-center justify-center h-11 min-w-[200px] px-6 rounded-full bg-rose-500 text-white font-semibold shadow hover:bg-rose-600"
          >
            Quay về trang sinh viên
          </Link>
        </div>
      </div>

      <style jsx>{`
        ::placeholder {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

/* ---------- small UI helpers ---------- */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-sm font-semibold text-gray-700">
      {children}
    </label>
  );
}

function Field(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
  }
) {
  const { label, ...rest } = props;
  return (
    <div>
      <Label>{label}</Label>
      <input
        {...rest}
        className="h-11 w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-400"
      />
    </div>
  );
}

function RadioGroup({
  label,
  name,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: { label: string; value: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-4 rounded-xl border border-rose-200 bg-white px-3 py-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              required={required}
              className="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-gray-800">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
