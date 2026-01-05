package com.mathbridge.be_project.auth;

public class AuthResponse {
    private boolean ok;
    private String message;
    private String token;
    private UserDTO user;

    // ✅ Inner class cho dữ liệu người dùng
    public static class UserDTO {
        private Long id;
        private String fullName;
        private String email;
        private String role;

        public UserDTO() {}

        public UserDTO(Long id, String fullName, String email, String role) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.role = role;
        }

        public Long getId() { return id; }
        public String getFullName() { return fullName; }
        public String getEmail() { return email; }
        public String getRole() { return role; }

        public void setId(Long id) { this.id = id; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public void setEmail(String email) { this.email = email; }
        public void setRole(String role) { this.role = role; }
    }

    // ✅ Constructors
    public AuthResponse() {}

    public AuthResponse(boolean ok, String message, String token, UserDTO user) {
        this.ok = ok;
        this.message = message;
        this.token = token;
        this.user = user;
    }

    // ✅ Constructor rút gọn (2 tham số)
    public AuthResponse(String message, String token) {
        this.ok = true;      // dùng biến 'ok' thay vì 'success'
        this.message = message;
        this.token = token;
        this.user = null;    // chưa có user info
    }

    // ✅ Getters / Setters
    public boolean isOk() { return ok; }
    public String getMessage() { return message; }
    public String getToken() { return token; }
    public UserDTO getUser() { return user; }

    public void setOk(boolean ok) { this.ok = ok; }
    public void setMessage(String message) { this.message = message; }
    public void setToken(String token) { this.token = token; }
    public void setUser(UserDTO user) { this.user = user; }
}
