package com.mathbridge.be_project.tutor;

import com.mathbridge.be_project.common.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TutorRepository extends JpaRepository<Tutor, Long> {
    
    // Find by user ID
    Optional<Tutor> findByUserId(Long userId);
    
    // Find by approval status
    List<Tutor> findByApprovalStatus(ApprovalStatus status);
    
    // Find approved tutors
    List<Tutor> findByApprovalStatusOrderByRatingDesc(ApprovalStatus status);
    
    // Find tutors by subject
    @Query("SELECT t FROM Tutor t WHERE LOWER(t.subjects) LIKE LOWER(CONCAT('%', :subject, '%'))")
    List<Tutor> findBySubject(@Param("subject") String subject);
    
    // Find tutors by hourly rate range
    @Query("SELECT t FROM Tutor t WHERE t.hourlyRate BETWEEN :minRate AND :maxRate")
    List<Tutor> findByHourlyRateRange(@Param("minRate") BigDecimal minRate, @Param("maxRate") BigDecimal maxRate);
    
    // Find tutors by rating
    @Query("SELECT t FROM Tutor t WHERE t.rating >= :minRating")
    List<Tutor> findByMinRating(@Param("minRating") BigDecimal minRating);
    
    // Find tutors by experience
    @Query("SELECT t FROM Tutor t WHERE t.experience >= :minExperience")
    List<Tutor> findByMinExperience(@Param("minExperience") Integer minExperience);
    
    // Search tutors by multiple criteria
    @Query("SELECT t FROM Tutor t WHERE " +
           "t.approvalStatus = 'APPROVED' AND " +
           "(LOWER(t.subjects) LIKE LOWER(CONCAT('%', :subject, '%')) OR :subject IS NULL) AND " +
           "(t.hourlyRate BETWEEN :minRate AND :maxRate) AND " +
           "(t.rating >= :minRating) AND " +
           "(t.experience >= :minExperience)")
    List<Tutor> searchTutors(@Param("subject") String subject,
                            @Param("minRate") BigDecimal minRate,
                            @Param("maxRate") BigDecimal maxRate,
                            @Param("minRating") BigDecimal minRating,
                            @Param("minExperience") Integer minExperience);
    
    // Get top rated tutors
    @Query("SELECT t FROM Tutor t WHERE t.approvalStatus = 'APPROVED' ORDER BY t.rating DESC, t.totalSessions DESC")
    List<Tutor> findTopRatedTutors();
    
    // Get tutors with most sessions
    @Query("SELECT t FROM Tutor t WHERE t.approvalStatus = 'APPROVED' ORDER BY t.totalSessions DESC, t.rating DESC")
    List<Tutor> findMostExperiencedTutors();
}
