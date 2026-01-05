"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api";

type Tutor = {
    id: number;
    fullName: string | null;
    email: string;
    hourlyRate: number;
    rating: number;
    subjects: string | null;
    experience: number | null;
};

type Slot = {
    time: string;
    date: string;
    available: boolean;
    status: string;
    scheduledDate: string;
};

export default function BookSessionPage() {
    const router = useRouter();
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [bookingSlot, setBookingSlot] = useState<string | null>(null);
    const [subject, setSubject] = useState<string>("Toán học");
    const [method, setMethod] = useState<"online" | "offline">("online");
    const [note, setNote] = useState<string>("");
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    // Kiểm tra quyền truy cập - chỉ cho phép học sinh
    useEffect(() => {
        if (typeof window === "undefined") return;
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        const userRole = localStorage.getItem("userRole");
        
        if (!token) {
            router.replace("/login");
            return;
        }
        
        if (userRole && userRole !== "STUDENT") {
            alert("Chỉ học sinh mới có thể đăng ký học phần.");
            router.replace("/student");
            return;
        }
        
        loadTutors();
    }, [router]);

    // Set default date to today
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
    }, []);

    // Load tutors
    const loadTutors = async () => {
        try {
            setLoading(true);
            setError(null);
            const tutorsList = await apiCall<Tutor[]>("/api/sessions/tutors");
            if (tutorsList && Array.isArray(tutorsList)) {
                setTutors(tutorsList);
                if (tutorsList.length > 0 && !selectedTutor) {
                    setSelectedTutor(tutorsList[0].id);
                }
            } else {
                setTutors([]);
            }
        } catch (err: any) {
            console.error("Error loading tutors:", err);
            setError("Không thể tải danh sách giảng viên. Vui lòng thử lại.");
            setTutors([]);
        } finally {
            setLoading(false);
        }
    };

    // Load available slots
    const loadSlots = useCallback(async (tutorId: number, date: string) => {
        if (!tutorId || !date) return;
        
        try {
            setLoadingSlots(true);
            setError(null);
            const slotsData = await apiCall<Slot[]>(
                `/api/sessions/available-slots?tutorId=${tutorId}&date=${date}`
            );
            if (slotsData && Array.isArray(slotsData)) {
                setSlots(slotsData);
            } else {
                setSlots([]);
            }
        } catch (err: any) {
            console.error("Error loading slots:", err);
            setError("Không thể tải danh sách slot. Vui lòng thử lại.");
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }, []);

    // Load slots when tutor or date changes
    useEffect(() => {
        if (selectedTutor && selectedDate) {
            loadSlots(selectedTutor, selectedDate);
        }
    }, [selectedTutor, selectedDate, loadSlots]);

    // Real-time polling to update slot status
    useEffect(() => {
        if (selectedTutor && selectedDate && !pollingInterval) {
            const interval = setInterval(() => {
                if (selectedTutor && selectedDate) {
                    loadSlots(selectedTutor, selectedDate);
                }
            }, 3000); // Poll every 3 seconds
            setPollingInterval(interval);
            
            return () => {
                if (interval) {
                    clearInterval(interval);
                }
            };
        }
    }, [selectedTutor, selectedDate, loadSlots, pollingInterval]);

    // Book a slot
    const handleBookSlot = async (slot: Slot) => {
        if (!slot.available) {
            alert("Slot này không còn trống!");
            return;
        }

        if (!selectedTutor) {
            alert("Vui lòng chọn giảng viên!");
            return;
        }

        setBookingSlot(slot.scheduledDate);
        setError(null);
        setSuccess(null);

        try {
            const [datePart, timePart] = slot.scheduledDate.split('T');
            const time = timePart.substring(0, 5); // HH:mm format

            const requestData = {
                tutorId: selectedTutor,
                date: datePart,
                time: time,
                method: method,
                subject: subject,
                note: note || null,
            };

            const response = await apiCall<any>("/api/sessions/book", {
                method: "POST",
                body: JSON.stringify(requestData),
            });

            setSuccess(`Đăng ký học phần thành công! Slot ${slot.time} ngày ${new Date(selectedDate).toLocaleDateString("vi-VN")} đã được đặt.`);
            setBookingSlot(null);
            
            // Reload slots immediately
            await loadSlots(selectedTutor, selectedDate);
            
            // Clear form
            setNote("");
        } catch (err: any) {
            console.error("Error booking slot:", err);
            const errorMessage = err.message || "Không thể đăng ký học phần. Vui lòng thử lại.";
            
            if (errorMessage.includes("đã bị người khác đăng ký") || 
                errorMessage.includes("trùng thời gian") ||
                errorMessage.includes("CONFLICT")) {
                setError("⚠️ Slot này đã bị người khác đăng ký! Đang cập nhật danh sách...");
                // Reload slots immediately
                setTimeout(() => {
                    loadSlots(selectedTutor!, selectedDate);
                }, 500);
            } else {
                setError(errorMessage);
            }
            setBookingSlot(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-900 via-[#5e1f12] to-[#3b0c12] text-orange-50">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-black/40 backdrop-blur">
                <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-extrabold text-xl text-orange-400">
                            MathBridge
                        </span>
                        <span className="text-sm text-orange-300/80 hidden sm:inline">
                            | Đăng ký học phần
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

            <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
                {/* Success message */}
                {success && (
                    <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 text-green-100">
                        <p className="font-semibold">✓ {success}</p>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 text-red-100">
                        <p className="font-semibold">{error}</p>
                    </div>
                )}

                {/* Form chọn giảng viên và ngày */}
                <section className="bg-black/40 rounded-2xl shadow p-5">
                    <h1 className="text-2xl font-extrabold text-orange-400 mb-4">
                        Đăng ký học phần
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-orange-300/80 mb-1 text-sm">
                                Chọn giảng viên
                            </label>
                            {loading ? (
                                <div className="text-orange-200/60 text-sm">Đang tải...</div>
                            ) : tutors.length === 0 ? (
                                <div className="text-red-300 text-sm">Không có giảng viên nào</div>
                            ) : (
                                <select
                                    value={selectedTutor || ""}
                                    onChange={(e) => setSelectedTutor(parseInt(e.target.value))}
                                    className="w-full bg-transparent border border-orange-700 rounded-md px-3 py-2 focus:outline-none focus:border-orange-400"
                                >
                                    {tutors.map((tutor) => (
                                        <option key={tutor.id} value={tutor.id} className="bg-gray-900">
                                            {tutor.fullName || tutor.email} 
                                            {tutor.hourlyRate > 0 && ` - ${formatCurrency(tutor.hourlyRate)}/giờ`}
                                            {tutor.rating > 0 && ` ⭐ ${tutor.rating.toFixed(1)}`}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-orange-300/80 mb-1 text-sm">
                                Chọn ngày học
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full bg-transparent border border-orange-700 rounded-md px-3 py-2 focus:outline-none focus:border-orange-400 [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Thông tin giảng viên được chọn */}
                    {selectedTutor && tutors.find(t => t.id === selectedTutor) && (
                        <div className="mt-4 p-4 bg-black/30 rounded-lg border border-orange-700/50">
                            {(() => {
                                const tutor = tutors.find(t => t.id === selectedTutor)!;
                                return (
                                    <>
                                        <h3 className="font-semibold text-orange-200 mb-2">
                                            Thông tin giảng viên
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-orange-300/80">Tên: </span>
                                                <span className="text-orange-100">{tutor.fullName || tutor.email}</span>
                                            </div>
                                            {tutor.subjects && (
                                                <div>
                                                    <span className="text-orange-300/80">Môn dạy: </span>
                                                    <span className="text-orange-100">{tutor.subjects}</span>
                                                </div>
                                            )}
                                            {tutor.experience !== null && (
                                                <div>
                                                    <span className="text-orange-300/80">Kinh nghiệm: </span>
                                                    <span className="text-orange-100">{tutor.experience} năm</span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-orange-300/80">Học phí: </span>
                                                <span className="text-orange-100 font-semibold">
                                                    {formatCurrency(tutor.hourlyRate || 200000)}/giờ
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </section>

                {/* Cài đặt buổi học */}
                <section className="bg-black/40 rounded-2xl shadow p-5">
                    <h2 className="text-lg font-bold text-orange-300 mb-4">
                        Cài đặt buổi học
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-orange-300/80 mb-1 text-sm">
                                Môn học
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-transparent border border-orange-700 rounded-md px-3 py-2 focus:outline-none focus:border-orange-400"
                                placeholder="Ví dụ: Toán học"
                            />
                        </div>

                        <div>
                            <label className="block text-orange-300/80 mb-1 text-sm">
                                Hình thức học
                            </label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value as "online" | "offline")}
                                className="w-full bg-transparent border border-orange-700 rounded-md px-3 py-2 focus:outline-none focus:border-orange-400"
                            >
                                <option value="online" className="bg-gray-900">Online (Zoom / Google Meet)</option>
                                <option value="offline" className="bg-gray-900">Học trực tiếp</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-orange-300/80 mb-1 text-sm">
                                Ghi chú (tùy chọn)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                                className="w-full bg-transparent border border-orange-700 rounded-md px-3 py-2 focus:outline-none focus:border-orange-400"
                                placeholder="Ví dụ: Ôn chương Hàm số bậc nhất..."
                            />
                        </div>
                    </div>
                </section>

                {/* Danh sách slots */}
                {selectedTutor && selectedDate && (
                    <section className="bg-black/40 rounded-2xl shadow p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-orange-300">
                                Chọn giờ học - {formatDate(selectedDate)}
                            </h2>
                            {loadingSlots && (
                                <span className="text-xs text-orange-300/60 animate-pulse">
                                    Đang cập nhật...
                                </span>
                            )}
                        </div>

                        {loadingSlots && slots.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-orange-300">Đang tải danh sách slot...</p>
                            </div>
                        ) : slots.length === 0 ? (
                            <div className="text-center py-8 text-orange-200/80">
                                Không có slot nào khả dụng cho ngày này.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {slots.map((slot, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleBookSlot(slot)}
                                        disabled={!slot.available || bookingSlot === slot.scheduledDate}
                                        className={`
                                            p-3 rounded-lg border text-sm font-semibold transition-all
                                            ${slot.available
                                                ? bookingSlot === slot.scheduledDate
                                                    ? "bg-orange-600 border-orange-400 text-white cursor-wait"
                                                    : "bg-green-900/30 border-green-500/50 text-green-100 hover:bg-green-900/50 hover:border-green-400 cursor-pointer"
                                                : "bg-red-900/30 border-red-500/30 text-red-300/60 cursor-not-allowed opacity-60"
                                            }
                                        `}
                                    >
                                        <div className="text-center">
                                            <div className="text-base font-bold">{slot.time}</div>
                                            <div className="text-xs mt-1 opacity-80">
                                                {slot.available ? "Có thể đăng ký" : slot.status}
                                            </div>
                                            {bookingSlot === slot.scheduledDate && (
                                                <div className="text-xs mt-1 animate-pulse">
                                                    Đang xử lý...
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 text-xs text-orange-300/60">
                            💡 Hệ thống tự động cập nhật trạng thái slot mỗi 3 giây để tránh đăng ký trùng.
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}


