"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api";

type ScheduleItem = {
    id?: number;
    date: string;
    time: string;
    method: string;
    note: string;
    subject?: string;
    scheduledDate?: string;
};

type Student = {
    id: number;
    fullName: string;
    email?: string;
};

export default function SchedulePage() {
    const router = useRouter();
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [method, setMethod] = useState("online");
    const [note, setNote] = useState("");
    const [studentId, setStudentId] = useState<string>("");
    const [students, setStudents] = useState<Student[]>([]);
    const [items, setItems] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Kiểm tra quyền truy cập - chỉ cho phép giảng viên
    useEffect(() => {
        if (typeof window === "undefined") return;
        const teacherEmail = localStorage.getItem("teacherEmail");
        if (!teacherEmail) {
            router.replace("/login-teacher");
            return;
        }
        // Load students and sessions from API
        loadStudents();
        loadSessions();
    }, [router]);

    // Load students from API
    const loadStudents = async () => {
        try {
            const studentsList = await apiCall<Student[]>("/api/students");
            if (studentsList && Array.isArray(studentsList)) {
                setStudents(studentsList);
                // Auto-select first student if available
                if (studentsList.length > 0 && !studentId) {
                    setStudentId(studentsList[0].id.toString());
                }
            } else {
                setStudents([]);
            }
        } catch (err: any) {
            console.error("Error loading students:", err);
            setStudents([]);
            // Don't show error to user, just log it - form will work without student selection
        }
    };

    // Load sessions from API
    const loadSessions = async () => {
        try {
            // Clear previous error
            setError(null);
            const sessions = await apiCall<any[]>("/api/sessions/tutor/me");
            if (sessions && Array.isArray(sessions)) {
                // Convert sessions to ScheduleItem format
                const formattedItems: ScheduleItem[] = sessions.map((session) => {
                    const scheduledDate = new Date(session.scheduledDate);
                    const dateStr = scheduledDate.toISOString().split('T')[0];
                    const timeStr = scheduledDate.toTimeString().split(' ')[0].substring(0, 5);
                    const method = session.location?.includes("Online") ? "online" : "offline";
                    
                    return {
                        id: session.id,
                        date: dateStr,
                        time: timeStr,
                        method: method,
                        note: session.notes || "",
                        subject: session.subject,
                        scheduledDate: session.scheduledDate,
                    };
                });
                // Sort by scheduled date (newest first)
                formattedItems.sort((a, b) => {
                    if (a.scheduledDate && b.scheduledDate) {
                        return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
                    }
                    return 0;
                });
                setItems(formattedItems);
            } else {
                // If response is not an array, set empty array
                setItems([]);
            }
        } catch (err: any) {
            const errorMsg = err.message || "Không thể tải danh sách lịch học";
            
            // Check if it's an authentication error
            if (errorMsg.includes("401") || errorMsg.includes("đăng nhập") || errorMsg.includes("UNAUTHORIZED")) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                router.push("/login-teacher");
                return;
            }
            
            // For 403 or FORBIDDEN, just set empty array (user might not be a tutor yet)
            // Don't show error message or log for these cases
            if (errorMsg.includes("403") || errorMsg.includes("FORBIDDEN") || errorMsg.includes("không phải là giảng viên") || errorMsg.includes("Request failed with status 403")) {
                // Silently handle 403 - just show empty list
                setItems([]);
                setError(null); // Clear error
                return;
            }
            
            // For other errors, only show if it's not a generic "Request failed"
            if (!errorMsg.includes("Request failed") && !errorMsg.includes("Request failed with status")) {
                setError(errorMsg);
            } else {
                // For generic errors, just set empty array without showing error
                setError(null);
            }
            setItems([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) {
            alert("Vui lòng chọn ngày và giờ học");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Prepare request data
            const requestData: any = {
                date: date,
                time: time,
                method: method,
                note: note || null,
            };
            
            // Add studentId if selected and valid
            if (studentId && studentId.trim() !== "") {
                const parsedId = parseInt(studentId);
                if (!isNaN(parsedId) && parsedId > 0) {
                    requestData.studentId = parsedId;
                }
            }

            // Call API to create session
            const response = await apiCall<any>("/api/sessions/schedule", {
                method: "POST",
                body: JSON.stringify(requestData),
            });

            // If we get here, session was created successfully
            alert("Đặt lịch học thành công!");
            // Clear any previous errors
            setError(null);
            // Reset form
            setDate("");
            setTime("");
            setNote("");
            // Reload sessions to show the new one
            await loadSessions();
        } catch (err: any) {
            console.error("Error creating session:", err);
            const errorMessage = err.message || "Không thể đặt lịch học. Vui lòng thử lại.";
            setError(errorMessage);
            
            // Check if it's an authentication error
            if (errorMessage.includes("401") || errorMessage.includes("đăng nhập") || errorMessage.includes("UNAUTHORIZED")) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                router.push("/login-teacher");
                return;
            }
            
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-900 via-[#5e1f12] to-[#3b0c12] text-orange-50">
            {/* Header giống các trang khác */}
            <header className="sticky top-0 z-20 bg-black/40 backdrop-blur">
                <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
            <span className="font-extrabold text-xl text-orange-400">
              MathBridge
            </span>
                        <span className="text-sm text-orange-300/80 hidden sm:inline">
              | Đặt lịch học
            </span>
                    </div>
                    <Link
                        href="/teacher/dashboard"
                        className="text-sm font-semibold text-orange-300 hover:underline"
                    >
                        ← Quay lại trang giảng viên
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
                {/* Form đặt lịch */}
                <section className="bg-black/40 rounded-2xl shadow p-5">
                    <h1 className="text-2xl font-extrabold text-orange-400 mb-4">
                        Đặt lịch học mới
                    </h1>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
                    >
                        <div>
                            <label className="block text-orange-300/80 mb-1">
                                Ngày học
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-transparent border border-orange-700 rounded-md px-3 py-2 focus:outline-none focus:border-orange-400 [color-scheme:dark]"
                            />
                        </div>

                        <div>
                            <label className="block text-orange-300/80 mb-1">
                                Giờ học
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-transparent border border-orange-700 rounded-md px-3 py-2 focus:outline-none focus:border-orange-400 [color-scheme:dark]"
                            />
                        </div>

                        <div>
                            <label className="block text-orange-300/80 mb-1">
                                Hình thức
                            </label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full bg-transparent border border-orange-700 rounded-md px-3 py-2 focus:outline-none focus:border-orange-400"
                            >
                                <option value="online" className="bg-gray-900">
                                    Online (Zoom / Google Meet)
                                </option>
                                <option value="offline" className="bg-gray-900">
                                    Học trực tiếp
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-orange-300/80 mb-1">
                                Học sinh {students.length > 0 ? "(tuỳ chọn)" : ""}
                            </label>
                            {students.length > 0 ? (
                                <select
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="w-full bg-transparent border border-orange-700 rounded-md px-3 py-2 focus:outline-none focus:border-orange-400"
                                >
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id} className="bg-gray-900">
                                            {student.fullName} {student.email ? `(${student.email})` : ""}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="w-full bg-transparent border border-orange-700/50 rounded-md px-3 py-2 text-orange-200/60 text-xs">
                                    Đang tải danh sách học sinh... (sẽ tự động chọn học sinh đầu tiên nếu không chọn)
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-orange-300/80 mb-1">
                                Ghi chú cho buổi học (tuỳ chọn)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                                className="w-full bg-transparent border border-orange-700 rounded-md px-3 py-2 focus:outline-none focus:border-orange-400"
                                placeholder="Ví dụ: Ôn chương Hàm số bậc nhất, chuẩn bị kiểm tra 15 phút..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Đang xử lý..." : "Đặt lịch học"}
                            </button>
                        </div>
                        {error && (
                            <div className="md:col-span-2 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md px-3 py-2">
                                {error}
                            </div>
                        )}
                    </form>
                </section>

                {/* Danh sách lịch đã đặt */}
                <section className="bg-black/40 rounded-2xl shadow p-5">
                    <h2 className="text-lg font-bold text-orange-300 mb-3">
                        Lịch học đã đặt
                    </h2>

                    {items.length === 0 ? (
                        <p className="text-sm text-orange-200/80">
                            Chưa có buổi học nào. Hãy đặt buổi học đầu tiên ở form phía trên.
                        </p>
                    ) : (
                        <ul className="space-y-3 text-sm">
                            {items.map((it) => (
                                <li
                                    key={it.id || `${it.date}-${it.time}`}
                                    className="border border-orange-800/70 rounded-xl px-3 py-2 bg-black/30"
                                >
                                    <div className="font-semibold text-orange-100">
                                        {new Date(it.date).toLocaleDateString("vi-VN", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}{" "}
                                        – {it.time}
                                    </div>
                                    {it.subject && (
                                        <div className="text-xs text-orange-300/90 mt-1">
                                            Môn học: {it.subject}
                                        </div>
                                    )}
                                    <div className="text-xs text-orange-200/80 mt-1">
                                        Hình thức:{" "}
                                        {it.method === "online"
                                            ? "Online (Zoom / Google Meet)"
                                            : "Học trực tiếp"}
                                    </div>
                                    {it.note && (
                                        <div className="text-xs text-orange-200/90 mt-1">
                                            Ghi chú: {it.note}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
}