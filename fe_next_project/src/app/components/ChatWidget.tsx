"use client";

import { useEffect, useState } from "react";

type FAQ = { q: string; a: string };

const DEFAULT_FAQS: FAQ[] = [
  {
    q: "MathBridge là gì?",
    a: "Nền tảng quản lý & kết nối gia sư Toán cho học sinh THPT theo chương trình quốc tế (IGCSE, A-Level, IB, AP, SAT) và Toán nâng cao VN: đặt lịch, học online/offline, theo dõi tiến độ, thanh toán."
  },
  {
    q: "Làm sao tìm và chọn gia sư phù hợp?",
    a: "Lọc theo chương trình (IGCSE/IB/AP/…), khối lớp, chuyên đề và thời gian rảnh. Bạn có thể tự chọn gia sư hoặc dùng danh sách gợi ý theo lịch trống và xếp hạng."
  },
  {
    q: "Chương trình/khung học được hỗ trợ?",
    a: "Cambridge IGCSE, AS/A-Level, IB HL/SL, SAT Math, AP Calculus (AB/BC), và Toán nâng cao VN. Mỗi khối có syllabus/mục tiêu học tập đi kèm."
  },
  {
    q: "Hình thức học?",
    a: "Online qua Zoom/Google Meet (tự tạo link phiên học) hoặc offline tại điểm học/nhà học sinh theo thỏa thuận lịch và vị trí."
  },
  {
    q: "Quy trình đặt lịch buổi học?",
    a: "Chọn gia sư → chọn slot trống → xác nhận thời lượng/giá → thanh toán/giữ chỗ. Lịch hiển thị trong trang Lịch, kèm link học online nếu có."
  },
  {
    q: "Chính sách đổi lịch và hủy buổi?",
    a: "Có thể đổi/hủy trước 24 giờ để không mất phí. Hủy trễ hoặc vắng mặt có thể bị trừ phí theo chính sách gói."
  },
  {
    q: "Thanh toán và hóa đơn?",
    a: "Thanh toán trực tuyến qua cổng PSP (PayOS/đối tác tương đương). Webhook được ký số để đảm bảo an toàn. Có xuất hóa đơn theo yêu cầu."
  },
  {
    q: "Mua theo buổi hay theo khóa?",
    a: "Có cả hai: trả theo buổi, theo gói giờ, hoặc theo khóa chuyên đề. Số buổi linh hoạt theo mục tiêu và lịch của bạn."
  },
  {
    q: "Theo dõi tiến độ học?",
    a: "Hồ sơ học tập, điểm kiểm tra định kỳ, nhận xét theo outcome của syllabus và báo cáo tiến độ; có thể xuất PDF chia sẻ cho phụ huynh."
  },
  {
    q: "Đánh giá gia sư?",
    a: "Sau buổi học, bạn có thể chấm sao và để nhận xét. Hệ thống dùng đánh giá đã xác minh để xếp hạng gia sư."
  },
  {
    q: "Có buổi học thử không?",
    a: "Có thể sắp xếp buổi thử tùy gia sư. Phí thử (nếu có) sẽ hiển thị rõ trước khi xác nhận."
  },
  {
    q: "Tiêu chuẩn xác minh gia sư?",
    a: "Gia sư cung cấp bằng cấp/chứng chỉ liên quan, kinh nghiệm giảng dạy và được xét duyệt hồ sơ trước khi nhận lớp."
  },
  {
    q: "Yêu cầu kỹ thuật khi học online?",
    a: "Cần Internet ổn định, máy tính hoặc tablet có mic/camera. Link buổi học được tạo tự động và hiển thị trong chi tiết buổi."
  },
  {
    q: "Hỗ trợ và khiếu nại/hoàn tiền?",
    a: "Liên hệ hỗ trợ để mở ticket. Tranh chấp được đối soát theo điểm danh, lịch sử chat và chính sách hủy/đổi. Hoàn tiền/ghi có vào ví theo quy định gói."
  },
  {
    q: "Khác múi giờ có đặt lịch được không?",
    a: "Có. Lịch hiển thị theo múi giờ thiết bị của bạn và kiểm tra xung đột tự động giữa học sinh và gia sư."
  }
];

