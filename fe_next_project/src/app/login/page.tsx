'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { login, storeToken } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)

    try {
      console.log('Attempting login with:', { email: username, password: '***' })
      
      // Sử dụng API đúng từ @/lib/api (gọi backend thực sự)
      const response = await login({ email: username, password })
      
      console.log('Login response:', response)
      
      // Kiểm tra role - chỉ cho phép học sinh (STUDENT)
      // Đảm bảo role là string trước khi so sánh
      let role: string | undefined = undefined;
      
      if (response.role && typeof response.role === 'string') {
        role = response.role.toUpperCase();
      } else if (response.user?.role && typeof response.user.role === 'string') {
        role = response.user.role.toUpperCase();
      }
      
      console.log('Login role check:', { 
        role: role, 
        responseRole: response.role, 
        userRole: response.user?.role,
        roleType: typeof role,
        fullResponse: response 
      })

      // Chỉ cho phép STUDENT đăng nhập vào trang học sinh
      if (!role || role !== "STUDENT") {
        console.error('Role check failed:', { 
          role: role, 
          roleType: typeof role,
          roleValue: role,
          expected: 'STUDENT',
          responseRole: response.role,
          userRole: response.user?.role
        })
        
        // Nếu là tài khoản giảng viên, tự động redirect đến trang đăng nhập giảng viên
        if (role === "TUTOR" || role === "TEACHER") {
          alert("Tài khoản này là tài khoản giảng viên. Đang chuyển đến trang đăng nhập giảng viên...");
          router.push("/login-teacher");
          return;
        }
        
        throw new Error("Tài khoản này không có quyền học sinh. Vui lòng đăng nhập bằng tài khoản học sinh hoặc sử dụng trang đăng nhập giảng viên.")
      }
      
      // Lưu token vào localStorage
      if (response.token) {
        storeToken(response.token)
        // Store in both formats for compatibility
        localStorage.setItem('accessToken', response.token)
        // Lưu role để kiểm tra sau này
        if (role) {
          localStorage.setItem('userRole', role)
        }
        console.log('Token stored successfully')
      } else {
        throw new Error('Không nhận được token từ server')
      }
      
      router.push('/student')
    } catch (error: unknown) {
      console.error('Login error:', error)
      let message = 'Đăng nhập thất bại'
      
      if (error instanceof Error) {
        message = error.message
        // Kiểm tra nếu là lỗi kết nối
        if (error.message.includes('Failed to fetch') || error.message.includes('kết nối')) {
          message = 'Không thể kết nối đến server. Vui lòng kiểm tra xem backend đã chạy chưa.'
        }
      }
      
      setErr(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-300 to-pink-200 overflow-hidden px-4">
      {/* hiệu ứng nền giữ nguyên */}
      <div className="absolute w-64 h-64 bg-white rounded-full opacity-60 top-10 left-20 blur-xl" />
      <div className="absolute w-36 h-36 bg-white rounded-full opacity-70 bottom-20 right-24 blur-lg" />
      <div className="absolute w-24 h-24 bg-white rounded-full opacity-80 top-1/3 right-1/3 blur-md" />

      {/* khung 2 cột */}
      <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start justify-center w-full max-w-6xl">

        {/* Cột trái: nội dung cho học sinh */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl w-full md:w-2/3">
          <h2 className="text-2xl font-bold text-orange-700 mb-4">📢 Thông báo chung</h2>
          <ul className="space-y-2 text-gray-800 text-sm">
            <li className="border-b pb-2">
              Mở đăng ký lớp Bồi dưỡng Toán 6–9 học kỳ này <span className="text-orange-500 font-semibold ml-1">09/11/2025</span>
            </li>
            <li className="border-b pb-2">
              Lịch kiểm tra giữa kỳ Toán trực tuyến (tự luyện + thi thử) <span className="text-orange-500 font-semibold ml-1">Tuần 3 Tháng 11</span>
            </li>
            <li className="border-b pb-2">
              Bảo trì hệ thống vào 23:00–23:30 mỗi thứ Bảy — các khóa học vẫn truy cập được sau thời gian này
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-orange-700 mt-6 mb-4">🎓 Chương trình học</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Hệ thống quản lý học tập dành cho sinh viên đại học. 
            Đăng ký các môn học đại cương, theo dõi lịch học, và quản lý tiến độ học tập. 
            Mỗi môn học có tài liệu, bài tập, và đánh giá định kỳ. 
            Sinh viên có thể theo dõi tiến độ và kết quả học tập ngay sau khi đăng nhập.
          </p>

          <h2 className="text-2xl font-bold text-orange-700 mt-6 mb-4">💰 Học phí &amp; Chính sách ưu đãi</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Học phí tính theo gói: Tháng / Học kỳ / Năm. 
            Miễn phí 7 ngày trải nghiệm, giảm 15% cho gói học kỳ và 25% cho gói năm. 
            Hỗ trợ học bổng dành cho học sinh có hoàn cảnh khó khăn — vui lòng liên hệ sau khi đăng nhập để được hướng dẫn.
          </p>
        </div>

        {/* Cột phải: form đăng nhập giữ nguyên */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full md:w-1/3 text-center">
          <h1 className="text-3xl font-black text-orange-700 mb-2 tracking-wide uppercase">
            ĐĂNG NHẬP HỌC TOÁN TRỰC TUYẾN
          </h1>
          <p className="text-orange-600 font-bold mb-6 text-base">Cùng vui học mỗi ngày!</p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block mb-1 font-bold text-gray-900 uppercase text-sm tracking-wide">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username"
                className="w-full border border-orange-300 rounded-lg px-3 py-2 font-semibold text-gray-900 focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-gray-900 uppercase text-sm tracking-wide">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full border border-orange-300 rounded-lg px-3 py-2 font-semibold text-gray-900 focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white py-3 rounded-xl text-base font-extrabold shadow-md transition-all duration-200 tracking-wide uppercase"
            >
              {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>

            {err && <p className="text-red-600 text-sm font-semibold text-center">{err}</p>}
          </form>

          <div className="mt-6 pt-4 border-t border-orange-200 text-sm">
            <span className="text-gray-700">Chưa có tài khoản? </span>
            <Link href="/register" className="text-orange-600 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-dashed border-orange-200 text-sm">
            <p className="text-gray-700 mb-2 font-semibold text-center">Bạn là giảng viên?</p>
            <Link
              href="/login-teacher"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-orange-300 bg-white px-4 py-2.5 font-semibold text-orange-600 shadow-sm hover:border-orange-400 hover:bg-orange-50 transition"
            >
              Đăng nhập giảng viên
            </Link>
            <p className="mt-2 text-xs text-gray-500 text-center">
              Liên kết này dẫn đến cổng dành riêng cho giảng viên để quản lý hồ sơ và phản hồi học viên.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
