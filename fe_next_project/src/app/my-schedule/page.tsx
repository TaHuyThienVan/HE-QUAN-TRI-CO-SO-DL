"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiCall } from "@/lib/api";

type Session = {
    id: number;
    subject: string;
    scheduledDate: string;
    duration: number;
    status: string;
    location: string | null;
    notes: string | null;
    tutor: {
        id: number;
        fullName: string | null;
        email: string;
    } | null;
    student: {
        id: number;
        fullName: string | null;
        email: string;
    } | null;
};

type Student = {
    id: number;
    fullName: string | null;
    email: string;
};

export default function MySchedulePage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);

    useEffect(() => {
        const loadSessions = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log("Loading sessions for current student...");
                // Lấy danh sách sessions của học sinh hiện tại (tự động lấy từ authentication)
                const sessionsData = await apiCall<Session[]>(
                    "/api/sessions/student/me",
                    {
                        method: "GET",
                    }
                );

                console.log("Sessions data received:", sessionsData);
                console.log("Type of sessionsData:", typeof sessionsData);
                console.log("Is array?", Array.isArray(sessionsData));
                console.log("Number of sessions:", sessionsData?.length || 0);
                
                // Debug: Log raw response if available
                if (sessionsData) {
                    console.log("First session (if any):", sessionsData[0]);
                }

                // Sắp xếp sessions theo ngày giờ (mới nhất trước)
                const sortedSessions = (sessionsData || []).sort((a, b) => {
                    const dateA = new Date(a.scheduledDate).getTime();
                    const dateB = new Date(b.scheduledDate).getTime();
                    return dateB - dateA; // Mới nhất trước
                });

                console.log("Sorted sessions:", sortedSessions);
                setSessions(sortedSessions);
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Không thể tải lịch học. Vui lòng thử lại.";
                
                // Check if it's an authentication error
                if (
                    err instanceof Error &&
                    (errorMessage.includes("401") || errorMessage.includes("đăng nhập") || errorMessage.includes("UNAUTHORIZED"))
                ) {
                    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                    window.location.href = "/login";
                    return;
                }
                
                // For 403 or other errors, just show empty list
                if (errorMessage.includes("403") || errorMessage.includes("FORBIDDEN") || errorMessage.includes("Request failed")) {
                    setSessions([]);
                    setError(null); // Don't show error for 403
                } else {
                    setError(errorMessage);
                }
            } finally {
                setLoading(false);
            }
        };

        loadSessions();
    }, []);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "N/A";
        return date.toLocaleString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "N/A";
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            SCHEDULED: "Đã đặt lịch",
            CONFIRMED: "Đã xác nhận",
            COMPLETED: "Đã hoàn thành",
            CANCELLED: "Đã hủy",
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colorMap: Record<string, string> = {
            SCHEDULED: "bg-blue-500/20 text-blue-300 border-blue-500/50",
            CONFIRMED: "bg-green-500/20 text-green-300 border-green-500/50",
            COMPLETED: "bg-gray-500/20 text-gray-300 border-gray-500/50",
            CANCELLED: "bg-red-500/20 text-red-300 border-red-500/50",
        };
        return colorMap[status] || "bg-orange-500/20 text-orange-300 border-orange-500/50";
    };

    const isUpcoming = (dateString: string) => {
        const date = new Date(dateString);
        return date > new Date();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-900 via-[#5e1f12] to-[#3b0c12] text-orange-50">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-black/40 backdrop-blur">
                <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-extrabold text-xl text-orange-400">
                            MathBridge
                        </span>
                        <span className="text-sm text-orange-300/80 hidden sm:inline">
                            | Xem lịch học
                        </span>
                    </div>
                    <Link
                        href="/student"
                        className="text-sm font-semibold text-orange-300 hover:underline"
                    >
                        ← Quay lại trang học sinh
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
                <section className="bg-black/40 rounded-2xl shadow p-5">
                    <h1 className="text-2xl font-extrabold text-orange-400 mb-4">
                        Lịch học đã được giảng viên đặt
                    </h1>

                    {loading && (
                        <div className="text-center py-8">
                            <p className="text-orange-300">Đang tải lịch học...</p>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-2xl border border-red-500/60 bg-red-900/20 p-4 text-red-100">
                            <p className="font-semibold">Lỗi</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    )}

                    {!loading && !error && sessions.length === 0 && (
                        <div className="rounded-2xl border border-orange-700/60 bg-black/30 p-6 text-center">
                            <p className="text-orange-200/80">
                                Chưa có buổi học nào được giảng viên đặt. Lịch học sẽ hiển thị tại đây khi giảng viên tạo buổi học mới.
                            </p>
                        </div>
                    )}

                    {!loading && !error && sessions.length > 0 && (
                        <div className="space-y-4">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`rounded-xl border p-4 bg-black/30 ${
                                        isUpcoming(session.scheduledDate)
                                            ? "border-orange-500/70"
                                            : "border-orange-800/50"
                                    }`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-orange-100">
                                                        {session.subject || "Buổi học"}
                                                    </h3>
                                                    {session.tutor && (
                                                        <p className="text-sm text-orange-200/80 mt-1">
                                                            Giảng viên:{" "}
                                                            <span className="font-semibold">
                                                                {session.tutor.fullName ||
                                                                    session.tutor.email}
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                                        session.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(session.status)}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="text-orange-300/80">
                                                        📅 Ngày học:
                                                    </span>
                                                    <p className="text-orange-100 font-medium mt-1">
                                                        {formatDate(session.scheduledDate)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-orange-300/80">
                                                        ⏰ Giờ học:
                                                    </span>
                                                    <p className="text-orange-100 font-medium mt-1">
                                                        {formatTime(session.scheduledDate)} (
                                                        {session.duration} phút)
                                                    </p>
                                                </div>
                                                {session.location && (
                                                    <div>
                                                        <span className="text-orange-300/80">
                                                            📍 Địa điểm:
                                                        </span>
                                                        <p className="text-orange-100 font-medium mt-1">
                                                            {session.location}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {session.notes && (
                                                <div className="mt-3 pt-3 border-t border-orange-800/50">
                                                    <span className="text-orange-300/80 text-sm">
                                                        📝 Ghi chú:
                                                    </span>
                                                    <p className="text-orange-100 text-sm mt-1">
                                                        {session.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