type Props = {
  schoolName?: string;
  hotline?: string;       // ví dụ: "0901 234 567"
  email?: string;         // ví dụ: "contact@mathbridge.io"
  zaloLink?: string;      // ví dụ: "https://zalo.me/xxxxxxxxx"
  address?: string;
  faqs?: FAQ[];
  primaryColor?: string;  // Tailwind class (vd: "bg-blue-600")
};

export default function ChatWidget({
  schoolName = "MathBridge",
  hotline = "0901 234 567",
  email = "support@mathbridge.io",
  zaloLink = "",
  address = "—",
  faqs = DEFAULT_FAQS,
  primaryColor = "bg-blue-600"
}: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("chat_widget_open");
    if (saved) setOpen(saved === "1");
  }, []);

  useEffect(() => {
    localStorage.setItem("chat_widget_open", open ? "1" : "0");
  }, [open]);

  return (
    <>
      {/* Nút nổi */}
      <button
        aria-label={open ? "Đóng hộp chat" : "Mở hộp chat"}
        onClick={() => setOpen((v) => !v)}
        className={`fixed z-50 bottom-4 right-4 rounded-full shadow-lg text-white ${primaryColor} hover:opacity-90 transition-colors w-14 h-14 flex items-center justify-center`}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 5V5z"
                stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {/* Hộp chat */}
      {open && (
        <div
          role="dialog"
          aria-label="Hộp chat hỗ trợ"
          className="fixed z-50 bottom-20 right-4 w-[360px] max-w-[92vw] rounded-2xl shadow-2xl border border-white/10 bg-neutral-900 text-neutral-100 overflow-hidden"
        >
          {/* Header */}
          <div className={`px-4 py-3 flex items-center justify-between ${primaryColor} text-white`}>
            <div className="font-semibold">Trợ lý {schoolName}</div>
            <button onClick={() => setOpen(false)} aria-label="Đóng" className="opacity-90 hover:opacity-100">✕</button>
          </div>

          {/* Nội dung */}
          <div className="p-4 space-y-4">
            {/* Liên hệ nhanh */}
            <section className="rounded-xl border border-white/10 p-3 bg-white/5">
              <h3 className="font-medium mb-2">Liên hệ nhanh</h3>
              <ul className="text-sm space-y-1">
                <li><span className="opacity-70">Hotline:</span> <a href={`tel:${hotline}`} className="underline">{hotline}</a></li>
                <li><span className="opacity-70">Email:</span> <a href={`mailto:${email}`} className="underline">{email}</a></li>
                {zaloLink && (
                  <li><span className="opacity-70">Zalo:</span> <a href={zaloLink} target="_blank" className="underline">Chat Zalo</a></li>
                )}
                {address !== "—" && <li><span className="opacity-70">Địa chỉ:</span> {address}</li>}
                <li><span className="opacity-70">Giờ làm việc:</span> 08:00–21:00 (T2–CN)</li>
              </ul>

              <div className="mt-3 flex gap-2">
                <a href={`tel:${hotline}`} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm">Gọi ngay</a>
                <a href={`mailto:${email}`} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm">Gửi email</a>
                {zaloLink && (
                  <a href={zaloLink} target="_blank" className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm">Mở Zalo</a>
                )}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h3 className="font-medium mb-2">Câu hỏi thường gặp</h3>
              <div className="space-y-2">
                {faqs.map((item, idx) => {
                  const isOpen = expanded === idx;
                  return (
                    <div key={idx} className="rounded-xl border border-white/10 bg-white/5">
                      <button
                        className="w-full text-left px-3 py-2 flex items-center justify-between"
                        onClick={() => setExpanded(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm font-medium">{item.q}</span>
                        <span className="text-lg leading-none">{isOpen ? "–" : "+"}</span>
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 text-sm opacity-90">{item.a}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <p className="text-xs opacity-70">
              Không thấy câu trả lời phù hợp? Gọi hotline hoặc nhắn Zalo để được hỗ trợ nhanh.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
