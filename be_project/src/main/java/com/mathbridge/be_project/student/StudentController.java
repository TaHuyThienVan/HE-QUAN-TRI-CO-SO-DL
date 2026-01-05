package com.mathbridge.be_project.student;

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
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createStudent(@RequestBody StudentRequest request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Bạn cần đăng nhập để lưu thông tin học sinh"));
            }
            Student student = studentService.createStudent(currentUser, request);
            return ResponseEntity.ok(student);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi tạo học sinh: " + e.getMessage()));
        }
    }

    // RESTful style: POST /api/students
    @PostMapping
    public ResponseEntity<?> createStudentRest(@RequestBody StudentRequest request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Bạn cần đăng nhập để lưu thông tin học sinh"));
            }
            Student student = studentService.createStudent(currentUser, request);
            return ResponseEntity.ok(student);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi tạo học sinh: " + e.getMessage()));
        }
    }

    // GET /api/students/me - Lấy thông tin học sinh của user hiện tại
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentStudent() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Bạn cần đăng nhập để xem thông tin học sinh"));
            }
            
            Optional<Student> studentOpt = studentService.getStudentByUser(currentUser);
            if (studentOpt.isPresent()) {
                return ResponseEntity.ok(studentOpt.get());
            } else {
                // Trả về 204 No Content hoặc empty JSON object thay vì null
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy thông tin học sinh: " + e.getMessage()));
        }
    }

    /**
     * Lấy user hiện tại từ SecurityContext (JWT token)
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        // Lấy email từ authentication principal (được set bởi JwtAuthFilter)
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

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable Long id,
            @RequestBody StudentRequest request
    ) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    // Partial update to match FE schema that may send only changed fields
    @PatchMapping("/{id}")
    public ResponseEntity<Student> patchStudent(
            @PathVariable Long id,
            @RequestBody StudentRequest request
    ) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
