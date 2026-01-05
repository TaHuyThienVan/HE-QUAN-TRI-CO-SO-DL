package com.mathbridge.be_project.session;

import com.mathbridge.be_project.common.SessionStatus;
import com.mathbridge.be_project.student.Student;
import com.mathbridge.be_project.tutor.Tutor;
import com.mathbridge.be_project.tutor.TutorService;
import com.mathbridge.be_project.user.User;
import com.mathbridge.be_project.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sessions")
@Tag(name = "Session Management", description = "APIs for managing tutoring sessions")
public class SessionController {
    
    @Autowired
    private SessionService sessionService;
    
    @Autowired
    private TutorService tutorService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private com.mathbridge.be_project.student.StudentService studentService;
    
    @Autowired
    private com.mathbridge.be_project.student.StudentRepository studentRepository;
    
    @PostMapping
    @Operation(summary = "Create a new session", description = "Schedule a new tutoring session")
    public ResponseEntity<Session> createSession(@Valid @RequestBody Session session) {
        try {
            Session createdSession = sessionService.createSession(session);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSession);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @PostMapping("/schedule")
    @Operation(summary = "Schedule a new session from form", description = "Schedule a new session using simplified request from frontend")
    public ResponseEntity<?> scheduleSession(@Valid @RequestBody SessionRequest request) {
        try {
            // Get current user from authentication
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Bạn cần đăng nhập để đặt lịch học"));
            }
            
            // Check if user is TUTOR role
            if (currentUser.getRole() != com.mathbridge.be_project.common.UserRole.TUTOR) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Tài khoản này không phải là giảng viên"));
            }
            
            // Get or create tutor from current user
            Optional<Tutor> tutorOpt = tutorService.getTutorByUser(currentUser);
            Tutor tutor;
            
            if (tutorOpt.isEmpty()) {
                // Auto-create Tutor record if user is TUTOR but doesn't have Tutor record
                tutor = new Tutor();
                tutor.setUser(currentUser);
                // Generate employeeId: GV + 6 random digits
                String employeeId = "GV" + String.format("%06d", (int)(Math.random() * 9000000) + 100000);
                tutor.setEmployeeId(employeeId);
                tutor = tutorService.createTutor(tutor);
            } else {
                tutor = tutorOpt.get();
            }
            
            // Create session from request
            Session createdSession = sessionService.createSessionFromRequest(request, tutor);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSession);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Handle foreign key constraint violations
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Lỗi: Học sinh không tồn tại trong hệ thống. Vui lòng chọn học sinh khác hoặc thêm học sinh mới."));
        } catch (RuntimeException e) {
            // Check if it's a data integrity violation message
            String errorMessage = e.getMessage();
            if (errorMessage != null && (errorMessage.contains("FOREIGN KEY") || 
                                         errorMessage.contains("không tồn tại") ||
                                         errorMessage.contains("Không tìm thấy học sinh"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse(errorMessage));
            }
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse(errorMessage != null ? errorMessage : "Lỗi khi đặt lịch học"));
        } catch (Exception e) {
            e.printStackTrace(); // Log for debugging
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Lỗi khi đặt lịch học: " + (e.getMessage() != null ? e.getMessage() : "Lỗi không xác định")));
        }
    }
    
    @GetMapping("/tutor/me")
    @Operation(summary = "Get sessions for current tutor", description = "Retrieve all sessions for the currently authenticated tutor")
    public ResponseEntity<?> getMySessions() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Bạn cần đăng nhập để xem lịch học"));
            }
            
            // Check if user is TUTOR role
            if (currentUser.getRole() != com.mathbridge.be_project.common.UserRole.TUTOR) {
                // Return empty array if user is not a tutor
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            Optional<Tutor> tutorOpt = tutorService.getTutorByUser(currentUser);
            Tutor tutor;
            
            if (tutorOpt.isEmpty()) {
                // Auto-create Tutor record if user is TUTOR but doesn't have Tutor record
                tutor = new Tutor();
                tutor.setUser(currentUser);
                // Generate employeeId: GV + 6 random digits
                String employeeId = "GV" + String.format("%06d", (int)(Math.random() * 900000) + 100000);
                tutor.setEmployeeId(employeeId);
                tutor = tutorService.createTutor(tutor);
            } else {
                tutor = tutorOpt.get();
            }
            
            List<Session> sessions = sessionService.getSessionsByTutor(tutor.getId());
            // Ensure we always return a list, even if empty
            if (sessions == null) {
                sessions = new java.util.ArrayList<>();
            }
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            e.printStackTrace(); // Log for debugging
            // Return empty array on error instead of error response
            // This prevents the page from breaking
            return ResponseEntity.ok(new java.util.ArrayList<>());
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
        
        String email = authentication.getName();
        if (email == null || email.isEmpty()) {
            return null;
        }
        
        return userService.getUserByEmail(email).orElse(null);
    }
    
    private java.util.Map<String, String> createErrorResponse(String message) {
        java.util.Map<String, String> error = new java.util.HashMap<>();
        error.put("error", message);
        error.put("message", message);
        return error;
    }
    
    @GetMapping
    @Operation(summary = "Get all sessions", description = "Retrieve all sessions")
    public ResponseEntity<List<Session>> getAllSessions() {
        List<Session> sessions = sessionService.getAllSessions();
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get session by ID", description = "Retrieve a specific session by its ID")
    public ResponseEntity<Session> getSessionById(
            @Parameter(description = "Session ID") @PathVariable Long id) {
        Optional<Session> session = sessionService.getSessionById(id);
        return session.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/tutor/{tutorId}")
    @Operation(summary = "Get sessions by tutor", description = "Retrieve all sessions for a specific tutor")
    public ResponseEntity<List<Session>> getSessionsByTutor(
            @Parameter(description = "Tutor ID") @PathVariable Long tutorId) {
        List<Session> sessions = sessionService.getSessionsByTutor(tutorId);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get sessions by student", description = "Retrieve all sessions for a specific student")
    public ResponseEntity<List<Session>> getSessionsByStudent(
            @Parameter(description = "Student ID") @PathVariable Long studentId) {
        List<Session> sessions = sessionService.getSessionsByStudent(studentId);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/student/me")
    @Operation(summary = "Get sessions for current student", description = "Retrieve all sessions for the currently authenticated student")
    public ResponseEntity<?> getMyStudentSessions() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Bạn cần đăng nhập để xem lịch học"));
            }
            
            // Check if user is STUDENT role
            if (currentUser.getRole() != com.mathbridge.be_project.common.UserRole.STUDENT) {
                // Return empty array if user is not a student
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            // Get student from current user
            Optional<Student> studentOpt = studentService.getStudentByUser(currentUser);
            
            if (studentOpt.isEmpty()) {
                // Auto-create Student record if user is STUDENT but doesn't have Student record
                Student student = new Student();
                student.setUser(currentUser);
                student.setFullName(currentUser.getFullName() != null && !currentUser.getFullName().isEmpty() 
                        ? currentUser.getFullName() : "Học sinh");
                student.setEmail(currentUser.getEmail());
                // Save directly using repository
                student = studentRepository.save(student);
                studentOpt = Optional.of(student);
                System.out.println("Auto-created Student record for user: " + currentUser.getEmail() + ", Student ID: " + student.getId());
            }
            
            if (studentOpt.isEmpty()) {
                // Return empty array if still no student record
                System.out.println("No student record found for user: " + currentUser.getEmail());
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            Student student = studentOpt.get();
            System.out.println("Getting sessions for student ID: " + student.getId() + ", User: " + currentUser.getEmail());
            
            List<Session> sessions = sessionService.getSessionsByStudent(student.getId());
            System.out.println("Found " + (sessions != null ? sessions.size() : 0) + " sessions for student ID: " + student.getId());
            
            // Ensure we always return a list, even if empty
            if (sessions == null) {
                sessions = new java.util.ArrayList<>();
            }
            
            // Log session details for debugging
            if (sessions != null && !sessions.isEmpty()) {
                System.out.println("First session details: ID=" + sessions.get(0).getId() + 
                    ", Subject=" + sessions.get(0).getSubject() + 
                    ", Tutor=" + (sessions.get(0).getTutor() != null ? sessions.get(0).getTutor().getId() : "null") +
                    ", Student=" + (sessions.get(0).getStudent() != null ? sessions.get(0).getStudent().getId() : "null"));
            }
            
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            e.printStackTrace(); // Log for debugging
            // Return empty array on error instead of error response
            // This prevents the page from breaking
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get sessions by status", description = "Retrieve sessions by their status")
    public ResponseEntity<List<Session>> getSessionsByStatus(
            @Parameter(description = "Session status") @PathVariable SessionStatus status) {
        List<Session> sessions = sessionService.getSessionsByStatus(status);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/tutor/{tutorId}/upcoming")
    @Operation(summary = "Get upcoming sessions for tutor", description = "Retrieve upcoming sessions for a specific tutor")
    public ResponseEntity<List<Session>> getUpcomingSessionsForTutor(
            @Parameter(description = "Tutor ID") @PathVariable Long tutorId) {
        List<Session> sessions = sessionService.getUpcomingSessionsForTutor(tutorId);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/student/{studentId}/upcoming")
    @Operation(summary = "Get upcoming sessions for student", description = "Retrieve upcoming sessions for a specific student")
    public ResponseEntity<List<Session>> getUpcomingSessionsForStudent(
            @Parameter(description = "Student ID") @PathVariable Long studentId) {
        List<Session> sessions = sessionService.getUpcomingSessionsForStudent(studentId);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/tutor/{tutorId}/completed")
    @Operation(summary = "Get completed sessions for tutor", description = "Retrieve completed sessions for a specific tutor")
    public ResponseEntity<List<Session>> getCompletedSessionsForTutor(
            @Parameter(description = "Tutor ID") @PathVariable Long tutorId) {
        List<Session> sessions = sessionService.getCompletedSessionsForTutor(tutorId);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/student/{studentId}/completed")
    @Operation(summary = "Get completed sessions for student", description = "Retrieve completed sessions for a specific student")
    public ResponseEntity<List<Session>> getCompletedSessionsForStudent(
            @Parameter(description = "Student ID") @PathVariable Long studentId) {
        List<Session> sessions = sessionService.getCompletedSessionsForStudent(studentId);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/date-range")
    @Operation(summary = "Get sessions by date range", description = "Retrieve sessions within a specific date range")
    public ResponseEntity<List<Session>> getSessionsByDateRange(
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Session> sessions = sessionService.getSessionsByDateRange(startDate, endDate);
        return ResponseEntity.ok(sessions);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update session", description = "Update session information")
    public ResponseEntity<Session> updateSession(
            @Parameter(description = "Session ID") @PathVariable Long id,
            @Valid @RequestBody Session session) {
        try {
            session.setId(id);
            Session updatedSession = sessionService.updateSession(session);
            return ResponseEntity.ok(updatedSession);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @PutMapping("/{id}/confirm")
    @Operation(summary = "Confirm session", description = "Confirm a scheduled session")
    public ResponseEntity<Session> confirmSession(
            @Parameter(description = "Session ID") @PathVariable Long id) {
        try {
            Session confirmedSession = sessionService.confirmSession(id);
            return ResponseEntity.ok(confirmedSession);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @PutMapping("/{id}/complete")
    @Operation(summary = "Complete session", description = "Mark a session as completed")
    public ResponseEntity<Session> completeSession(
            @Parameter(description = "Session ID") @PathVariable Long id) {
        try {
            Session completedSession = sessionService.completeSession(id);
            return ResponseEntity.ok(completedSession);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel session", description = "Cancel a session")
    public ResponseEntity<Session> cancelSession(
            @Parameter(description = "Session ID") @PathVariable Long id) {
        try {
            Session cancelledSession = sessionService.cancelSession(id);
            return ResponseEntity.ok(cancelledSession);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @GetMapping("/{id}/cancellation-fee")
    @Operation(summary = "Calculate cancellation fee", description = "Calculate the cancellation fee for a session")
    public ResponseEntity<BigDecimal> calculateCancellationFee(
            @Parameter(description = "Session ID") @PathVariable Long id) {
        Optional<Session> sessionOpt = sessionService.getSessionById(id);
        if (sessionOpt.isPresent()) {
            BigDecimal fee = sessionService.calculateCancellationFee(sessionOpt.get());
            return ResponseEntity.ok(fee);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/conflict-check")
    @Operation(summary = "Check for conflicts", description = "Check if there are conflicting sessions for a tutor")
    public ResponseEntity<Boolean> hasConflictingSessions(
            @Parameter(description = "Tutor ID") @RequestParam Long tutorId,
            @Parameter(description = "Start time") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "End time") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        boolean hasConflicts = sessionService.hasConflictingSessions(tutorId, startTime, endTime);
        return ResponseEntity.ok(hasConflicts);
    }
    
    @GetMapping("/tutor/{tutorId}/count/{status}")
    @Operation(summary = "Count sessions by status for tutor", description = "Count sessions by status for a specific tutor")
    public ResponseEntity<Long> countSessionsByTutorAndStatus(
            @Parameter(description = "Tutor ID") @PathVariable Long tutorId,
            @Parameter(description = "Session status") @PathVariable SessionStatus status) {
        Long count = sessionService.countSessionsByTutorAndStatus(tutorId, status);
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/student/{studentId}/count/{status}")
    @Operation(summary = "Count sessions by status for student", description = "Count sessions by status for a specific student")
    public ResponseEntity<Long> countSessionsByStudentAndStatus(
            @Parameter(description = "Student ID") @PathVariable Long studentId,
            @Parameter(description = "Session status") @PathVariable SessionStatus status) {
        Long count = sessionService.countSessionsByStudentAndStatus(studentId, status);
        return ResponseEntity.ok(count);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete session", description = "Delete a session")
    public ResponseEntity<Void> deleteSession(
            @Parameter(description = "Session ID") @PathVariable Long id) {
        try {
            sessionService.deleteSession(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/book")
    @Operation(summary = "Book a session (for students)", description = "Students can book a session with a tutor")
    public ResponseEntity<?> bookSession(@Valid @RequestBody SessionRequest request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Bạn cần đăng nhập để đăng ký học phần"));
            }
            
            // Check if user is STUDENT role
            if (currentUser.getRole() != com.mathbridge.be_project.common.UserRole.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Chỉ học sinh mới có thể đăng ký học phần"));
            }
            
            // Get or create student from current user
            Optional<Student> studentOpt = studentService.getStudentByUser(currentUser);
            Student student;
            
            if (studentOpt.isEmpty()) {
                // Auto-create Student record if user is STUDENT but doesn't have Student record
                student = new Student();
                student.setUser(currentUser);
                student.setFullName(currentUser.getFullName() != null && !currentUser.getFullName().isEmpty() 
                        ? currentUser.getFullName() : "Học sinh");
                student.setEmail(currentUser.getEmail());
                student = studentRepository.save(student);
            } else {
                student = studentOpt.get();
            }
            
            // Validate tutor ID is provided
            if (request.getTutorId() == null || request.getTutorId() <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Vui lòng chọn giảng viên"));
            }
            
            // Get tutor
            Optional<Tutor> tutorOpt = tutorService.getTutorById(request.getTutorId());
            if (tutorOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Giảng viên không tồn tại"));
            }
            
            Tutor tutor = tutorOpt.get();
            
            // Create session from request
            Session createdSession = sessionService.createSessionFromRequestForStudent(request, tutor, student);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSession);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse("Slot học phần này đã bị người khác đăng ký. Vui lòng chọn slot khác."));
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            if (errorMessage != null && (errorMessage.contains("trùng thời gian") || 
                                         errorMessage.contains("đã bị đặt") ||
                                         errorMessage.contains("CONFLICT"))) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(createErrorResponse(errorMessage));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(errorMessage != null ? errorMessage : "Lỗi khi đăng ký học phần"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi hệ thống: " + (e.getMessage() != null ? e.getMessage() : "Lỗi không xác định")));
        }
    }
    
    @GetMapping("/available-slots")
    @Operation(summary = "Get available slots for a tutor", description = "Get available time slots for booking")
    public ResponseEntity<?> getAvailableSlots(
            @Parameter(description = "Tutor ID") @RequestParam Long tutorId,
            @Parameter(description = "Date (yyyy-MM-dd)") @RequestParam(required = false) String date) {
        try {
            List<java.util.Map<String, Object>> slots = sessionService.getAvailableSlots(tutorId, date);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy danh sách slot: " + e.getMessage()));
        }
    }
    
    @GetMapping("/tutors")
    @Operation(summary = "Get all approved tutors", description = "Get list of approved tutors for booking")
    public ResponseEntity<?> getAvailableTutors() {
        try {
            List<Tutor> tutors = tutorService.getApprovedTutors();
            return ResponseEntity.ok(tutors);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy danh sách giảng viên: " + e.getMessage()));
        }
    }
}
