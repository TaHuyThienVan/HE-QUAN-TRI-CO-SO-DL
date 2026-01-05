"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Feedback, getAllFeedbacks, apiCall } from "@/lib/api";

const PAYMENT_QR_KEY = "mathbridgePaymentQr";
const PAYMENT_QR_UPDATED_AT_KEY = "mathbridgePaymentQrUpdatedAt";
const PAYMENT_STATUS_KEY = "mathbridgePaymentStatus";
const PAYMENT_STATUS_AT_KEY = "mathbridgePaymentStatusAt";
const PAYMENT_AMOUNT_KEY = "mathbridgePaymentAmount";
const PAYMENT_AMOUNT_UPDATED_AT_KEY = "mathbridgePaymentAmountUpdatedAt";

export default function TeacherProfile() {
  const router = useRouter();
  const [teacher, setTeacher] = useState({
    employeeId: "",
    name: "",
    dob: "",
    gender: "",
    department: "",
    title: "",
    degree: "",
    teachGrades: "",
    email: "",
    phone: "",
    office: "",
  });

  const [photo, setPhoto] = useState<string | null>(null);
  const [paymentQr, setPaymentQr] = useState<string | null>(null);
  const [qrUpdatedAt, setQrUpdatedAt] = useState<string | null>(null);
  const [qrUploading, setQrUploading] = useState(false);
  const [qrMessage, setQrMessage] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentAmountUpdatedAt, setPaymentAmountUpdatedAt] = useState<string | null>(null);
  const [latestPaymentStatus, setLatestPaymentStatus] = useState<"idle" | "success">("idle");
  const [latestPaymentStatusAt, setLatestPaymentStatusAt] = useState<string | null>(null);
  const [teacherEmail, setTeacherEmail] = useState("");
  const [lastLoginAt, setLastLoginAt] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState("ALL");
  const [filterRating, setFilterRating] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedEmail = localStorage.getItem("teacherEmail");
    const storedLogin = localStorage.getItem("teacherLastLogin");
    const storedQr = localStorage.getItem(PAYMENT_QR_KEY);
    const storedQrUpdated = localStorage.getItem(PAYMENT_QR_UPDATED_AT_KEY);
    const storedStatus = localStorage.getItem(PAYMENT_STATUS_KEY);
    const storedStatusAt = localStorage.getItem(PAYMENT_STATUS_AT_KEY);
    const storedAmount = localStorage.getItem(PAYMENT_AMOUNT_KEY);
    const storedAmountAt = localStorage.getItem(PAYMENT_AMOUNT_UPDATED_AT_KEY);

    if (!storedEmail) {
      router.replace("/login-teacher");
      return;
    }

    setTeacherEmail(storedEmail);
    setTeacher((prev) => ({ ...prev, email: storedEmail }));

    if (storedLogin) {
      setLastLoginAt(storedLogin);
    }

    if (storedQr) {
      setPaymentQr(storedQr);
    }

    if (storedQrUpdated) {
      setQrUpdatedAt(storedQrUpdated);
    }

    if (storedStatus === "success") {
      setLatestPaymentStatus("success");
      setLatestPaymentStatusAt(storedStatusAt);
    }

    if (storedAmount) {
      setPaymentAmount(storedAmount);
      setPaymentAmountUpdatedAt(storedAmountAt);
    }
  }, [router]);

  // Payment config loading - commented out as fetchPaymentConfig is not defined
  // const loadPaymentConfig = useCallback(async () => {
  //   setPaymentLoading(true);
  //   try {
  //     const data = await fetchPaymentConfig();
  //     setPaymentConfig(data);
  //     setQrMessage(null);
  //   } catch (err: unknown) {
  //     setQrMessage(err instanceof Error ? err.message : "Không thể tải thông tin thanh toán.");
  //   } finally {
  //     setPaymentLoading(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   loadPaymentConfig();
  // }, [loadPaymentConfig]);

  const fetchFeedbacks = useCallback(async () => {
    setFeedbackLoading(true);
    setFeedbackError(null);

    try {
      const data = await getAllFeedbacks();
      setFeedbacks(data);
      setLastSyncedAt(new Date().toISOString());
    } catch (err: unknown) {
      setFeedbackError(err instanceof Error ? err.message : "Không thể tải danh sách feedback. Vui lòng thử lại.");
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Load tutor data when component mounts
  useEffect(() => {
    const loadTutorData = async () => {
      if (!teacherEmail) return;
      
      try {
        setLoading(true);
        const result = await apiCall<any>("/api/tutors/me", {
          method: "GET",
        });
        
        // Check if result is valid and has data
        if (result && (result.employeeId || result.id || result.user)) {
          // Format dob from LocalDate to string (YYYY-MM-DD for input type="date")
          let dobString = "";
          if (result.dob) {
            // If dob is a string, use it directly; if it's a date object, format it
            if (typeof result.dob === 'string') {
              dobString = result.dob;
            } else if (result.dob.year && result.dob.month && result.dob.day) {
              // Handle LocalDate object from backend
              const year = result.dob.year;
              const month = String(result.dob.monthValue || result.dob.month).padStart(2, '0');
              const day = String(result.dob.dayOfMonth || result.dob.day).padStart(2, '0');
              dobString = `${year}-${month}-${day}`;
            }
          }
          
          // Debug: Log the result to see what we're getting
          console.log("Loaded tutor data from backend:", {
            qualification: result.qualification,
            title: result.title,
            degree: result.degree,
            subjects: result.subjects,
            gender: result.gender,
            office: result.office,
            dob: result.dob,
            fullName: result.fullName,
            phone: result.phone,
            user: result.user
          });
          
          // Normalize and match values with options
          const normalizedDepartment = normalizeAndMatch(result.qualification, departments);
          const normalizedTitle = normalizeAndMatch(result.title, titles);
          const normalizedDegree = normalizeAndMatch(result.degree, degrees);
          const normalizedTeachGrades = normalizeAndMatch(result.subjects, teachGradeOptions);
          
          // Try multiple ways to get fullName and phone
          const fullName = result.fullName || result.user?.fullName || "";
          const phone = result.phone || result.user?.phone || "";
          
          console.log("Extracted values:", {
            fullName: fullName,
            phone: phone,
            resultFullName: result.fullName,
            resultPhone: result.phone,
            userFullName: result.user?.fullName,
            userPhone: result.user?.phone
          });
          
          // Map backend data to frontend format
          setTeacher({
            employeeId: result.employeeId || "",
            name: fullName,
            dob: dobString,
            gender: result.gender || "",
            department: normalizedDepartment,
            title: normalizedTitle,
            degree: normalizedDegree,
            teachGrades: normalizedTeachGrades,
            email: result.email || result.user?.email || teacherEmail,
            phone: phone,
            office: result.office || "",
          });
          
          // Debug: Log what we're setting
          console.log("Setting teacher state:", {
            originalDepartment: result.qualification,
            normalizedDepartment,
            originalTitle: result.title,
            normalizedTitle,
            originalDegree: result.degree,
            normalizedDegree,
            originalTeachGrades: result.subjects,
            normalizedTeachGrades,
          });
          
          // Load avatar
          if (result.avatar) {
            setPhoto(result.avatar);
          }
          
          setEditMode(false);
        } else {
          // No tutor data found (empty object or null), keep edit mode enabled
          setEditMode(true);
        }
      } catch (err: unknown) {
        console.error("Load tutor data failed:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        
        // If unauthorized, redirect to login
        if (errorMessage.includes("401") || errorMessage.includes("đăng nhập") || errorMessage.includes("Unauthorized")) {
          router.push("/login-teacher");
          return;
        }
        
        // If 404 or 204, it means no tutor data exists yet - allow user to create
        if (errorMessage.includes("404") || errorMessage.includes("204") || errorMessage.includes("No Content")) {
          setEditMode(true);
        } else {
          // Other errors - show message but allow editing
          console.warn("Could not load tutor data, but allowing edit mode:", errorMessage);
          setEditMode(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTutorData();
  }, [teacherEmail, router]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleStorage = (event: StorageEvent) => {
      if (event.key === PAYMENT_QR_KEY) {
        setPaymentQr(event.newValue);
      }
      if (event.key === PAYMENT_QR_UPDATED_AT_KEY) {
        setQrUpdatedAt(event.newValue);
      }
      if (event.key === PAYMENT_STATUS_KEY) {
        if (event.newValue === "success") {
          setLatestPaymentStatus("success");
          setLatestPaymentStatusAt(localStorage.getItem(PAYMENT_STATUS_AT_KEY));
        } else {
          setLatestPaymentStatus("idle");
          setLatestPaymentStatusAt(null);
        }
      }
      if (event.key === PAYMENT_AMOUNT_KEY) {
        setPaymentAmount(event.newValue || "");
      }
      if (event.key === PAYMENT_AMOUNT_UPDATED_AT_KEY) {
        setPaymentAmountUpdatedAt(event.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const courseOptions = useMemo(() => {
    const unique = new Set<string>();
    feedbacks.forEach((fb) => {
      if (fb.course) unique.add(fb.course);
    });
    return Array.from(unique);
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      const matchCourse = filterCourse === "ALL" || fb.course === filterCourse;
      const matchRating = filterRating === "ALL" || fb.rating === Number(filterRating);
      const matchKeyword =
        !searchKeyword ||
        fb.comments.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        fb.teacher.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (fb.name ?? "").toLowerCase().includes(searchKeyword.toLowerCase());

      return matchCourse && matchRating && matchKeyword;
    });
  }, [feedbacks, filterCourse, filterRating, searchKeyword]);

  const averageRating = useMemo(() => {
    if (!feedbacks.length) return 0;
    const sum = feedbacks.reduce((acc, fb) => acc + fb.rating, 0);
    return Number((sum / feedbacks.length).toFixed(1));
  }, [feedbacks]);

  const formattedLastLogin = useMemo(() => {
    if (!lastLoginAt) return null;
    const date = new Date(lastLoginAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("vi-VN", { hour12: false });
  }, [lastLoginAt]);

  const formattedLastSyncedAt = useMemo(() => {
    if (!lastSyncedAt) return null;
    const date = new Date(lastSyncedAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("vi-VN", { hour12: false });
  }, [lastSyncedAt]);

  const formatDateLabel = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatDateTimeLabel = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("vi-VN", { hour12: false });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTeacher((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrUploading(true);
    setQrMessage(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const timestamp = new Date().toISOString();
      setPaymentQr(result);
      setQrUpdatedAt(timestamp);
      setQrMessage("Đã đăng tải mã QR mới, học sinh có thể quét ngay.");

      if (typeof window !== "undefined") {
        localStorage.setItem(PAYMENT_QR_KEY, result);
        localStorage.setItem(PAYMENT_QR_UPDATED_AT_KEY, timestamp);
        localStorage.removeItem(PAYMENT_STATUS_KEY);
        localStorage.removeItem(PAYMENT_STATUS_AT_KEY);
      }

      setLatestPaymentStatus("idle");
      setLatestPaymentStatusAt(null);

      setQrUploading(false);
    };

    reader.onerror = () => {
      setQrMessage("Không thể đọc tệp. Vui lòng thử lại.");
      setQrUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const clearPaymentQr = () => {
    setPaymentQr(null);
    setQrUpdatedAt(null);
    setQrMessage("Đã gỡ mã QR khỏi hệ thống.");
    setLatestPaymentStatus("idle");
    setLatestPaymentStatusAt(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(PAYMENT_QR_KEY);
      localStorage.removeItem(PAYMENT_QR_UPDATED_AT_KEY);
      localStorage.removeItem(PAYMENT_STATUS_KEY);
      localStorage.removeItem(PAYMENT_STATUS_AT_KEY);
    }
  };

  const acknowledgePayment = () => {
    setLatestPaymentStatus("idle");
    setLatestPaymentStatusAt(null);
    setQrMessage("Đã xác nhận thanh toán từ học sinh.");
    if (typeof window !== "undefined") {
      localStorage.removeItem(PAYMENT_STATUS_KEY);
      localStorage.removeItem(PAYMENT_STATUS_AT_KEY);
    }
  };

  const handlePaymentAmountChange = (value: string) => {
    setPaymentAmount(value);
    const timestamp = new Date().toISOString();
    setPaymentAmountUpdatedAt(timestamp);
    if (typeof window !== "undefined") {
      localStorage.setItem(PAYMENT_AMOUNT_KEY, value);
      localStorage.setItem(PAYMENT_AMOUNT_UPDATED_AT_KEY, timestamp);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacher.name.trim()) {
      alert("Vui lòng nhập họ và tên!");
      return;
    }

    try {
      // Convert dob string to LocalDate format (YYYY-MM-DD)
      let dobValue = null;
      if (teacher.dob && teacher.dob.trim()) {
        // Ensure format is YYYY-MM-DD
        const dateParts = teacher.dob.split('/');
        if (dateParts.length === 3) {
          // Convert from DD/MM/YYYY to YYYY-MM-DD
          dobValue = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        } else {
          // Already in YYYY-MM-DD format
          dobValue = teacher.dob;
        }
      }
      
      // Filter out empty strings and placeholder values
      const filterValue = (value: string | null | undefined) => {
        if (!value || value.trim() === "" || value.includes("-- Chọn")) {
          return null;
        }
        return value;
      };
      
      const payload = {
        fullName: teacher.name.trim(), // Always send fullName if provided
        dob: dobValue,
        gender: filterValue(teacher.gender),
        department: filterValue(teacher.department), // This will be mapped to qualification in backend
        title: filterValue(teacher.title),
        degree: filterValue(teacher.degree),
        teachGrades: filterValue(teacher.teachGrades), // This will be mapped to subjects in backend
        email: teacher.email || teacherEmail,
        phone: teacher.phone && teacher.phone.trim() ? teacher.phone.trim() : null, // Send phone even if empty, but as null
        office: filterValue(teacher.office),
        avatar: photo || null,
        qualification: filterValue(teacher.department), // Keep for backward compatibility
        subjects: filterValue(teacher.teachGrades), // Keep for backward compatibility
        experience: 0,
      };
      
      console.log("Payload being sent:", payload);
      console.log("FullName:", payload.fullName);
      console.log("Phone:", payload.phone);
      
      console.log("Saving tutor payload:", payload);

      const result = await apiCall<any>("/api/tutors", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      console.log("Tutor saved successfully:", result);
      setEditMode(false);
      alert("Đã lưu thông tin giảng viên vào CSDL.");
      
      // Reload tutor data to get the latest from server
      try {
        const reloaded = await apiCall<any>("/api/tutors/me", {
          method: "GET",
        });
        
        console.log("Reloaded tutor data:", reloaded);
        console.log("User data:", reloaded?.user);
        console.log("FullName from reloaded:", reloaded?.user?.fullName);
        console.log("FullName from tutor.getFullName():", reloaded?.fullName);
        
        if (reloaded) {
          // Format dob from LocalDate to string (YYYY-MM-DD for input type="date")
          let dobString = "";
          if (reloaded.dob) {
            // If dob is a string, use it directly; if it's a date object, format it
            if (typeof reloaded.dob === 'string') {
              dobString = reloaded.dob;
            } else if (reloaded.dob.year && reloaded.dob.month && reloaded.dob.day) {
              // Handle LocalDate object from backend
              const year = reloaded.dob.year;
              const month = String(reloaded.dob.monthValue || reloaded.dob.month).padStart(2, '0');
              const day = String(reloaded.dob.dayOfMonth || reloaded.dob.day).padStart(2, '0');
              dobString = `${year}-${month}-${day}`;
            }
          }
          
          // Normalize and match values with options
          const normalizedDepartment = normalizeAndMatch(reloaded.qualification, departments);
          const normalizedTitle = normalizeAndMatch(reloaded.title, titles);
          const normalizedDegree = normalizeAndMatch(reloaded.degree, degrees);
          const normalizedTeachGrades = normalizeAndMatch(reloaded.subjects, teachGradeOptions);
          
          // Try multiple ways to get fullName and phone
          const fullName = reloaded.fullName || reloaded.user?.fullName || reloaded.user?.full_name || "";
          const phone = reloaded.phone || reloaded.user?.phone || "";
          
          console.log("Reloaded values after save:", {
            fullName: fullName,
            phone: phone,
            reloadedFullName: reloaded.fullName,
            reloadedPhone: reloaded.phone,
            userFullName: reloaded.user?.fullName,
            userPhone: reloaded.user?.phone
          });
          
          console.log("Setting teacher name to:", fullName);
          console.log("Setting teacher phone to:", phone);
          
          setTeacher({
            employeeId: reloaded.employeeId || "",
            name: fullName,
            dob: dobString,
            gender: reloaded.gender || "",
            department: normalizedDepartment,
            title: normalizedTitle,
            degree: normalizedDegree,
            teachGrades: normalizedTeachGrades,
            email: reloaded.email || reloaded.user?.email || teacherEmail,
            phone: phone,
            office: reloaded.office || "",
          });
          if (reloaded.avatar) {
            setPhoto(reloaded.avatar);
          }
        }
      } catch (reloadErr) {
        console.warn("Could not reload tutor data after save:", reloadErr);
        // Don't show error to user as save was successful
      }
    } catch (err: unknown) {
      console.error("Save tutor failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Lưu thất bại. Vui lòng thử lại.";
      alert(errorMessage);
    }
  };

  const departments = [
    "Công nghệ thông tin",
    "Khoa học máy tính",
    "Hệ thống thông tin",
    "Kỹ thuật phần mềm",
    "An toàn thông tin",
    "Trí tuệ nhân tạo",
    "Khác",
  ];

  const titles = [
    "Trợ giảng",
    "Giảng viên",
    "Giảng viên chính",
    "Phó giáo sư",
    "Giáo sư",
  ];

  const degrees = ["Cử nhân", "Kỹ sư", "Thạc sĩ", "Tiến sĩ"];

  // Helper function to normalize and match values with options
  const normalizeAndMatch = (value: string | null | undefined, options: string[]): string => {
    if (!value || value.trim() === "") return "";
    
    // Try exact match first
    if (options.includes(value)) return value;
    
    // Fix common encoding issues
    let normalized = value
      .replace(/Công ngh\? thôn/g, 'Công nghệ thông')
      .replace(/L\?p/g, 'Lớp')
      .replace(/Qu\?n/g, 'Quận');
    
    // Try case-insensitive match
    const caseInsensitiveMatch = options.find(opt => 
      opt.toLowerCase() === normalized.toLowerCase()
    );
    if (caseInsensitiveMatch) return caseInsensitiveMatch;
    
    // Try partial match (remove special characters and compare)
    const normalizeForMatch = (s: string) => 
      s.replace(/[^\w\s]/g, '').toLowerCase().trim();
    
    const partialMatch = options.find(opt => {
      const optNormalized = normalizeForMatch(opt);
      const valNormalized = normalizeForMatch(normalized);
      return optNormalized === valNormalized || 
             optNormalized.includes(valNormalized) ||
             valNormalized.includes(optNormalized);
    });
    if (partialMatch) return partialMatch;
    
    // Try to find by number or key words
    const keywordMatch = options.find(opt => {
      // Extract numbers from both
      const optNums = opt.match(/\d+/g) || [];
      const valNums = normalized.match(/\d+/g) || [];
      if (optNums.length > 0 && valNums.length > 0) {
        return optNums.some(n => valNums.includes(n));
      }
      // Check if key words match
      const optWords = normalizeForMatch(opt).split(/\s+/);
      const valWords = normalizeForMatch(normalized).split(/\s+/);
      return optWords.some(w => valWords.includes(w)) || 
             valWords.some(w => optWords.includes(w));
    });
    if (keywordMatch) return keywordMatch;
    
    // If no match found, return the original value (might display as-is)
    return normalized;
  };

  // Các khối / lớp giảng dạy cho môn Toán
  const teachGradeOptions = [
    "Lớp 6",
    "Lớp 7",
    "Lớp 8",
    "Lớp 9",
    "Lớp 10",
    "Lớp 11",
    "Lớp 12",
    "Lớp 6–9 (THCS)",
    "Lớp 10–12 (THPT)",
    "Lớp 6–12 (Toàn bộ)",
  ];

  const genders = ["Nam", "Nữ", "Khác"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0501] via-[#260803] to-[#140301] text-orange-50">
      {/* Thanh trên cùng (logo / tiêu đề) có thể reuse header chung nếu bạn có */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-orange-400">
            MathBridge
          </span>
          <span className="text-sm text-orange-100/70">
            | Quản lý hồ sơ giảng viên
          </span>
        </div>

        <Link
          href="/login"
          onClick={() => {
            // Clear all tokens and teacher data when logging out
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('expiredAt');
              localStorage.removeItem('teacherEmail');
              localStorage.removeItem('teacherLastLogin');
            }
          }}
          className="text-sm text-orange-100/80 hover:text-orange-300 underline-offset-4 hover:underline"
        >
          Đăng xuất
        </Link>
      </div>

      {teacherEmail && (
        <div className="max-w-6xl mx-auto px-4 -mt-2 mb-4 text-sm text-orange-100/70 flex flex-wrap gap-2">
          <span>Tài khoản: <span className="font-semibold text-orange-200">{teacherEmail}</span></span>
          {formattedLastLogin && (
            <span className="text-orange-200/70">• Lần đăng nhập gần nhất: {formattedLastLogin}</span>
          )}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 pb-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cột trái: avatar + nút tải ảnh (giống card Student) */}
          <div className="w-full lg:w-1/3">
            <div className="bg-[#2a1207] border border-orange-800/60 rounded-2xl p-6 flex flex-col items-center shadow-[0_0_30px_rgba(0,0,0,0.6)]">
              <div className="w-40 h-48 bg-[#1a0703] border border-orange-700 rounded-xl flex items-center justify-center overflow-hidden mb-4">
                {photo ? (
                  <Image
                    src={photo}
                    alt="Ảnh giảng viên"
                    width={160}
                    height={190}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <span className="text-sm text-orange-200/80 font-semibold">
                    Teacher
                  </span>
                )}
              </div>

              <span className="text-xs text-orange-200/70 mb-3">
                Chọn ảnh thẻ tại đây
              </span>

              <label className={`inline-flex items-center justify-center px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-400 text-sm font-semibold text-black shadow-lg shadow-orange-900/40 transition ${editMode ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={!editMode}
                  className="hidden"
                />
                <span>Tải ảnh lên</span>
              </label>

              {photo && (
                <p className="mt-3 text-[11px] text-orange-200/70 text-center">
                  Ảnh đã chọn sẽ được sử dụng trên thẻ giảng viên và lịch dạy.
                </p>
              )}
            </div>
          </div>

          {/* Cột phải: Form thông tin giảng viên */}
          <div className="w-full lg:w-2/3">
            <div className="bg-[#2a1207] border border-orange-800/60 rounded-2xl p-6 lg:p-8 shadow-[0_0_40px_rgba(0,0,0,0.65)] relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-orange-300">
                    Thông tin giảng viên
                  </h2>
                  <p className="text-sm text-orange-100/70 mt-1">
                    Vui lòng điền đầy đủ thông tin để quản lý lớp học toán.
                  </p>
                </div>

                {!editMode && (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#3c1b0b] text-orange-100 border border-orange-700 hover:bg-[#4a210f] transition"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mã GV + Họ tên */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-orange-100">
                      Mã giảng viên
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={teacher.employeeId}
                      onChange={handleChange}
                      placeholder="Mã giảng viên (tự động tạo)"
                      disabled
                      className="w-full h-11 rounded-lg bg-[#1a0703] border border-orange-700/70 px-3 text-sm text-orange-50 placeholder:text-orange-200/50 focus:outline-none focus:ring-2 focus:ring-orange-500 opacity-60 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-semibold text-orange-100">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={teacher.name}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên"
                      disabled={!editMode}
                      className="w-full h-11 rounded-lg bg-[#1a0703] border border-orange-700/70 px-3 text-sm text-orange-50 placeholder:text-orange-200/50 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ color: '#fef3c7' }}
                      required
                    />
                  </div>
                </div>

                {/* Ngày sinh + Giới tính */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-orange-100">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={teacher.dob}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="w-full h-11 rounded-lg bg-[#1a0703] border border-orange-700/70 px-3 text-sm text-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <p className="mt-1 text-[11px] text-orange-200/60">
                      Định dạng: dd/mm/yyyy (tùy theo trình duyệt).
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-semibold text-orange-100">
                      Giới tính
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={teacher.gender}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full h-11 rounded-lg bg-[#1a0703] border border-orange-700/70 pl-3 pr-9 text-sm text-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Chọn giới tính --</option>
                        {genders.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-orange-300">
                        ▼
                      </span>
                    </div>
                  </div>
                </div>

                {/* Khoa/Bộ môn + Văn phòng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-orange-100">
                      Khoa / Bộ môn
                    </label>
                    <div className="relative">
                      <select
                        name="department"
                        value={teacher.department}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full h-11 rounded-lg bg-[#1a0703] border border-orange-700/70 pl-3 pr-9 text-sm text-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="">-- Chọn khoa/bộ môn --</option>
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-orange-300">
                        ▼
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-semibold text-orange-100">
                      Văn phòng (phòng làm việc)
                    </label>
                    <input
                      type="text"
                      name="office"
                      value={teacher.office}
                      onChange={handleChange}
                      placeholder="Ví dụ: Phòng 402, nhà C"
                      disabled={!editMode}
                      className="w-full h-11 rounded-lg bg-[#1a0703] border border-orange-700/70 px-3 text-sm text-orange-50 placeholder:text-orange-200/50 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Chức danh + Học vị */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-orange-100">
                      Chức danh
                    </label>
                    <div className="relative">
                      <select
                        name="title"
                        value={teacher.title}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full h-11 rounded-lg bg-[#1a0703] border border-orange-700/70 pl-3 pr-9 text-sm text-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Chọn chức danh --</option>
                        {titles.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-orange-300">
                        ▼
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-semibold text-orange-100">
                      Học vị
                    </label>
                    <div className="relative">
                      <select
                        name="degree"
                        value={teacher.degree}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full h-11 rounded-lg bg-[#1a0703] border border-orange-700/70 pl-3 pr-9 text-sm text-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Chọn học vị --</option>
                        {degrees.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-orange-300">
                        ▼
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dạy khối lớp Toán */}
                <div>
                  <label className="block mb-1 text-sm font-semibold text-orange-100">
                    Dạy khối lớp (Toán)
                  </label>
                  <div className="relative">
                    <select
                      name="teachGrades"
                      value={teacher.teachGrades}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="w-full h-11 rounded-lg bg-[#1a0703] border border-orange-700/70 pl-3 pr-9 text-sm text-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">
                        -- Chọn khối / lớp giảng dạy (6–12) --
                      </option>
                      {teachGradeOptions.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-orange-300">
                      ▼
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-orange-200/60">
                    Ví dụ: giảng dạy Toán cho{" "}
                    <span className="font-semibold text-orange-200">
                      Lớp 6–12
                    </span>{" "}
                    nếu thầy/cô phụ trách nhiều khối.
                  </p>
                </div>

                {/* Email + Số điện thoại */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-orange-100">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={teacher.email}
                      onChange={handleChange}
                      placeholder="Nhập email liên hệ"
                      disabled={!editMode}
                      className="w-full h-11 rounded-lg bg-[#1a0703] border border-orange-700/70 px-3 text-sm text-orange-50 placeholder:text-orange-200/50 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-semibold text-orange-100">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={teacher.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                      disabled={!editMode}
                      className="w-full h-11 rounded-lg bg-[#1a0703] border border-orange-700/70 px-3 text-sm text-orange-50 placeholder:text-orange-200/50 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!editMode}
                  className="mt-4 w-full h-11 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-semibold shadow-[0_0_20px_rgba(248,148,80,0.7)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lưu thông tin
                </button>
              </form>
            </div>

            {/* Footer nút điều hướng giống style dashboard */}
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/teacher/dashboard"
                className="flex-1 min-w-[140px] text-center bg-[#2a1207] border border-orange-700/70 rounded-2xl py-3 text-sm font-semibold text-orange-100 hover:bg-[#38180b] transition shadow-md"
              >
                Quay lại
              </Link>

              <Link
                href="/home"
                className="flex-1 min-w-[140px] text-center bg-orange-500 hover:bg-orange-400 rounded-2xl py-3 text-sm font-semibold text-black shadow-[0_0_18px_rgba(248,148,80,0.7)] transition"
              >
                Tiếp theo
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-3xl border border-orange-800/60 bg-[#2a1207] p-6 shadow-[0_0_40px_rgba(0,0,0,0.65)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">Payment sync</p>
                <h3 className="text-2xl font-extrabold text-orange-200">Chia sẻ mã QR thanh toán</h3>
                <p className="text-sm text-orange-200/80">
                  Tải ảnh QR của ví điện tử/ ngân hàng (Momo, MB Bank, Vietcombank...) để học sinh quét trực tiếp trong trang Student.
                </p>
              </div>

              <div className="rounded-2xl border border-orange-700/70 bg-[#1b0703] p-4">
                <label className="text-sm font-semibold text-orange-100 mb-2 block">
                  Số tiền cần thanh toán (hiển thị cho học sinh)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={paymentAmount}
                    onChange={(e) => handlePaymentAmountChange(e.target.value)}
                    placeholder="Ví dụ: 1.500.000đ / tháng"
                    className="flex-1 rounded-lg border border-orange-700/60 bg-transparent px-3 py-2 text-orange-50 placeholder:text-orange-300/60 focus:outline-none focus:border-orange-400"
                  />
                </div>
                {paymentAmountUpdatedAt && (
                  <p className="mt-2 text-xs text-orange-200/70">
                    Cập nhật: {formatDateTimeLabel(paymentAmountUpdatedAt)}
                  </p>
                )}
              </div>

              {qrUpdatedAt && (
                <p className="text-xs text-orange-200/70">
                  Đã cập nhật: {formatDateTimeLabel(qrUpdatedAt)}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-black shadow cursor-pointer hover:bg-orange-400 transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePaymentQrUpload}
                  />
                  {qrUploading ? "Đang tải..." : "Tải mã QR"}
                </label>

                <button
                  type="button"
                  onClick={clearPaymentQr}
                  disabled={!paymentQr}
                  className="rounded-full border border-orange-600/70 px-5 py-2 text-sm font-semibold text-orange-100 hover:bg-[#3c1b0b] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Gỡ mã QR
                </button>

              </div>

              {qrMessage && (
                <div className="rounded-2xl border border-orange-700/60 bg-[#1b0703] px-4 py-3 text-sm text-orange-100">
                  {qrMessage}
                </div>
              )}

              {latestPaymentStatus === "success" && (
                <div className="rounded-2xl border border-emerald-500/50 bg-emerald-900/20 p-4 text-emerald-100 space-y-2">
                  <div>
                    <p className="text-lg font-semibold text-emerald-300">Học sinh đã báo thanh toán thành công</p>
                    <p className="text-sm">
                      Vui lòng kiểm tra giao dịch và nhấn &quot;Đánh dấu đã xác nhận&quot; sau khi hoàn tất đối soát.
                    </p>
                  </div>
                  {latestPaymentStatusAt && (
                    <p className="text-xs text-emerald-200/70">
                      Nhận lúc {formatDateTimeLabel(latestPaymentStatusAt)}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={acknowledgePayment}
                    className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition"
                  >
                    Đánh dấu đã xác nhận
                  </button>
                </div>
              )}

              <p className="text-xs text-orange-200/70">
                Mỗi lần tải mã mới, trạng thái thanh toán của học sinh sẽ được đặt lại để tránh nhầm lẫn.
              </p>
            </div>

            <div className="flex items-center justify-center">
              {paymentQr ? (
                <div className="rounded-3xl border border-orange-700/60 bg-[#1b0703] p-6 text-center">
                  <Image
                    src={paymentQr}
                    alt="QR thanh toán do giảng viên tải lên"
                    width={320}
                    height={320}
                    className="w-64 h-64 object-contain mx-auto"
                    unoptimized
                  />
                  <p className="mt-3 text-xs text-orange-200/70">
                    Ảnh QR này được hiển thị ngay tại thẻ &quot;Thanh toán học phí&quot; của cổng Student.
                  </p>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-orange-700/60 bg-[#1b0703] p-6 text-center text-sm text-orange-200/70 w-full">
                  Chưa có mã QR. Tải ảnh để đồng bộ với học sinh.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-orange-800/60 bg-[#2a1207] p-6 shadow-[0_0_40px_rgba(0,0,0,0.65)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-extrabold text-orange-200">Phản hồi từ học viên</h3>
              <p className="text-sm text-orange-100/70">
                {formattedLastSyncedAt
                  ? `Đã đồng bộ lần cuối lúc ${formattedLastSyncedAt}.`
                  : "Nhấn “Tải lại” để đồng bộ dữ liệu từ form Feedback."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={fetchFeedbacks}
                disabled={feedbackLoading}
                className="rounded-full border border-orange-600/60 bg-[#3c1b0b] px-5 py-2 text-sm font-semibold text-orange-100 transition hover:bg-[#4b210f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {feedbackLoading ? "Đang đồng bộ..." : "Tải lại"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-orange-800/60 bg-[#1b0703] p-4">
              <p className="text-xs uppercase tracking-widest text-orange-300/70">Tổng số</p>
              <p className="mt-2 text-3xl font-extrabold text-orange-200">{feedbacks.length}</p>
              <p className="text-sm text-orange-200/60">Feedback đã lưu</p>
            </div>

            <div className="rounded-2xl border border-orange-800/60 bg-[#1b0703] p-4">
              <p className="text-xs uppercase tracking-widest text-orange-300/70">Điểm trung bình</p>
              <p className="mt-2 text-3xl font-extrabold text-amber-300">{averageRating || "--"}</p>
              <p className="text-sm text-orange-200/60">/5 sao</p>
            </div>

            <div className="rounded-2xl border border-orange-800/60 bg-[#1b0703] p-4">
              <p className="text-xs uppercase tracking-widest text-orange-300/70">Đang hiển thị</p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-300">{filteredFeedbacks.length}</p>
              <p className="text-sm text-orange-200/60">Sau khi áp dụng bộ lọc</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-orange-200/80">Khoá học</label>
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
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-orange-200/80">Mức sao</label>
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
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-orange-200/80">Từ khoá</label>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Ví dụ: bài tập khó, lớp 9..."
                className="h-11 w-full rounded-xl border border-orange-700/60 bg-[#1b0703] px-3 text-sm text-orange-50 placeholder:text-orange-200/50 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
              />
            </div>
          </div>

          <div className="mt-6 max-h-[360px] space-y-4 overflow-y-auto pr-1">
            {feedbackLoading && (
              <div className="rounded-2xl border border-orange-800/60 bg-[#1b0703] p-6 text-center text-sm text-orange-200">
                Đang tải feedback từ máy chủ...
              </div>
            )}

            {!feedbackLoading && feedbackError && (
              <div className="rounded-2xl border border-red-500/50 bg-red-900/20 p-6 text-center text-sm text-red-200">
                {feedbackError}
              </div>
            )}

            {!feedbackLoading && !feedbackError && filteredFeedbacks.length === 0 && (
              <div className="rounded-2xl border border-orange-800/60 bg-[#1b0703] p-6 text-center text-sm text-orange-200">
                Chưa có phản hồi phù hợp với bộ lọc hiện tại.
              </div>
            )}

            {!feedbackLoading &&
              !feedbackError &&
              filteredFeedbacks.map((fb) => (
                <div key={fb.id} className="rounded-2xl border border-orange-800/60 bg-[#1b0703] p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-orange-300/80">{fb.course}</p>
                      <h4 className="text-xl font-semibold text-orange-50">Giảng viên: {fb.teacher}</h4>
                      <p className="text-sm text-orange-200/70">
                        {formatDateLabel(fb.date)} • {fb.mode || "Không rõ hình thức"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-black text-amber-300">
                        {fb.rating}
                        <span className="text-base font-semibold text-amber-100">/5</span>
                      </span>
                      {formatDateTimeLabel(fb.createdAt) && (
                        <p className="text-xs text-orange-200/60">Gửi lúc {formatDateTimeLabel(fb.createdAt)}</p>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-orange-50">{fb.comments}</p>

                  {fb.suggestions && (
                    <p className="mt-2 text-xs text-orange-200/80">
                      <span className="font-semibold text-orange-100">Góp ý:</span> {fb.suggestions}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-orange-200/80">
                    <span className="rounded-full border border-orange-700/70 px-3 py-1">
                      {fb.anonymous ? "Ẩn danh" : `Người gửi: ${fb.name || "Học viên"}`}
                    </span>
                    {fb.useful && (
                      <span className="rounded-full border border-orange-700/70 px-3 py-1">
                        Đánh giá hữu ích: {fb.useful === "yes" ? "Có" : "Chưa"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        ::placeholder {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
