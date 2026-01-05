// API configuration and helper functions to connect with Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: string; // Optional, BE sẽ có default
}

export interface AuthResponse {
  token: string;
  role?: string; // For backward compatibility
  user?: {
    id: number;
    fullName: string | null;
    email: string;
    role: string;
  };
  ok?: boolean;
  message?: string;
}

export interface FeedbackRequest {
  name?: string;
  course: string;
  teacher: string;
  date: string; // yyyy-MM-dd format
  mode?: string; // Trực tiếp / Online / Hybrid
  rating: number; // 1-5
  useful?: string; // yes / no
  comments: string;
  suggestions?: string;
  anonymous?: boolean;
}

export interface Feedback {
  id: number;
  name?: string;
  course: string;
  teacher: string;
  date: string;
  mode?: string;
  rating: number;
  useful?: string;
  comments: string;
  suggestions?: string;
  anonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login API call
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    console.log('Calling login API:', `${API_BASE_URL}/api/auth/login`)
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('Login response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `Đăng nhập thất bại (HTTP ${response.status})` 
      }));
      console.error('Login error data:', errorData)
      throw new Error(errorData.message || errorData.error || `Đăng nhập thất bại (HTTP ${response.status})`);
    }

    const data = await response.json();
    console.log('Login success, received data:', { ...data, token: data.token ? '***' : 'missing' })
    
    // Backend có thể trả về token hoặc không có field token
    // Kiểm tra các format có thể có
    if (!data.token && data.accessToken) {
      data.token = data.accessToken
    }
    
    // Map role from user object for backward compatibility
    if (data.user && data.user.role && !data.role) {
      data.role = data.user.role;
    }
    
    return data;
  } catch (error: unknown) {
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        `Không thể kết nối đến server backend (${API_BASE_URL}). ` +
        `Vui lòng kiểm tra xem backend đã chạy chưa.`
      );
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Register API call
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Đăng ký thất bại' }));
    throw new Error(error.message || error.error || 'Đăng ký thất bại');
  }

  return response.json();
}

/**
 * Store token in localStorage
 */
export function storeToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

/**
 * Get token from localStorage (check both 'token' and 'accessToken')
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    // Check for 'token' first (used by api.ts), then 'accessToken' (used by login page)
    return localStorage.getItem('token') || localStorage.getItem('accessToken');
  }
  return null;
}

/**
 * Remove token from localStorage (remove both 'token' and 'accessToken')
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expiredAt');
  }
}

/**
 * Make authenticated API call to BE
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const normalizedHeaders =
    options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : Array.isArray(options.headers)
        ? Object.fromEntries(options.headers)
        : (options.headers as Record<string, string> | undefined) ?? {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...normalizedHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Try to parse error response, but handle empty responses
      let error: any = { message: 'Request failed' };
      const contentType = response.headers.get('content-type');
      
      try {
        const text = await response.text();
        
        // Only log non-403 errors to avoid console spam
        if (response.status !== 403) {
          console.error(`API Error [${response.status}] for ${endpoint}:`, text);
        }
        
        if (text && text.trim()) {
          if (contentType && contentType.includes('application/json')) {
            try {
              error = JSON.parse(text);
            } catch (parseError) {
              // If JSON parse fails, use text as message
              error = { message: text };
            }
          } else {
            error = { message: text };
          }
        }
      } catch (e) {
        // Only log if not 403
        if (response.status !== 403) {
          console.error('Error reading error response:', e);
        }
        // If parsing fails, use default error
      }
      
      const errorMessage = error.message || error.error || `Request failed with status ${response.status}`;
      
      // Only log non-403 errors
      if (response.status !== 403) {
        console.error(`API call failed: ${endpoint} - ${errorMessage}`);
      }
      
      throw new Error(errorMessage);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // Handle empty responses (204 No Content, or empty body)
    if (response.status === 204 || contentLength === '0') {
      return null as T;
    }

    // Check if response is JSON
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      // Handle empty JSON response
      if (!text || text.trim() === '' || text.trim() === 'null') {
        return null as T;
      }
      try {
        return JSON.parse(text) as T;
      } catch (e) {
        console.error('Failed to parse JSON:', text);
        throw new Error('Invalid JSON response from server');
      }
    }

    // If not JSON, return null or text
    const text = await response.text();
    return (text || null) as T;
  } catch (error: unknown) {
    // Handle network errors (backend not running, CORS, etc.)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        `Không thể kết nối đến server backend (${API_BASE_URL}). ` +
        `Vui lòng kiểm tra xem backend đã chạy chưa.`
      );
    }
    // Re-throw other errors as-is
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Đã xảy ra lỗi không xác định.');
  }
}

/**
 * Create feedback
 */
export async function createFeedback(data: FeedbackRequest): Promise<Feedback> {
  return apiCall<Feedback>('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get all feedbacks
 */
export async function getAllFeedbacks(): Promise<Feedback[]> {
  return apiCall<Feedback[]>('/api/feedback');
}

// Message/Chat interfaces and functions
export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  receiverId: number;
  receiverName: string;
  receiverEmail: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface MessageRequest {
  receiverId: number;
  content: string;
}

/**
 * Send a message
 */
export async function sendMessage(data: MessageRequest): Promise<Message> {
  return apiCall<Message>('/api/messages/send', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get conversation between current user and another user
 */
export async function getConversation(otherUserId: number): Promise<Message[]> {
  return apiCall<Message[]>(`/api/messages/conversation/${otherUserId}`);
}

/**
 * Get all unread messages for current user
 */
export async function getUnreadMessages(): Promise<Message[]> {
  return apiCall<Message[]>('/api/messages/unread');
}

/**
 * Get all messages for current user
 */
export async function getAllMessages(): Promise<Message[]> {
  return apiCall<Message[]>('/api/messages/all');
}

/**
 * Mark conversation as read
 */
export async function markConversationAsRead(otherUserId: number): Promise<void> {
  return apiCall<void>(`/api/messages/mark-read/${otherUserId}`, {
    method: 'POST',
  });
}




