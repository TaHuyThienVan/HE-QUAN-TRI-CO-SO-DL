"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api";

type CourseDTO = {
    id: number;
    name: string;
    capacity: number;
    registeredCount: number;
};

export default function BookSessionPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [registeredCourses, setRegisteredCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [registeringCourse, setRegisteringCourse] = useState<string | null>(null);
    const [courses, setCourses] = useState<CourseDTO[]>([]);

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
    }, [router]);

    // Load danh sách môn học đã đăng ký
    useEffect(() => {
        loadRegisteredCourses();
        loadAvailableCourses();
    }, []);

    // Load danh sách môn học đã đăng ký
    const loadRegisteredCourses = async () => {
        try {
            setLoadingCourses(true);
            const courses = await apiCall<any[]>("/api/course-registrations/me");
            if (courses && Array.isArray(courses)) {
                // Chỉ lấy các môn học có status REGISTERED và sắp xếp theo thời gian đăng ký mới nhất
                const activeCourses = courses
                    .filter(course => course.status === "REGISTERED")
                    .sort((a, b) => {
                        // Sắp xếp theo thời gian đăng ký (mới nhất trước)
                        const timeA = a.registeredAt ? new Date(a.registeredAt).getTime() : 0;
                        const timeB = b.registeredAt ? new Date(b.registeredAt).getTime() : 0;
                        return timeB - timeA;
                    });
                setRegisteredCourses(activeCourses);
                console.log("Loaded registered courses:", activeCourses.length);
            } else {
                setRegisteredCourses([]);
            }
        } catch (err: any) {
            console.error("Error loading registered courses:", err);
            setRegisteredCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    };

    const loadAvailableCourses = async () => {
        try {
            const data = await apiCall<CourseDTO[]>('/api/courses');
            if (Array.isArray(data)) setCourses(data);
        } catch (err) {
            console.error('Error loading courses', err);
        }
    };

    // Đăng ký môn học
    const handleRegisterCourse = async (courseName: string) => {
        // Kiểm tra xem đã đăng ký môn này chưa
        const alreadyRegistered = registeredCourses.some(
            course => course.courseName === courseName && course.status === "REGISTERED"
        );

        if (alreadyRegistered) {
            setError("Bạn đã đăng ký môn học này rồi!");
            setTimeout(() => setError(null), 5000);
            return;
        }

        setRegisteringCourse(courseName);
        setError(null);
        setSuccess(null);

        try {
            const requestData = {
                courseName: courseName,
                semester: null
            };

            const response = await apiCall<any>("/api/course-registrations", {
                method: "POST",
                body: JSON.stringify(requestData),
            });

            if (response && response.id) {
                // Hiển thị thông báo thành công bằng tiếng Việt
                const semesterInfo = response.semester ? ` (${response.semester})` : '';
                setSuccess(`✅ Đăng ký thành công! Môn học "${courseName}"${semesterInfo} đã được lưu vào danh sách học phần của bạn.`);
                
                // Reload danh sách môn học đã đăng ký ngay lập tức để hiển thị môn học mới
                // Đợi một chút để đảm bảo database đã cập nhật
                setTimeout(async () => {
                    await loadRegisteredCourses();
                    await loadAvailableCourses();
                }, 500);
                
                // Clear success message after 10 seconds
                setTimeout(() => {
                    setSuccess(null);
                }, 10000);
            } else {
                setError("❌ Đăng ký thất bại! Không nhận được phản hồi từ server. Vui lòng thử lại.");
                setTimeout(() => setError(null), 8000);
            }
        } catch (err: any) {
            console.error("Error registering course:", err);
            
            // Xử lý lỗi và hiển thị thông báo tiếng Việt rõ ràng
            let errorMessage = "❌ Đăng ký thất bại! Không thể đăng ký môn học. Vui lòng thử lại.";
            
            // Kiểm tra các loại lỗi khác nhau
            if (err.message) {
                const msg = err.message.trim();
                
                // Lỗi xác thực
                if (msg.includes("401") || msg.includes("Unauthorized") || msg.includes("đăng nhập") || msg.includes("hết hạn")) {
                    errorMessage = "❌ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
                    setTimeout(() => {
                        router.push("/login");
                    }, 3000);
                }
                // Lỗi quyền truy cập
                else if (msg.includes("403") || msg.includes("Forbidden") || msg.includes("học sinh") || msg.includes("quyền")) {
                    errorMessage = "❌ Chỉ học sinh mới có thể đăng ký môn học.";
                }
                // Lỗi đã đăng ký
                else if (msg.includes("đã đăng ký") || msg.includes("already registered") || msg.includes("rồi")) {
                    errorMessage = `❌ Bạn đã đăng ký môn học "${courseName}" rồi!`;
                }
                // Lỗi kết nối
                else if (msg.includes("Failed to fetch") || msg.includes("kết nối") || msg.includes("network") || msg.includes("ECONNREFUSED")) {
                    errorMessage = "❌ Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đã chạy.";
                }
                // Lỗi từ backend (tiếng Việt) - giữ nguyên message
                else if (msg.includes("Lỗi") || msg.includes("lỗi") || msg.includes("bắt buộc") || msg.includes("không") || msg.includes("thất bại")) {
                    // Nếu message đã có emoji, giữ nguyên; nếu không, thêm emoji
                    errorMessage = msg.startsWith("❌") || msg.startsWith("✅") ? msg : `❌ ${msg}`;
                }
                // Lỗi khác - thêm prefix nếu chưa có
                else {
                    errorMessage = msg.startsWith("❌") ? msg : `❌ ${msg}`;
                }
            } 
            // Kiểm tra error object
            else if (err.error) {
                const errMsg = typeof err.error === 'string' ? err.error : "Đăng ký thất bại! Vui lòng thử lại.";
                errorMessage = errMsg.startsWith("❌") ? errMsg : `❌ ${errMsg}`;
            }
            // Kiểm tra response error
            else if (err.response) {
                const responseData = err.response;
                if (responseData.error) {
                    errorMessage = responseData.error.startsWith("❌") ? responseData.error : `❌ ${responseData.error}`;
                } else if (responseData.message) {
                    errorMessage = responseData.message.startsWith("❌") ? responseData.message : `❌ ${responseData.message}`;
                }
            }
            
            setError(errorMessage);
            
            // Clear error message after 10 seconds
            setTimeout(() => {
                setError(null);
            }, 10000);
        } finally {
            setRegisteringCourse(null);
        }
    };

    // Kiểm tra môn học đã đăng ký chưa
    const isCourseRegistered = (courseName: string) => {
        return registeredCourses.some(
            course => course.courseName === courseName && course.status === "REGISTERED"
        );
    };

    const isCourseFull = (course: CourseDTO) => {
        return typeof course.registeredCount === 'number' && typeof course.capacity === 'number' && course.registeredCount >= course.capacity;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-900 via-[#5e1f12] to-[#3b0c12] text-orange-50">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-black/40 backdrop-blur border-b border-orange-800/50">
                <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-extrabold text-2xl text-orange-400">
                            MathBridge
                        </span>
                        <span className="text-sm text-orange-300/80 hidden sm:inline">
                            | Đăng ký học phần
                        </span>
                    </div>
                    <Link
                        href="/student"
                        className="text-sm font-semibold text-orange-300 hover:text-orange-200 hover:underline transition-colors"
                    >
                        ← Quay lại trang học sinh
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
                {/* Success message */}
                {success && (
                    <div className="bg-green-900/40 border-2 border-green-500/70 rounded-xl p-6 text-green-100 shadow-lg animate-pulse">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">✅</span>
                            <p className="font-semibold text-lg flex-1">{success}</p>
                            <button
                                onClick={() => setSuccess(null)}
                                className="text-green-200 hover:text-green-100 text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="bg-red-900/40 border-2 border-red-500/70 rounded-xl p-6 text-red-100 shadow-lg">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">❌</span>
                            <p className="font-semibold text-lg flex-1">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-200 hover:text-red-100 text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Tiêu đề */}
                <section className="bg-black/40 rounded-2xl shadow-xl p-6 border border-orange-800/50">
                    <h1 className="text-3xl font-extrabold text-orange-400 flex items-center gap-2 mb-2">
                        <span className="text-4xl">📚</span>
                        Đăng ký học phần
                    </h1>
                    <p className="text-orange-200/80">
                        Chọn môn học bạn muốn đăng ký cho kỳ này. Mỗi môn học chỉ có thể đăng ký một lần.
                    </p>
                </section>

                {/* Danh sách môn học */}
                <section className="bg-black/40 rounded-2xl shadow-xl p-6 border border-orange-800/50">
                    <h2 className="text-2xl font-extrabold text-orange-400 mb-6 flex items-center gap-2">
                        <span className="text-3xl">📖</span>
                        Danh sách môn học
                    </h2>

                    {loadingCourses ? (
                        <div className="text-center py-12">
                            <p className="text-orange-300 text-lg">Đang tải danh sách môn học...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map((c) => {
                                const isRegistered = isCourseRegistered(c.name);
                                const isRegistering = registeringCourse === c.name;
                                const full = isCourseFull(c);

                                return (
                                    <div
                                        key={c.id}
                                        className={`bg-gradient-to-br rounded-xl p-5 border-2 transition-all ${
                                            isRegistered
                                                ? "from-green-900/50 to-green-800/50 border-green-500/70"
                                                : "from-orange-900/50 to-orange-800/50 border-orange-700/50 hover:border-orange-500/70"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="font-bold text-orange-100 text-lg flex-1 pr-2">
                                                {c.name}
                                            </h3>
                                            {isRegistered && (
                                                <span className="text-xs px-3 py-1 bg-green-900/70 text-green-200 rounded-full whitespace-nowrap">
                                                    ✓ Đã đăng ký
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-orange-200/70">Đã đăng ký: {c.registeredCount}/{c.capacity}</p>

                                        {isRegistered ? (
                                            <div className="mt-4">
                                                <p className="text-sm text-green-200/80">
                                                    Bạn đã đăng ký môn học này rồi.
                                                </p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleRegisterCourse(c.name)}
                                                disabled={isRegistering || full}
                                                className={`w-full mt-4 px-4 py-3 rounded-lg font-semibold transition-all ${
                                                    isRegistering
                                                        ? "bg-orange-700/50 text-orange-300 cursor-wait"
                                                        : full
                                                            ? "bg-gray-600 text-gray-200 cursor-not-allowed"
                                                            : "bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl"
                                                }`}
                                            >
                                                {isRegistering ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <span className="animate-spin">⏳</span>
                                                        Đang đăng ký...
                                                    </span>
                                                ) : full ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <span>🔒</span>
                                                        Đã đủ chỗ
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <span>📝</span>
                                                        Đăng ký môn học này
                                                    </span>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Thông báo hướng dẫn */}
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-4 text-blue-100 text-sm">
                    <p className="font-semibold mb-1">💡 Hướng dẫn:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200/80">
                        <li>Chọn môn học bạn muốn đăng ký từ danh sách trên.</li>
                        <li>Nhấn nút "Đăng ký môn học này" để đăng ký.</li>
                        <li>Mỗi môn học chỉ có thể đăng ký một lần.</li>
                        <li>Danh sách môn học đã đăng ký sẽ hiển thị ở trang học sinh.</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
