"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";

// ====== TYPES ======
type Role = "admin" | "teacher" | "student";
type User = { id: string; name: string; email: string; role: Role; status: "active" | "inactive" };
type ClassItem = {
  id: string;
  name: string;
  teacher: string;
  students: number;          // sĩ số (đếm từ studentIds)
  schedule: string;
  status: "ongoing" | "finished";
  studentIds: string[];      // <<< NEW: danh sách học sinh trong lớp
};
type Payment = { id: string; user: string; amount: number; method: "Momo" | "Visa" | "Bank"; date: string; status: "success" | "pending" | "failed" };

// ====== MOCK DATA ======
const usersSeed: User[] = [
  { id: "U001", name: "Nguyễn An",   email: "an@example.com",   role: "admin",   status: "active" },
  { id: "U002", name: "Trần Bình",    email: "binh@example.com", role: "teacher", status: "active" },
  { id: "U003", name: "Lê Chi",       email: "chi@example.com",  role: "student", status: "active" },
  { id: "U004", name: "Phạm Dũng",    email: "dung@example.com", role: "student", status: "inactive" },
  { id: "U005", name: "Vũ Em",        email: "em@example.com",   role: "teacher", status: "active" },
  { id: "U006", name: "Hồ Gia",       email: "gia@example.com",  role: "student", status: "active" },
];

const classesSeed: ClassItem[] = [
  { id: "C101", name: "Toán 10 - Nâng cao", teacher: "Trần Bình", students: 2, schedule: "T2, T5 (19:00)", status: "ongoing",  studentIds: ["U003", "U006"] },
  { id: "C102", name: "Vật lý 11 - Luyện thi", teacher: "Vũ Em", students: 1, schedule: "T3, T6 (18:30)", status: "ongoing",  studentIds: ["U003"] },
  { id: "C103", name: "Hóa 12 - Tổng ôn", teacher: "Trần Bình", students: 0, schedule: "T7 (8:30)",      status: "finished", studentIds: [] },
];

const paymentsSeed: Payment[] = [
  { id: "P9001", user: "Nguyễn An", amount: 499000, method: "Visa", date: "2025-10-10", status: "success" },
  { id: "P9002", user: "Lê Chi", amount: 299000, method: "Momo", date: "2025-10-12", status: "pending" },
  { id: "P9003", user: "Phạm Dũng", amount: 299000, method: "Bank", date: "2025-10-05", status: "failed" },
  { id: "P9004", user: "Trần Bình", amount: 699000, method: "Visa", date: "2025-10-15", status: "success" },
  { id: "P9005", user: "Lê Chi", amount: 299000, method: "Momo", date: "2025-10-16", status: "success" },
];

// ====== HELPER ======
const currency = (n: number) => n.toLocaleString("vi-VN");
const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("vi-VN");
const uid = (p = "") => p + Math.random().toString(36).slice(2, 8).toUpperCase();

