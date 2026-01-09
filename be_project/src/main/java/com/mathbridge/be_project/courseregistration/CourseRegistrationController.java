package com.mathbridge.be_project.courseregistration;

import com.mathbridge.be_project.user.User;
import com.mathbridge.be_project.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/course-registrations")
@RequiredArgsConstructor
public class CourseRegistrationController {

    private final CourseRegistrationService courseRegistrationService;
    private final UserService userService;

    /**
     * Đăng ký môn học
     * POST /api/course-registrations
     */
    @PostMapping
    public ResponseEntity<?> registerCourse(@RequestBody CourseRegistrationRequest request) {
        try {
            System.out.println("=== Course Registration Request ===");
            System.out.println("Request body: " + request);
            
            User currentUser = getCurrentUser();
            System.out.println("Current user: " + (currentUser != null ? currentUser.getEmail() : "null"));
            
            if (currentUser == null) {
                System.out.println("ERROR: User is null - authentication failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Bạn cần đăng nhập để đăng ký môn học"));
            }

            // Chỉ cho phép STUDENT đăng ký
            if (currentUser.getRole() != com.mathbridge.be_project.common.UserRole.STUDENT) {
                System.out.println("ERROR: User role is not STUDENT: " + currentUser.getRole());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Chỉ học sinh mới có thể đăng ký môn học"));
            }

            System.out.println("Calling service to register course...");
            CourseRegistration registration = courseRegistrationService.registerCourse(currentUser, request);
            System.out.println("Course registered successfully: " + registration.getId());
            
            CourseRegistrationDTO dto = CourseRegistrationDTO.fromEntity(registration);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (IllegalArgumentException e) {
            System.out.println("IllegalArgumentException: " + e.getMessage());
            e.printStackTrace();
            // Đảm bảo thông báo lỗi luôn bằng tiếng Việt
            String errorMsg = e.getMessage();
            if (errorMsg == null || errorMsg.trim().isEmpty()) {
                errorMsg = "Đăng ký thất bại! Vui lòng kiểm tra lại thông tin.";
            }
            return ResponseEntity.badRequest().body(createErrorResponse(errorMsg));
        } catch (Exception e) {
            System.out.println("Exception: " + e.getMessage());
            e.printStackTrace();
            // Đảm bảo thông báo lỗi luôn bằng tiếng Việt
            String errorMsg = "Đăng ký thất bại! Đã xảy ra lỗi khi xử lý yêu cầu.";
            if (e.getMessage() != null && !e.getMessage().trim().isEmpty()) {
                // Nếu message đã là tiếng Việt, giữ nguyên; nếu không, dùng message mặc định
                String msg = e.getMessage();
                if (msg.contains("Lỗi") || msg.contains("lỗi") || msg.contains("đăng ký") || 
                    msg.contains("bắt buộc") || msg.contains("không")) {
                    errorMsg = "Đăng ký thất bại! " + msg;
                }
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(errorMsg));
        }
    }

    /**
     * Lấy danh sách môn học đã đăng ký của student hiện tại
     * GET /api/course-registrations/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyRegisteredCourses() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Bạn cần đăng nhập để xem danh sách môn học"));
            }

            List<CourseRegistration> courses = courseRegistrationService.getRegisteredCourses(currentUser);
            List<CourseRegistrationDTO> dtos = courses.stream()
                    .map(CourseRegistrationDTO::fromEntity)
                    .toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy danh sách môn học: " + e.getMessage()));
        }
    }

    /**
     * Lấy danh sách môn học đã đăng ký của student theo ID
     * GET /api/course-registrations/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getRegisteredCoursesByStudentId(@PathVariable Long studentId) {
        try {
            List<CourseRegistration> courses = courseRegistrationService.getRegisteredCoursesByStudentId(studentId);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy danh sách môn học: " + e.getMessage()));
        }
    }

    /**
     * Hủy đăng ký môn học
     * PUT /api/course-registrations/{id}/cancel
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRegistration(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Bạn cần đăng nhập để hủy đăng ký"));
            }

            courseRegistrationService.cancelRegistration(id, currentUser);
            return ResponseEntity.ok(createSuccessResponse("Hủy đăng ký môn học thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi hủy đăng ký: " + e.getMessage()));
        }
    }

    /**
     * Xóa đăng ký môn học
     * DELETE /api/course-registrations/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRegistration(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Bạn cần đăng nhập để xóa đăng ký"));
            }

            courseRegistrationService.deleteRegistration(id, currentUser);
            return ResponseEntity.ok(createSuccessResponse("Xóa đăng ký môn học thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi xóa đăng ký: " + e.getMessage()));
        }
    }

    /**
     * Lấy user hiện tại từ SecurityContext
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        String email = authentication.getName();
        if (email == null || email.isEmpty()) {
            return null;
        }
        
        return userService.getUserByEmail(email).orElse(null);
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("message", message);
        return error;
    }

    private Map<String, String> createSuccessResponse(String message) {
        Map<String, String> success = new HashMap<>();
        success.put("message", message);
        success.put("success", "true");
        return success;
    }
}

