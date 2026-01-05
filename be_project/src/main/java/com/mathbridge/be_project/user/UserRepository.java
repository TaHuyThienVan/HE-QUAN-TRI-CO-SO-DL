package com.mathbridge.be_project.user;

import com.mathbridge.be_project.common.UserRole;
import com.mathbridge.be_project.common.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find by email
    Optional<User> findByEmail(String email);
    
    // Find by role
    List<User> findByRole(UserRole role);
    
    // Find by status
    List<User> findByStatus(UserStatus status);
    
    // Find by role and status
    List<User> findByRoleAndStatus(UserRole role, UserStatus status);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Find tutors pending approval
    @Query("SELECT u FROM User u WHERE u.role = 'TUTOR' AND u.status = 'PENDING'")
    List<User> findPendingTutors();
    
    // Find active tutors
    @Query("SELECT u FROM User u WHERE u.role = 'TUTOR' AND u.status = 'ACTIVE'")
    List<User> findActiveTutors();
    
    // Find students by parent
    @Query("SELECT u FROM User u WHERE u.role = 'STUDENT' AND u.id IN " +
           "(SELECT s.user.id FROM Student s WHERE s.parent.id = :parentId)")
    List<User> findStudentsByParent(@Param("parentId") Long parentId);
    
    // Search users by name or email
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchUsers(@Param("keyword") String keyword);
}