// ====== MAIN PAGE ======
export default function AdminDashboardPage() {
  const [tab, setTab] = useState<"users" | "classes" | "payments" | "reports">("classes");
  const [users] = useState<User[]>(usersSeed);
  const [classes, setClasses] = useState<ClassItem[]>(classesSeed);
  const [payments] = useState<Payment[]>(paymentsSeed);

  // KPI
  const kpis = useMemo(() => {
    const activeUsers = users.filter(u => u.status === "active").length;
    const revenue = payments.filter(p => p.status === "success").reduce((s, p) => s + p.amount, 0);
    const pending = payments.filter(p => p.status === "pending").length;
    const runningClasses = classes.filter(c => c.status === "ongoing").length;
    return { activeUsers, revenue, pending, runningClasses };
  }, [users, payments, classes]);

  // Đảm bảo đếm sĩ số theo studentIds (khi thêm lớp mới)
  useEffect(() => {
    setClasses(prev => prev.map(c => ({ ...c, students: c.studentIds.length })));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-50 to-rose-200">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-rose-700">Bảng điều khiển Admin</h1>
            <p className="text-gray-700">Quản lý người dùng • Lớp học • Thanh toán • Báo cáo</p>
          </div>
          <div className="flex gap-3">
            <Link href="/teacher/dashboard" className="inline-flex h-11 items-center justify-center rounded-full bg-rose-500 px-5 font-semibold text-white shadow hover:bg-rose-600">Trang chủ</Link>
            <Link 
              href="/login" 
              onClick={() => {
                // Clear all tokens and user data when logging out
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('token');
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('expiredAt');
                  localStorage.removeItem('teacherEmail');
                  localStorage.removeItem('teacherLastLogin');
                }
              }}
              className="inline-flex h-11 items-center justify-center rounded-full bg-orange-500 px-5 font-semibold text-white shadow hover:bg-orange-600"
            >
              Đăng xuất
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { key: "users", label: "Người dùng" },
            { key: "classes", label: "Lớp học" },
            { key: "payments", label: "Thanh toán" },
            { key: "reports", label: "Báo cáo" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={
                "rounded-full px-4 py-2 text-sm font-semibold shadow transition " +
                (tab === t.key ? "bg-rose-600 text-white" : "bg-white text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50")
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI label="Người dùng hoạt động" value={kpis.activeUsers.toString()} />
          <KPI label="Lớp đang chạy" value={kpis.runningClasses.toString()} />
          <KPI label="Doanh thu tháng (₫)" value={currency(kpis.revenue)} highlight />
          <KPI label="Thanh toán chờ" value={kpis.pending.toString()} />
        </div>

        <div className="mt-6">
          {tab === "users" && <UsersPanel data={users} />}
          {tab === "classes" && (
            <ClassesPanel
              data={classes}
              users={users}
              onCreate={(payload) => {
                const id = uid("C");
                const next: ClassItem = {
                  id,
                  name: payload.name,
                  teacher: payload.teacher,
                  schedule: payload.schedule,
                  status: "ongoing",
                  studentIds: payload.studentIds,
                  students: payload.studentIds.length,
                };
                setClasses((prev) => [next, ...prev]);
              }}
            />
          )}
          {tab === "payments" && <PaymentsPanel data={payments} />}
          {tab === "reports" && <ReportsPanel users={users} classes={classes} payments={payments} />}
        </div>
      </div>
    </div>
  );
}

// ====== SMALL COMPONENTS ======
function KPI({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={"rounded-2xl p-4 shadow-xl ring-1 " + (highlight ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-white text-gray-800 ring-rose-100")}>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
    </div>
  );
}

// ====== USERS ======
function UsersPanel({ data }: { data: User[] }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"" | Role>("");

  const filtered = useMemo(() => {
    return data.filter(u => {
      const hit =
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase()) ||
        u.id.toLowerCase().includes(q.toLowerCase());
      const roleOk = !role || u.role === role;
      return hit && roleOk;
    });
  }, [q, role, data]);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-rose-100">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Quản lý người dùng</h2>
          <p className="text-sm text-gray-600">Tổng: <strong>{data.length}</strong></p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên, email, ID…"
            className="h-10 w-full rounded-xl border border-rose-300 bg-white px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400 sm:w-64"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "" | Role)}
            className="h-10 w-full rounded-xl border border-rose-300 bg-white px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400 sm:w-40"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="teacher">Giáo viên</option>
            <option value="student">Học viên</option>
          </select>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-rose-50 text-rose-800">
            <tr>
              <Th>ID</Th>
              <Th>Tên</Th>
              <Th>Email</Th>
              <Th>Vai trò</Th>
              <Th>Trạng thái</Th>
              <Th className="text-right">Hành động</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-100">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-rose-50/40">
                <Td>{u.id}</Td>
                <Td className="font-semibold text-gray-900">{u.name}</Td>
                <Td className="text-gray-700">{u.email}</Td>
                <Td>
                  <Badge color={u.role === "admin" ? "amber" : u.role === "teacher" ? "rose" : "emerald"}>
                    {u.role}
                  </Badge>
                </Td>
                <Td>
                  <Badge color={u.status === "active" ? "emerald" : "slate"}>
                    {u.status === "active" ? "Đang hoạt động" : "Ngừng"}
                  </Badge>
                </Td>
                <Td className="text-right">
                  <button className="rounded-full bg-white px-3 py-1 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">
                    Sửa
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ====== CLASSES + CREATE MODAL ======
function ClassesPanel({
  data,
  users,
  onCreate,
}: {
  data: ClassItem[];
  users: User[];
  onCreate: (payload: { name: string; teacher: string; schedule: string; studentIds: string[] }) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-rose-100">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Quản lý lớp học</h2>
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600"
        >
          + Tạo lớp
        </button>
      </header>

      <CreateClassModal
        open={open}
        onClose={() => setOpen(false)}
        users={users}
        onSubmit={(payload) => {
          onCreate(payload);
          setOpen(false);
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.map((c) => {
          return (
            <div key={c.id} className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{c.name}</h3>
                <Badge color={c.status === "ongoing" ? "blue" : "slate"}>
                  {c.status === "ongoing" ? "Đang học" : "Kết thúc"}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">Giáo viên: <span className="font-medium">{c.teacher}</span></p>
              <p className="text-sm text-gray-700">Sĩ số: <span className="font-medium">{c.students}</span></p>
              <p className="text-sm text-gray-700">Lịch: {c.schedule}</p>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                  <span>Tiến độ</span>
                  <span>{c.status === "ongoing" ? "70%" : "100%"}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-rose-100">
                  <div
                    className={"h-2 rounded-full " + (c.status === "ongoing" ? "bg-rose-500" : "bg-emerald-500")}
                    style={{ width: c.status === "ongoing" ? "70%" : "100%" }}
                  />
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button className="rounded-full bg-white px-3 py-1 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">
                  Chi tiết
                </button>
                <button className="rounded-full bg-white px-3 py-1 text-orange-700 ring-1 ring-orange-200 hover:bg-orange-50">
                  Sửa
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CreateClassModal({
  open,
  onClose,
  users,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  users: User[];
  onSubmit: (payload: { name: string; teacher: string; schedule: string; studentIds: string[] }) => void;
}) {
  const teachers = users.filter(u => u.role === "teacher" && u.status === "active");
  const studentsAll = users.filter(u => u.role === "student" && u.status === "active");

  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState(teachers[0]?.name ?? "");
  const [schedule, setSchedule] = useState("T2, T5 (19:00)");
  const [q, setQ] = useState("");               // search học sinh
  const [selected, setSelected] = useState<string[]>([]); // user.id

  useEffect(() => {
    if (!open) {
      // reset khi đóng
      setName("");
      setTeacher(teachers[0]?.name ?? "");
      setSchedule("T2, T5 (19:00)");
      setQ("");
      setSelected([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const filtered = studentsAll.filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) ||
    s.email.toLowerCase().includes(q.toLowerCase()) ||
    s.id.toLowerCase().includes(q.toLowerCase())
  );

  const toggle = (id: string) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const submit = () => {
    if (!name.trim()) return alert("Vui lòng nhập tên lớp");
    if (!teacher.trim()) return alert("Vui lòng chọn giáo viên");
    onSubmit({ name: name.trim(), teacher: teacher.trim(), schedule: schedule.trim(), studentIds: selected });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-2">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-rose-100">
        <div className="flex items-center justify-between border-b border-rose-100 p-4">
          <h3 className="text-lg font-bold text-gray-900">Tạo lớp mới</h3>
          <button onClick={onClose} className="rounded-full px-3 py-1 text-sm text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">Đóng</button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Tên lớp</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Toán 10 - Học kỳ 1"
                className="h-11 w-full rounded-xl border border-rose-300 bg-white px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Giáo viên</label>
              <select
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="h-11 w-full rounded-xl border border-rose-300 bg-white px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Lịch học</label>
              <input
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="VD: T2, T5 (19:00)"
                className="h-11 w-full rounded-xl border border-rose-300 bg-white px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* Chọn học sinh */}
          <div className="rounded-xl border border-rose-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold text-gray-800">Chọn học sinh</div>
              <div className="text-sm text-gray-600">Đã chọn: <span className="font-bold">{selected.length}</span></div>
            </div>
            <div className="mb-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm học sinh theo tên, email, ID…"
                className="h-10 w-full rounded-xl border border-rose-300 bg-white px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div className="max-h-56 overflow-auto rounded-lg bg-rose-50/40 ring-1 ring-rose-100">
              <table className="min-w-full text-sm">
                <thead className="bg-rose-50 text-rose-800">
                  <tr>
                    <Th></Th>
                    <Th>ID</Th>
                    <Th>Tên</Th>
                    <Th>Email</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-rose-50/60">
                      <Td className="w-10">
                        <input
                          type="checkbox"
                          checked={selected.includes(s.id)}
                          onChange={() => toggle(s.id)}
                          className="h-4 w-4 accent-rose-600"
                        />
                      </Td>
                      <Td>{s.id}</Td>
                      <Td className="font-medium text-gray-900">{s.name}</Td>
                      <Td className="text-gray-700">{s.email}</Td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><Td className="py-6 text-center text-gray-500" colSpan={4}>Không tìm thấy học sinh phù hợp.</Td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button onClick={onClose} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">
              Hủy
            </button>
            <button onClick={submit} className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700">
              Tạo lớp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== PAYMENTS ======
function PaymentsPanel({ data }: { data: Payment[] }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-rose-100">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Thanh toán</h2>
        <div className="flex gap-2">
          <button className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">
            Xuất CSV
          </button>
          <button className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600">
            Tạo hóa đơn
          </button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-orange-50 text-orange-800">
            <tr>
              <Th>ID</Th>
              <Th>Người trả</Th>
              <Th>Số tiền (₫)</Th>
              <Th>Phương thức</Th>
              <Th>Ngày</Th>
              <Th>Trạng thái</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-100">
            {data.map((p) => (
              <tr key={p.id} className="hover:bg-rose-50/40">
                <Td>{p.id}</Td>
                <Td className="font-medium text-gray-900">{p.user}</Td>
                <Td className="font-semibold">{currency(p.amount)}</Td>
                <Td>{p.method}</Td>
                <Td>{fmtDate(p.date)}</Td>
                <Td>
                  <Badge color={p.status === "success" ? "emerald" : p.status === "pending" ? "amber" : "slate"}>
                    {p.status === "success" ? "Thành công" : p.status === "pending" ? "Đang chờ" : "Lỗi"}
                  </Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ====== REPORTS ======
function ReportsPanel({ users, classes, payments }: { users: User[]; classes: ClassItem[]; payments: Payment[] }) {
  const byMethod = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of payments.filter(p => p.status === "success")) {
      map.set(p.method, (map.get(p.method) || 0) + p.amount);
    }
    return Array.from(map.entries()).map(([k, v]) => ({ method: k, total: v }));
  }, [payments]);

  const byRole = useMemo(() => {
    const count = { admin: 0, teacher: 0, student: 0 } as Record<Role, number>;
    users.forEach(u => (count[u.role] += 1));
    return [
      { label: "Admin", value: count.admin, color: "bg-amber-500" },
      { label: "Giáo viên", value: count.teacher, color: "bg-rose-500" },
      { label: "Học viên", value: count.student, color: "bg-emerald-500" },
    ];
  }, [users]);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-rose-100">
      <h2 className="mb-4 text-lg font-bold text-gray-800">Báo cáo nhanh</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 font-semibold text-gray-800">Doanh thu theo phương thức</h3>
          <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
            {byMethod.length === 0 && <p className="text-sm text-gray-600">Chưa có giao dịch thành công.</p>}
            <div className="space-y-3">
              {byMethod.map((m) => {
                const max = Math.max(...byMethod.map(x => x.total));
                const pct = max ? Math.round((m.total / max) * 100) : 0;
                return (
                  <div key={m.method}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{m.method}</span>
                      <span className="text-gray-700">{currency(m.total)} ₫</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-rose-100">
                      <div className="h-2 rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-gray-800">Cơ cấu người dùng</h3>
          <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
            <ul className="space-y-2">
              {byRole.map((r) => (
                <li key={r.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`inline-block h-3 w-3 rounded-full ${r.color}`} />
                    {r.label}
                  </span>
                  <span className="font-semibold">{r.value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 h-24 w-full rounded-lg bg-white ring-1 ring-rose-100 p-2 flex items-end gap-2">
              {byRole.map((r, i) => {
                const max = Math.max(...byRole.map(x => x.value));
                const h = max ? Math.max(6, Math.round((r.value / max) * 100)) : 0;
                return (
                  <div key={i} className="flex-1">
                    <div className={`mx-auto w-6 rounded-t-md ${r.color}`} style={{ height: `${h}%` }} />
                    <div className="mt-1 text-center text-[10px] text-gray-600">{r.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="mb-2 font-semibold text-gray-800">Tổng quan lớp học</h3>
          <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SmallStat label="Tổng lớp" value={classes.length.toString()} />
              <SmallStat label="Đang học" value={classes.filter(c => c.status === "ongoing").length.toString()} />
              <SmallStat label="Đã kết thúc" value={classes.filter(c => c.status === "finished").length.toString()} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ====== TABLE HELPERS ======
type TableCellProps = React.PropsWithChildren<React.ThHTMLAttributes<HTMLTableCellElement>>;

function Th({ children, className = "", ...rest }: TableCellProps) {
  return (
    <th
      className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

type DataCellProps = React.PropsWithChildren<React.TdHTMLAttributes<HTMLTableCellElement>>;

function Td({ children, className = "", ...rest }: DataCellProps) {
  return (
    <td className={`px-3 py-3 align-middle text-gray-800 ${className}`} {...rest}>
      {children}
    </td>
  );
}
function Badge({ children, color = "slate" }: React.PropsWithChildren<{ color?: "rose" | "amber" | "emerald" | "blue" | "slate" }>) {
  const map: Record<string, string> = {
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${map[color]}`}>{children}</span>;
}
function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-rose-100 bg-white p-4">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
