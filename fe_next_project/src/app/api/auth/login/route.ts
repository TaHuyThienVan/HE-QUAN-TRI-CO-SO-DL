import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

type AuthResponse = {
  token: string;
  user: {
    id: number;
    fullName: string | null;
    email: string;
    role: string;
  };
  ok?: boolean;
  message?: string;
};

type LoginError = { error: string };

function isAuthResponse(payload: unknown): payload is AuthResponse {
  if (!payload || typeof payload !== "object") return false;
  const data = payload as Record<string, unknown>;
  const user = data.user as Record<string, unknown> | undefined;
  return (
    typeof data.token === "string" &&
    user !== undefined &&
    user !== null &&
    typeof user.email === "string" &&
    typeof user.role === "string"
  );
}

function isHttps(req: NextRequest): boolean {
  const xfProto = req.headers.get('x-forwarded-proto');
  if (xfProto) return xfProto.includes('https');
  try {
    return new URL(req.url).protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json<LoginError>(
        { error: 'Thiếu email hoặc mật khẩu.' },
        { status: 400 }
      );
    }

    // Dùng chung biến NEXT_PUBLIC_API_URL để đồng bộ với các route khác
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

    let beRes: Response;
    try {
      beRes = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ email, password }),
      });
    } catch {
      return NextResponse.json<LoginError>(
        { error: 'Không kết nối được máy chủ.' },
        { status: 502 }
      );
    }

    // Cố parse JSON; nếu BE trả không phải JSON thì fallback
let beData: unknown = null;
    try {
      beData = await beRes.json();
    } catch {
      beData = null;
    }

    if (!beRes.ok) {
      const errorPayload = beData as { message?: string; error?: string } | null;
      const msg =
        errorPayload?.message ||
        errorPayload?.error ||
        `Đăng nhập thất bại (HTTP ${beRes.status}).`;
      return NextResponse.json<LoginError>({ error: msg }, { status: beRes.status });
    }

    const data = isAuthResponse(beData) ? beData : null;
    if (!data) {
      return NextResponse.json<LoginError>(
        { error: 'Phản hồi không hợp lệ từ máy chủ.' },
        { status: 500 }
      );
    }

    // Trả JSON tối giản cho FE (không lộ token ra body)
    const res = NextResponse.json(
      {
        message: data.message ?? 'Đăng nhập thành công.',
        user: data.user,
      },
      { status: 200 }
    );

    // Set cookie HttpOnly
    res.cookies.set('access_token', data.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps(req),
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });

    return res;
  } catch (err) {
    console.error('🔥 Lỗi khi đăng nhập:', err);
    return NextResponse.json<LoginError>(
      { error: 'Lỗi máy chủ, vui lòng thử lại sau!' },
      { status: 500 }
    );
    }
}
