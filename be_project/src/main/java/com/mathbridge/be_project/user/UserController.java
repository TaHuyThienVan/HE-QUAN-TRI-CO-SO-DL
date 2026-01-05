package com.mathbridge.be_project.user;

import com.mathbridge.be_project.common.UserRole;
import com.mathbridge.be_project.common.UserStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    @Operation(summary = "Create a new user", description = "Create a new user account")
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve all users in the system")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by their ID")
    public ResponseEntity<User> getUserById(
            @Parameter(description = "User ID") @PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/email/{email}")
    @Operation(summary = "Get user by email", description = "Retrieve a user by their email address")
    public ResponseEntity<User> getUserByEmail(
            @Parameter(description = "Email address") @PathVariable String email) {
        Optional<User> user = userService.getUserByEmail(email);
        return user.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/role/{role}")
    @Operation(summary = "Get users by role", description = "Retrieve all users with a specific role")
    public ResponseEntity<List<User>> getUsersByRole(
            @Parameter(description = "User role") @PathVariable UserRole role) {
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get users by status", description = "Retrieve all users with a specific status")
    public ResponseEntity<List<User>> getUsersByStatus(
            @Parameter(description = "User status") @PathVariable UserStatus status) {
        List<User> users = userService.getUsersByStatus(status);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/tutors/pending")
    @Operation(summary = "Get pending tutors", description = "Retrieve all tutors waiting for approval")
    public ResponseEntity<List<User>> getPendingTutors() {
        List<User> tutors = userService.getPendingTutors();
        return ResponseEntity.ok(tutors);
    }
    
    @GetMapping("/tutors/active")
    @Operation(summary = "Get active tutors", description = "Retrieve all approved and active tutors")
    public ResponseEntity<List<User>> getActiveTutors() {
        List<User> tutors = userService.getActiveTutors();
        return ResponseEntity.ok(tutors);
    }
    
    @GetMapping("/students/parent/{parentId}")
    @Operation(summary = "Get students by parent", description = "Retrieve all students belonging to a specific parent")
    public ResponseEntity<List<User>> getStudentsByParent(
            @Parameter(description = "Parent ID") @PathVariable Long parentId) {
        List<User> students = userService.getStudentsByParent(parentId);
        return ResponseEntity.ok(students);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Search users by name or email")
    public ResponseEntity<List<User>> searchUsers(
            @Parameter(description = "Search keyword") @RequestParam String keyword) {
        List<User> users = userService.searchUsers(keyword);
        return ResponseEntity.ok(users);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Update user information")
    public ResponseEntity<User> updateUser(
            @Parameter(description = "User ID") @PathVariable Long id,
            @Valid @RequestBody User user) {
        try {
            user.setId(id);
            User updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @PutMapping("/{id}/status")
    @Operation(summary = "Update user status", description = "Update the status of a user")
    public ResponseEntity<User> updateUserStatus(
            @Parameter(description = "User ID") @PathVariable Long id,
            @Parameter(description = "New status") @RequestParam UserStatus status) {
        try {
            User updatedUser = userService.updateUserStatus(id, status);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/activate")
    @Operation(summary = "Activate user", description = "Activate a user account")
    public ResponseEntity<User> activateUser(
            @Parameter(description = "User ID") @PathVariable Long id) {
        try {
            User activatedUser = userService.activateUser(id);
            return ResponseEntity.ok(activatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate user", description = "Deactivate a user account")
    public ResponseEntity<User> deactivateUser(
            @Parameter(description = "User ID") @PathVariable Long id) {
        try {
            User deactivatedUser = userService.deactivateUser(id);
            return ResponseEntity.ok(deactivatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Delete a user account")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User ID") @PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/email-exists/{email}")
    @Operation(summary = "Check if email exists", description = "Check if an email address is already registered")
    public ResponseEntity<Boolean> emailExists(
            @Parameter(description = "Email address") @PathVariable String email) {
        boolean exists = userService.emailExists(email);
        return ResponseEntity.ok(exists);
    }
}
