import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ====== Kiểu dữ liệu cho phản hồi từ backend ======
type AuthResponse = {
  ok: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    fullName: string | null;
    email: string;
    role: string;
  };
};

type RegisterError = { error: string };

// ====== Hàm tiện ích: xác định có nên set cookie Secure hay không ======
// - prod sau reverse proxy: ưu tiên header X-Forwarded-Proto
// - dev (http://localhost) thì Secure = false
function isHttps(req: NextRequest): boolean {
  const xfProto = req.headers.get('x-forwarded-proto');
  if (xfProto) return xfProto.includes('https');
  try {
    return new URL(req.url).protocol === 'https:';
  } catch {
    return false;
  }
}

// ====== Route handler - Proxy đến backend ======
export async function POST(req: NextRequest) {
  try {
    // Đọc & kiểm tra đầu vào
    const { email, password, role, subjects, availableTime } = (await req.json()) as {
      email?: string;
      password?: string;
      role?: string;
      subjects?: string;
      availableTime?: string;
    };

    if (!email || !password) {
      const body: RegisterError = { error: 'Thiếu email hoặc mật khẩu.' };
      return NextResponse.json(body, { status: 400 });
    }

    // Gọi API backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
    const requestBody: { email: string; password: string; role?: string; subjects?: string; availableTime?: string } = {
      email,
      password,
    };
    
    // Chỉ thêm role nếu có
    if (role) {
      requestBody.role = role;
    }
    if (subjects) {
      requestBody.subjects = subjects;
    }
    if (availableTime) {
      requestBody.availableTime = availableTime;
    }

    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorBody: RegisterError = { 
        error: data.message || data.error || 'Đăng ký thất bại!' 
      };
      return NextResponse.json(errorBody, { status: response.status });
    }

    // Parse response từ backend
    const authResponse = data as AuthResponse;

    // Tạo response JSON
    const res = NextResponse.json<AuthResponse>(
      {
        ok: authResponse.ok,
        message: authResponse.message,
        token: authResponse.token,
        user: authResponse.user,
      },
      { status: 200 }
    );

    // Set cookie HttpOnly để trình duyệt tự gửi kèm về sau
    if (authResponse.token) {
      res.cookies.set('token', authResponse.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isHttps(req), // true khi chạy https (prod)
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 ngày
      });
    }

    return res;
  } catch (err: unknown) {
    console.error('🔥 Lỗi khi đăng ký:', err);
    const errorBody: RegisterError = { error: 'Lỗi máy chủ, vui lòng thử lại sau!' };
    return NextResponse.json(errorBody, { status: 500 });
  }
}

