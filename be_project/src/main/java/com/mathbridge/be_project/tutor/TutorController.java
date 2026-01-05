package com.mathbridge.be_project.tutor;

import com.mathbridge.be_project.common.ApprovalStatus;
import com.mathbridge.be_project.user.User;
import com.mathbridge.be_project.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tutors")
@Tag(name = "Tutor Management", description = "APIs for managing tutors")
@RequiredArgsConstructor
public class TutorController {
    
    private final TutorService tutorService;
    private final UserService userService;
    
    @PostMapping
    @Operation(summary = "Create a new tutor", description = "Register a new tutor")
    public ResponseEntity<?> createTutor(@Valid @RequestBody TutorRequest request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Bạn cần đăng nhập để lưu thông tin giảng viên"));
            }
            
            Tutor tutor = tutorService.createOrUpdateTutor(currentUser, request);
            return ResponseEntity.ok(tutor);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lưu thông tin giảng viên: " + e.getMessage()));
        }
    }

    // GET /api/tutors/me - Lấy thông tin tutor của user hiện tại
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentTutor() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Bạn cần đăng nhập để xem thông tin giảng viên"));
            }
            
            Optional<Tutor> tutorOpt = tutorService.getTutorByUser(currentUser);
            if (tutorOpt.isPresent()) {
                Tutor tutor = tutorOpt.get();
                // Ensure User is loaded before serialization - reload from database to get latest data
                if (tutor.getUser() != null) {
                    // Reload user from database to get latest fullName and phone
                    User reloadedUser = userService.getUserById(tutor.getUser().getId()).orElse(null);
                    if (reloadedUser != null) {
                        // Update tutor's user reference to the reloaded one
                        tutor.setUser(reloadedUser);
                    }
                    // Trigger lazy loading for all fields
                    tutor.getUser().getEmail();
                    tutor.getUser().getFullName();
                    tutor.getUser().getPhone();
                }
                return ResponseEntity.ok(tutor);
            } else {
                // Return empty JSON object instead of 204 to avoid parsing issues
                return ResponseEntity.ok(new java.util.HashMap<>());
            }
        } catch (Exception e) {
            e.printStackTrace(); // Log for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy thông tin giảng viên: " + e.getMessage()));
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

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("message", message);
        return error;
    }
    
    @GetMapping
    @Operation(summary = "Get all tutors", description = "Retrieve all tutors")
    public ResponseEntity<List<Tutor>> getAllTutors() {
        List<Tutor> tutors = tutorService.getAllTutors();
        return ResponseEntity.ok(tutors);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get tutor by ID", description = "Retrieve a specific tutor by their ID")
    public ResponseEntity<Tutor> getTutorById(
            @Parameter(description = "Tutor ID") @PathVariable Long id) {
        Optional<Tutor> tutor = tutorService.getTutorById(id);
        return tutor.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get tutor by user ID", description = "Retrieve tutor profile by user ID")
    public ResponseEntity<Tutor> getTutorByUserId(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        Optional<Tutor> tutor = tutorService.getTutorByUserId(userId);
        return tutor.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get tutors by approval status", description = "Retrieve tutors by their approval status")
    public ResponseEntity<List<Tutor>> getTutorsByStatus(
            @Parameter(description = "Approval status") @PathVariable ApprovalStatus status) {
        List<Tutor> tutors = tutorService.getTutorsByApprovalStatus(status);
        return ResponseEntity.ok(tutors);
    }
    
    @GetMapping("/approved")
    @Operation(summary = "Get approved tutors", description = "Retrieve all approved tutors")
    public ResponseEntity<List<Tutor>> getApprovedTutors() {
        List<Tutor> tutors = tutorService.getApprovedTutors();
        return ResponseEntity.ok(tutors);
    }
    
    @GetMapping("/pending")
    @Operation(summary = "Get pending tutors", description = "Retrieve all tutors waiting for approval")
    public ResponseEntity<List<Tutor>> getPendingTutors() {
        List<Tutor> tutors = tutorService.getPendingTutors();
        return ResponseEntity.ok(tutors);
    }
    
    @GetMapping("/top-rated")
    @Operation(summary = "Get top rated tutors", description = "Retrieve tutors sorted by rating")
    public ResponseEntity<List<Tutor>> getTopRatedTutors() {
        List<Tutor> tutors = tutorService.getTopRatedTutors();
        return ResponseEntity.ok(tutors);
    }
    
    @GetMapping("/most-experienced")
    @Operation(summary = "Get most experienced tutors", description = "Retrieve tutors sorted by number of sessions")
    public ResponseEntity<List<Tutor>> getMostExperiencedTutors() {
        List<Tutor> tutors = tutorService.getMostExperiencedTutors();
        return ResponseEntity.ok(tutors);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search tutors", description = "Search tutors by various criteria")
    public ResponseEntity<List<Tutor>> searchTutors(
            @Parameter(description = "Subject to search") @RequestParam(required = false) String subject,
            @Parameter(description = "Minimum hourly rate") @RequestParam(required = false) BigDecimal minRate,
            @Parameter(description = "Maximum hourly rate") @RequestParam(required = false) BigDecimal maxRate,
            @Parameter(description = "Minimum rating") @RequestParam(required = false) BigDecimal minRating,
            @Parameter(description = "Minimum experience in years") @RequestParam(required = false) Integer minExperience) {
        
        // Set default values if not provided
        if (minRate == null) minRate = BigDecimal.ZERO;
        if (maxRate == null) maxRate = new BigDecimal("999999");
        if (minRating == null) minRating = BigDecimal.ZERO;
        if (minExperience == null) minExperience = 0;
        
        List<Tutor> tutors = tutorService.searchTutors(subject, minRate, maxRate, minRating, minExperience);
        return ResponseEntity.ok(tutors);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update tutor", description = "Update tutor information")
    public ResponseEntity<Tutor> updateTutor(
            @Parameter(description = "Tutor ID") @PathVariable Long id,
            @Valid @RequestBody Tutor tutor) {
        try {
            tutor.setId(id);
            Tutor updatedTutor = tutorService.updateTutor(tutor);
            return ResponseEntity.ok(updatedTutor);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @PutMapping("/{id}/approve")
    @Operation(summary = "Approve tutor", description = "Approve a pending tutor application")
    public ResponseEntity<Tutor> approveTutor(
            @Parameter(description = "Tutor ID") @PathVariable Long id,
            @Parameter(description = "Admin ID who approved") @RequestParam Long approvedById) {
        try {
            Tutor approvedTutor = tutorService.approveTutor(id, approvedById);
            return ResponseEntity.ok(approvedTutor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject tutor", description = "Reject a pending tutor application")
    public ResponseEntity<Tutor> rejectTutor(
            @Parameter(description = "Tutor ID") @PathVariable Long id,
            @Parameter(description = "Admin ID who rejected") @RequestParam Long rejectedById) {
        try {
            Tutor rejectedTutor = tutorService.rejectTutor(id, rejectedById);
            return ResponseEntity.ok(rejectedTutor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/rating")
    @Operation(summary = "Update tutor rating", description = "Update the rating of a tutor")
    public ResponseEntity<Tutor> updateTutorRating(
            @Parameter(description = "Tutor ID") @PathVariable Long id,
            @Parameter(description = "New rating") @RequestParam BigDecimal rating) {
        try {
            Tutor updatedTutor = tutorService.updateTutorRating(id, rating);
            return ResponseEntity.ok(updatedTutor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/increment-sessions")
    @Operation(summary = "Increment total sessions", description = "Increment the total number of sessions for a tutor")
    public ResponseEntity<Tutor> incrementTotalSessions(
            @Parameter(description = "Tutor ID") @PathVariable Long id) {
        try {
            Tutor updatedTutor = tutorService.incrementTotalSessions(id);
            return ResponseEntity.ok(updatedTutor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete tutor", description = "Delete a tutor profile")
    public ResponseEntity<Void> deleteTutor(
            @Parameter(description = "Tutor ID") @PathVariable Long id) {
        try {
            tutorService.deleteTutor(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/is-tutor/{userId}")
    @Operation(summary = "Check if user is tutor", description = "Check if a user has a tutor profile")
    public ResponseEntity<Boolean> isUserTutor(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        boolean isTutor = tutorService.isUserTutor(userId);
        return ResponseEntity.ok(isTutor);
    }
}
