"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendMessage, getConversation, getAllMessages, markConversationAsRead, Message, apiCall } from "@/lib/api";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState<Map<number, Message[]>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    loadCurrentUser();
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedUserId) {
      loadConversation(selectedUserId);
      markConversationAsRead(selectedUserId).catch(console.error);
    }
  }, [selectedUserId]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Poll for new messages every 3 seconds
    if (selectedUserId) {
      pollIntervalRef.current = setInterval(() => {
        loadConversation(selectedUserId);
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedUserId]);

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      // Check localStorage for role hints
      const teacherEmail = localStorage.getItem("teacherEmail");
      const storedRole = localStorage.getItem("userRole");

      // Decode token to get email
      let emailFromToken: string | null = null;
      let roleFromToken: string | null = null;
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          emailFromToken = payload.sub || payload.email || null;
          roleFromToken = payload.role || null;
        }
      } catch (err) {
        console.error("Failed to decode token:", err);
      }

      const email = teacherEmail || emailFromToken;
      const role = storedRole || roleFromToken;

      if (!email) {
        console.error("Could not get email from token or localStorage");
        setLoading(false);
        return;
      }

      // Try to get user by email
      try {
        const userResponse = await apiCall<User>(`/api/users/email/${encodeURIComponent(email)}`);
        if (userResponse) {
          setCurrentUser({
            id: userResponse.id,
            fullName: userResponse.fullName || (role === "TUTOR" || role === "TEACHER" ? "Giảng viên" : "Học sinh"),
            email: userResponse.email,
            role: role || userResponse.role || "STUDENT",
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log("Failed to get user by email, trying tutor/student endpoints...", err);
      }

      // Try to get from tutor endpoint first (for teachers)
      if (teacherEmail || role === "TUTOR" || role === "TEACHER") {
        try {
          const tutorResponse = await apiCall<any>("/api/tutors/me");
          if (tutorResponse && Object.keys(tutorResponse).length > 0) {
            // Tutor object has user field
            const user = tutorResponse.user;
            if (user) {
              setCurrentUser({
                id: user.id,
                fullName: user.fullName || "Giảng viên",
                email: user.email || teacherEmail || email || "",
                role: "TUTOR",
              });
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.log("Not a tutor, trying student endpoint...", err);
        }
      }

      // Try to get from student endpoint
      try {
        const studentResponse = await apiCall<any>("/api/students/me");
        if (studentResponse && Object.keys(studentResponse).length > 0) {
          // Student object has user field
          const user = studentResponse.user;
          if (user) {
            setCurrentUser({
              id: user.id,
              fullName: user.fullName || "Học sinh",
              email: user.email || email || "",
              role: "STUDENT",
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.log("Not a student either", err);
      }

      // If all else fails, use email and role from token/localStorage
      if (email && role) {
        // Create a minimal user object - we'll need to get ID from API later
        // For now, try to get from users list
        try {
          const usersResponse = await apiCall<User[]>(`/api/users/role/${role}`);
          if (usersResponse && usersResponse.length > 0) {
            const user = usersResponse.find(u => u.email === email);
            if (user) {
              setCurrentUser({
                id: user.id,
                fullName: user.fullName || (role === "TUTOR" || role === "TEACHER" ? "Giảng viên" : "Học sinh"),
                email: user.email,
                role: role,
              });
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error("Failed to get user from users list:", err);
        }
      }

      // If all else fails, show error
      console.error("Could not determine user role or get user info");
      setLoading(false);
    } catch (error) {
      console.error("Failed to load current user:", error);
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!currentUser) return;

    try {
      // Load users based on current user's role
      // If tutor, load students; if student, load tutors
      const targetRole = currentUser.role === "TUTOR" || currentUser.role === "TEACHER" ? "STUDENT" : "TUTOR";
      const response = await apiCall<User[]>(`/api/users/role/${targetRole}`);
      setUsers(response || []);
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers([]);
    }
  };

  const loadConversation = async (otherUserId: number) => {
    try {
      const conversationMessages = await getConversation(otherUserId);
      setMessages(conversationMessages);
      setConversations((prev) => {
        const newMap = new Map(prev);
        newMap.set(otherUserId, conversationMessages);
        return newMap;
      });
    } catch (error) {
      console.error("Failed to load conversation:", error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId || sending) return;

    setSending(true);
    try {
      const sentMessage = await sendMessage({
        receiverId: selectedUserId,
        content: newMessage.trim(),
      });
      setNewMessage("");
      // Reload conversation to get the new message
      await loadConversation(selectedUserId);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);

      if (minutes < 1) return "Vừa xong";
      if (minutes < 60) return `${minutes} phút trước`;
      if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;

      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return dateString;
    }
  };

  const getUnreadCount = (userId: number) => {
    const conversation = conversations.get(userId) || [];
    return conversation.filter((msg) => !msg.isRead && msg.receiverId === currentUser?.id).length;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1a0501] via-[#260803] to-[#140301]">
        <div className="text-orange-200">Đang tải...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1a0501] via-[#260803] to-[#140301]">
        <div className="text-red-200">Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.</div>
      </div>
    );
  }

  // Determine if current user is tutor/teacher
  const isTutor = currentUser.role === "TUTOR" || currentUser.role === "TEACHER";
  const backHref = isTutor ? "/teacher/dashboard" : "/student";

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#1a0501] via-[#260803] to-[#140301] text-orange-50">
      {/* Sidebar - User List */}
      <div className="w-80 border-r border-orange-800/60 bg-[#1b0703] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-orange-800/60">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-orange-200">MathBridge Chat</h2>
            <Link
              href={backHref}
              className="text-sm text-orange-300 hover:underline"
            >
              ← Quay lại
            </Link>
          </div>
          <p className="text-xs text-orange-200/70">
            {isTutor ? "Danh sách học sinh" : "Danh sách giảng viên"}
          </p>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <div className="p-4 text-center text-sm text-orange-200/70">
              Chưa có {isTutor ? "học sinh" : "giảng viên"} nào.
            </div>
          ) : (
            users.map((user) => {
              const unreadCount = getUnreadCount(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full p-4 text-left border-b border-orange-800/40 hover:bg-[#2a1207] transition ${
                    selectedUserId === user.id ? "bg-[#2a1207] border-l-4 border-l-orange-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-orange-100 truncate">{user.fullName || user.email}</p>
                      <p className="text-xs text-orange-200/60 truncate">{user.email}</p>
                    </div>
                    {unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-orange-800/60 bg-[#1b0703]">
              {(() => {
                const selectedUser = users.find((u) => u.id === selectedUserId);
                return (
                  <div>
                    <h3 className="text-lg font-semibold text-orange-200">
                      {selectedUser?.fullName || selectedUser?.email || "Người dùng"}
                    </h3>
                    <p className="text-sm text-orange-200/60">{selectedUser?.email}</p>
                  </div>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-orange-200/70">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId === currentUser.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? "bg-orange-600 text-white"
                            : "bg-[#2a1207] border border-orange-800/60 text-orange-50"
                        }`}
                      >
                        {!isOwnMessage && (
                          <p className="text-xs font-semibold mb-1 opacity-80">{message.senderName}</p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">{formatTime(message.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-orange-800/60 bg-[#1b0703]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 rounded-xl border border-orange-700/60 bg-[#2a1207] px-4 py-2 text-orange-50 placeholder:text-orange-200/50 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="rounded-xl bg-orange-600 px-6 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {sending ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-xl font-semibold text-orange-200 mb-2">Chọn người để bắt đầu trò chuyện</p>
              <p className="text-sm text-orange-200/70">
                {isTutor ? "Chọn một học sinh từ danh sách bên trái" : "Chọn một giảng viên từ danh sách bên trái"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

