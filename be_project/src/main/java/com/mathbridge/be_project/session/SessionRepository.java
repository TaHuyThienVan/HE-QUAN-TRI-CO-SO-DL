package com.mathbridge.be_project.session;

import com.mathbridge.be_project.common.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    
    // Find sessions by tutor
    @Query("SELECT s FROM Session s " +
           "LEFT JOIN FETCH s.tutor " +
           "LEFT JOIN FETCH s.student " +
           "WHERE s.tutor.id = :tutorId")
    List<Session> findByTutorId(@Param("tutorId") Long tutorId);
    
    // Find sessions by student
    @Query("SELECT s FROM Session s " +
           "LEFT JOIN FETCH s.tutor " +
           "LEFT JOIN FETCH s.student " +
           "WHERE s.student.id = :studentId")
    List<Session> findByStudentId(@Param("studentId") Long studentId);
    
    // Find sessions by status
    List<Session> findByStatus(SessionStatus status);
    
    // Find sessions by tutor and status
    List<Session> findByTutorIdAndStatus(Long tutorId, SessionStatus status);
    
    // Find sessions by student and status
    List<Session> findByStudentIdAndStatus(Long studentId, SessionStatus status);
    
    // Find sessions by date range
    @Query("SELECT s FROM Session s WHERE s.scheduledDate BETWEEN :startDate AND :endDate")
    List<Session> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                 @Param("endDate") LocalDateTime endDate);
    
    // Find sessions by tutor and date range
    @Query("SELECT s FROM Session s WHERE s.tutor.id = :tutorId AND s.scheduledDate BETWEEN :startDate AND :endDate")
    List<Session> findByTutorAndDateRange(@Param("tutorId") Long tutorId,
                                         @Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);
    
    // Find sessions by student and date range
    @Query("SELECT s FROM Session s WHERE s.student.id = :studentId AND s.scheduledDate BETWEEN :startDate AND :endDate")
    List<Session> findByStudentAndDateRange(@Param("studentId") Long studentId,
                                           @Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);
    
    // Find upcoming sessions for tutor
    @Query("SELECT s FROM Session s WHERE s.tutor.id = :tutorId AND s.scheduledDate > :now AND s.status IN ('SCHEDULED', 'CONFIRMED') ORDER BY s.scheduledDate ASC")
    List<Session> findUpcomingSessionsForTutor(@Param("tutorId") Long tutorId, @Param("now") LocalDateTime now);
    
    // Find upcoming sessions for student
    @Query("SELECT s FROM Session s WHERE s.student.id = :studentId AND s.scheduledDate > :now AND s.status IN ('SCHEDULED', 'CONFIRMED') ORDER BY s.scheduledDate ASC")
    List<Session> findUpcomingSessionsForStudent(@Param("studentId") Long studentId, @Param("now") LocalDateTime now);
    
    // Find completed sessions for tutor
    @Query("SELECT s FROM Session s WHERE s.tutor.id = :tutorId AND s.status = 'COMPLETED' ORDER BY s.scheduledDate DESC")
    List<Session> findCompletedSessionsForTutor(@Param("tutorId") Long tutorId);
    
    // Find completed sessions for student
    @Query("SELECT s FROM Session s WHERE s.student.id = :studentId AND s.status = 'COMPLETED' ORDER BY s.scheduledDate DESC")
    List<Session> findCompletedSessionsForStudent(@Param("studentId") Long studentId);
    
    // Find sessions by subject
    @Query("SELECT s FROM Session s WHERE LOWER(s.subject) LIKE LOWER(CONCAT('%', :subject, '%'))")
    List<Session> findBySubject(@Param("subject") String subject);
    
    // Check for conflicting sessions
    // Get all scheduled/confirmed sessions for tutor, then filter in Java for better compatibility
    @Query("SELECT s FROM Session s WHERE " +
           "s.tutor.id = :tutorId AND " +
           "s.status IN ('SCHEDULED', 'CONFIRMED') AND " +
           "s.scheduledDate >= :startTime AND s.scheduledDate < :endTime")
    List<Session> findConflictingSessions(@Param("tutorId") Long tutorId,
                                        @Param("startTime") LocalDateTime startTime,
                                        @Param("endTime") LocalDateTime endTime);
    
    // Count sessions by status for tutor
    @Query("SELECT COUNT(s) FROM Session s WHERE s.tutor.id = :tutorId AND s.status = :status")
    Long countSessionsByTutorAndStatus(@Param("tutorId") Long tutorId, @Param("status") SessionStatus status);
    
    // Count sessions by status for student
    @Query("SELECT COUNT(s) FROM Session s WHERE s.student.id = :studentId AND s.status = :status")
    Long countSessionsByStudentAndStatus(@Param("studentId") Long studentId, @Param("status") SessionStatus status);
}
