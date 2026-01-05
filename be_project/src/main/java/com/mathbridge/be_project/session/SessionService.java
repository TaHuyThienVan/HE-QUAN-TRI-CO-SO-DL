package com.mathbridge.be_project.session;

import com.mathbridge.be_project.common.SessionStatus;
import com.mathbridge.be_project.student.Student;
import com.mathbridge.be_project.student.StudentRepository;
import com.mathbridge.be_project.tutor.Tutor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SessionService {
    
    @Autowired
    private SessionRepository sessionRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    // Create new session
    public Session createSession(Session session) {
        // Check for conflicts before creating
        if (hasConflictingSessions(session.getTutor().getId(), 
                                  session.getScheduledDate(), 
                                  session.getScheduledDate().plusMinutes(session.getDuration()))) {
            throw new RuntimeException("Conflicting session exists for the selected time slot");
        }
        
        return sessionRepository.save(session);
    }
    
    // Create session from request (simplified form data)
    public Session createSessionFromRequest(SessionRequest request, Tutor tutor) {
        // Combine date and time into LocalDateTime
        LocalDateTime scheduledDate = request.getDate().atTime(request.getTime());
        
        // Get student from request or use first available student from database
        Student student = getStudentFromRequest(request);
        
        // Set subject (default to "Toán học" if not provided)
        String subject = (request.getSubject() != null && !request.getSubject().trim().isEmpty()) 
                ? request.getSubject().trim() 
                : "Toán học";
        
        // Set duration (default to 60 minutes)
        Integer duration = 60;
        
        // Get hourly rate from tutor, or default to 0
        BigDecimal hourlyRate = tutor.getHourlyRate() != null && tutor.getHourlyRate().compareTo(BigDecimal.ZERO) > 0
                ? tutor.getHourlyRate()
                : BigDecimal.valueOf(200000); // Default 200,000 VND per hour
        
        // Calculate total amount
        BigDecimal totalAmount = hourlyRate.multiply(BigDecimal.valueOf(duration / 60.0));
        
        // Set location based on method
        String location = "online".equalsIgnoreCase(request.getMethod()) 
                ? "Online (Zoom / Google Meet)" 
                : "Học trực tiếp";
        
        // Verify student ID exists in database before creating session
        if (student.getId() == null || !studentRepository.existsById(student.getId())) {
            throw new RuntimeException("Học sinh không tồn tại trong hệ thống. Vui lòng chọn học sinh khác.");
        }
        
        // Create session
        Session session = new Session();
        session.setTutor(tutor);
        session.setStudent(student);
        session.setSubject(subject);
        session.setScheduledDate(scheduledDate);
        session.setDuration(duration);
        session.setStatus(SessionStatus.SCHEDULED);
        session.setLocation(location);
        session.setNotes(request.getNote());
        session.setHourlyRate(hourlyRate);
        session.setTotalAmount(totalAmount);
        
        // Check for conflicts before creating
        if (hasConflictingSessions(tutor.getId(), 
                                  scheduledDate, 
                                  scheduledDate.plusMinutes(duration))) {
            throw new RuntimeException("Đã có lịch học trùng thời gian. Vui lòng chọn thời gian khác.");
        }
        
        try {
            return sessionRepository.save(session);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Handle foreign key constraint violations
            if (e.getMessage() != null && e.getMessage().contains("FOREIGN KEY")) {
                throw new RuntimeException("Lỗi: Học sinh không tồn tại trong hệ thống. Vui lòng chọn học sinh khác hoặc thêm học sinh mới.");
            }
            throw e;
        }
    }
    
    // Get student from request or use first available student from database
    private Student getStudentFromRequest(SessionRequest request) {
        Student student = null;
        
        // If studentId is provided, use that student
        if (request.getStudentId() != null && request.getStudentId() > 0) {
            Optional<Student> studentOpt = studentRepository.findById(request.getStudentId());
            if (studentOpt.isPresent()) {
                student = studentOpt.get();
                // Verify student actually exists and has an ID
                if (student.getId() == null) {
                    throw new RuntimeException("Học sinh không hợp lệ: ID không tồn tại");
                }
            } else {
                throw new RuntimeException("Không tìm thấy học sinh với ID: " + request.getStudentId() + ". Vui lòng chọn học sinh khác hoặc thêm học sinh mới.");
            }
        } else {
            // Otherwise, get the first available student from database
            List<Student> students = studentRepository.findAll();
            if (students.isEmpty()) {
                throw new RuntimeException("Không có học sinh nào trong hệ thống. Vui lòng thêm học sinh trước khi đặt lịch học.");
            }
            
            student = students.get(0);
            System.out.println("WARNING: No student selected, using first student from database. Student ID: " + student.getId() + ", Name: " + student.getFullName());
            // Verify student has an ID
            if (student.getId() == null) {
                throw new RuntimeException("Học sinh không hợp lệ: ID không tồn tại");
            }
        }
        
        System.out.println("Creating session with Student ID: " + student.getId() + ", Name: " + student.getFullName());
        
        // Final verification: ensure student ID is valid
        if (student == null || student.getId() == null) {
            throw new RuntimeException("Không thể xác định học sinh cho buổi học. Vui lòng thử lại.");
        }
        
        return student;
    }
    
    // Get session by ID
    @Transactional(readOnly = true)
    public Optional<Session> getSessionById(Long id) {
        return sessionRepository.findById(id);
    }
    
    // Get all sessions
    @Transactional(readOnly = true)
    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }
    
    // Get sessions by tutor
    @Transactional(readOnly = true)
    public List<Session> getSessionsByTutor(Long tutorId) {
        List<Session> sessions = sessionRepository.findByTutorId(tutorId);
        // Trigger lazy loading for User in Tutor and Student to avoid LazyInitializationException
        if (sessions != null) {
            for (Session session : sessions) {
                if (session.getTutor() != null && session.getTutor().getUser() != null) {
                    // Trigger lazy loading
                    session.getTutor().getUser().getEmail();
                    session.getTutor().getUser().getFullName();
                }
                if (session.getStudent() != null && session.getStudent().getUser() != null) {
                    // Trigger lazy loading
                    session.getStudent().getUser().getEmail();
                    session.getStudent().getUser().getFullName();
                }
            }
        }
        return sessions;
    }
    
    // Get sessions by student
    @Transactional(readOnly = true)
    public List<Session> getSessionsByStudent(Long studentId) {
        List<Session> sessions = sessionRepository.findByStudentId(studentId);
        // Trigger lazy loading for User in Tutor and Student to avoid LazyInitializationException
        if (sessions != null) {
            for (Session session : sessions) {
                if (session.getTutor() != null && session.getTutor().getUser() != null) {
                    // Trigger lazy loading
                    session.getTutor().getUser().getEmail();
                    session.getTutor().getUser().getFullName();
                }
                if (session.getStudent() != null && session.getStudent().getUser() != null) {
                    // Trigger lazy loading
                    session.getStudent().getUser().getEmail();
                    session.getStudent().getUser().getFullName();
                }
            }
        }
        return sessions;
    }
    
    // Get sessions by status
    @Transactional(readOnly = true)
    public List<Session> getSessionsByStatus(SessionStatus status) {
        return sessionRepository.findByStatus(status);
    }
    
    // Get upcoming sessions for tutor
    @Transactional(readOnly = true)
    public List<Session> getUpcomingSessionsForTutor(Long tutorId) {
        return sessionRepository.findUpcomingSessionsForTutor(tutorId, LocalDateTime.now());
    }
    
    // Get upcoming sessions for student
    @Transactional(readOnly = true)
    public List<Session> getUpcomingSessionsForStudent(Long studentId) {
        return sessionRepository.findUpcomingSessionsForStudent(studentId, LocalDateTime.now());
    }
    
    // Get completed sessions for tutor
    @Transactional(readOnly = true)
    public List<Session> getCompletedSessionsForTutor(Long tutorId) {
        return sessionRepository.findCompletedSessionsForTutor(tutorId);
    }
    
    // Get completed sessions for student
    @Transactional(readOnly = true)
    public List<Session> getCompletedSessionsForStudent(Long studentId) {
        return sessionRepository.findCompletedSessionsForStudent(studentId);
    }
    
    // Get sessions by date range
    @Transactional(readOnly = true)
    public List<Session> getSessionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return sessionRepository.findByDateRange(startDate, endDate);
    }
    
    // Update session
    public Session updateSession(Session session) {
        return sessionRepository.save(session);
    }
    
    // Confirm session
    public Session confirmSession(Long sessionId) {
        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            Session session = sessionOpt.get();
            if (session.getStatus() == SessionStatus.SCHEDULED) {
                session.setStatus(SessionStatus.CONFIRMED);
                return sessionRepository.save(session);
            } else {
                throw new RuntimeException("Session cannot be confirmed. Current status: " + session.getStatus());
            }
        }
        throw new RuntimeException("Session not found with id: " + sessionId);
    }
    
    // Complete session
    public Session completeSession(Long sessionId) {
        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            Session session = sessionOpt.get();
            if (session.getStatus() == SessionStatus.CONFIRMED) {
                session.setStatus(SessionStatus.COMPLETED);
                return sessionRepository.save(session);
            } else {
                throw new RuntimeException("Session cannot be completed. Current status: " + session.getStatus());
            }
        }
        throw new RuntimeException("Session not found with id: " + sessionId);
    }
    
    // Cancel session
    public Session cancelSession(Long sessionId) {
        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            Session session = sessionOpt.get();
            if (session.getStatus() != SessionStatus.COMPLETED) {
                session.setStatus(SessionStatus.CANCELLED);
                return sessionRepository.save(session);
            } else {
                throw new RuntimeException("Cannot cancel completed session");
            }
        }
        throw new RuntimeException("Session not found with id: " + sessionId);
    }
    
    // Check for conflicting sessions
    @Transactional(readOnly = true)
    public boolean hasConflictingSessions(Long tutorId, LocalDateTime startTime, LocalDateTime endTime) {
        // Get all sessions for this tutor that might overlap (wider range)
        LocalDateTime checkStart = startTime.minusHours(2);
        LocalDateTime checkEnd = endTime.plusHours(2);
        List<Session> potentialConflicts = sessionRepository.findByTutorAndDateRange(
            tutorId, 
            checkStart, 
            checkEnd
        );
        
        // Filter to only SCHEDULED/CONFIRMED sessions and check for actual overlap
        return potentialConflicts.stream()
            .filter(s -> s.getStatus() == SessionStatus.SCHEDULED || s.getStatus() == SessionStatus.CONFIRMED)
            .anyMatch(s -> {
                LocalDateTime sStart = s.getScheduledDate();
                LocalDateTime sEnd = sStart.plusMinutes(s.getDuration());
                // Check if time ranges overlap
                return (startTime.isBefore(sEnd) && endTime.isAfter(sStart));
            });
    }
    
    // Calculate cancellation fee
    public BigDecimal calculateCancellationFee(Session session) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sessionTime = session.getScheduledDate();
        
        long hoursUntilSession = java.time.Duration.between(now, sessionTime).toHours();
        
        if (hoursUntilSession >= 12) {
            return BigDecimal.ZERO; // No fee if cancelled 12+ hours before
        } else if (hoursUntilSession > 0) {
            return session.getTotalAmount().multiply(new BigDecimal("0.5")); // 50% fee if cancelled within 12 hours
        } else {
            return session.getTotalAmount(); // 100% fee if cancelled after session time
        }
    }
    
    // Delete session
    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }
    
    // Count sessions by status for tutor
    @Transactional(readOnly = true)
    public Long countSessionsByTutorAndStatus(Long tutorId, SessionStatus status) {
        return sessionRepository.countSessionsByTutorAndStatus(tutorId, status);
    }
    
    // Count sessions by status for student
    @Transactional(readOnly = true)
    public Long countSessionsByStudentAndStatus(Long studentId, SessionStatus status) {
        return sessionRepository.countSessionsByStudentAndStatus(studentId, status);
    }
    
    // Create session from request for student booking (with optimistic locking)
    public Session createSessionFromRequestForStudent(SessionRequest request, Tutor tutor, Student student) {
        // Combine date and time into LocalDateTime
        LocalDateTime scheduledDate = request.getDate().atTime(request.getTime());
        
        // Set subject (default to "Toán học" if not provided)
        String subject = (request.getSubject() != null && !request.getSubject().trim().isEmpty()) 
                ? request.getSubject().trim() 
                : "Toán học";
        
        // Set duration (default to 60 minutes)
        Integer duration = 60;
        
        // Get hourly rate from tutor, or default to 200,000 VND
        BigDecimal hourlyRate = tutor.getHourlyRate() != null && tutor.getHourlyRate().compareTo(BigDecimal.ZERO) > 0
                ? tutor.getHourlyRate()
                : BigDecimal.valueOf(200000);
        
        // Calculate total amount
        BigDecimal totalAmount = hourlyRate.multiply(BigDecimal.valueOf(duration / 60.0));
        
        // Set location based on method
        String location = "online".equalsIgnoreCase(request.getMethod()) 
                ? "Online (Zoom / Google Meet)" 
                : "Học trực tiếp";
        
        // CRITICAL: Double-check for conflicts with database lock to prevent race conditions
        // This is the "optimistic locking" approach - check right before save
        // Get all sessions for this tutor that might overlap
        LocalDateTime checkStart = scheduledDate.minusHours(2);
        LocalDateTime checkEnd = scheduledDate.plusHours(2);
        List<Session> potentialConflicts = sessionRepository.findByTutorAndDateRange(
            tutor.getId(), 
            checkStart, 
            checkEnd
        );
        
        // Filter to only SCHEDULED/CONFIRMED sessions and check for actual overlap
        LocalDateTime slotEnd = scheduledDate.plusMinutes(duration);
        boolean hasConflict = potentialConflicts.stream()
            .filter(s -> s.getStatus() == SessionStatus.SCHEDULED || s.getStatus() == SessionStatus.CONFIRMED)
            .anyMatch(s -> {
                LocalDateTime sStart = s.getScheduledDate();
                LocalDateTime sEnd = sStart.plusMinutes(s.getDuration());
                // Check if time ranges overlap
                return (scheduledDate.isBefore(sEnd) && slotEnd.isAfter(sStart));
            });
        
        if (hasConflict) {
            throw new RuntimeException("Slot học phần này đã bị người khác đăng ký. Vui lòng chọn slot khác.");
        }
        
        // Create session
        Session session = new Session();
        session.setTutor(tutor);
        session.setStudent(student);
        session.setSubject(subject);
        session.setScheduledDate(scheduledDate);
        session.setDuration(duration);
        session.setStatus(SessionStatus.SCHEDULED);
        session.setLocation(location);
        session.setNotes(request.getNote());
        session.setHourlyRate(hourlyRate);
        session.setTotalAmount(totalAmount);
        
        try {
            // Save with transaction - if conflict occurs here, database will throw exception
            Session savedSession = sessionRepository.save(session);
            
            // Double-check after save (final verification)
            List<Session> postSaveConflicts = sessionRepository.findConflictingSessions(
                tutor.getId(), 
                scheduledDate, 
                scheduledDate.plusMinutes(duration)
            );
            
            // If we find conflicts other than our own session, something went wrong
            boolean hasOtherConflicts = postSaveConflicts.stream()
                .anyMatch(s -> !s.getId().equals(savedSession.getId()));
            
            if (hasOtherConflicts) {
                // Rollback by deleting the session we just created
                sessionRepository.delete(savedSession);
                throw new RuntimeException("Slot học phần này đã bị người khác đăng ký. Vui lòng chọn slot khác.");
            }
            
            return savedSession;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Database constraint violation - slot was taken
            throw new RuntimeException("Slot học phần này đã bị người khác đăng ký. Vui lòng chọn slot khác.");
        }
    }
    
    // Get available slots for a tutor on a specific date
    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getAvailableSlots(Long tutorId, String dateStr) {
        java.util.List<java.util.Map<String, Object>> slots = new java.util.ArrayList<>();
        
        // Default to today if no date provided
        java.time.LocalDate targetDate;
        if (dateStr == null || dateStr.isEmpty()) {
            targetDate = java.time.LocalDate.now();
        } else {
            try {
                targetDate = java.time.LocalDate.parse(dateStr);
            } catch (Exception e) {
                targetDate = java.time.LocalDate.now();
            }
        }
        
        // Generate time slots from 8:00 to 20:00 (every hour)
        java.time.LocalTime[] timeSlots = {
            java.time.LocalTime.of(8, 0),
            java.time.LocalTime.of(9, 0),
            java.time.LocalTime.of(10, 0),
            java.time.LocalTime.of(11, 0),
            java.time.LocalTime.of(13, 0),
            java.time.LocalTime.of(14, 0),
            java.time.LocalTime.of(15, 0),
            java.time.LocalTime.of(16, 0),
            java.time.LocalTime.of(17, 0),
            java.time.LocalTime.of(18, 0),
            java.time.LocalTime.of(19, 0),
            java.time.LocalTime.of(20, 0)
        };
        
        // Get all booked sessions for this tutor on this date
        java.time.LocalDateTime startOfDay = targetDate.atStartOfDay();
        java.time.LocalDateTime endOfDay = targetDate.atTime(23, 59, 59);
        List<Session> bookedSessions = sessionRepository.findByTutorAndDateRange(tutorId, startOfDay, endOfDay);
        
        // Filter only SCHEDULED or CONFIRMED sessions
        bookedSessions = bookedSessions.stream()
            .filter(s -> s.getStatus() == SessionStatus.SCHEDULED || s.getStatus() == SessionStatus.CONFIRMED)
            .collect(java.util.stream.Collectors.toList());
        
        // Check each time slot
        for (java.time.LocalTime time : timeSlots) {
            java.time.LocalDateTime slotStart = targetDate.atTime(time);
            java.time.LocalDateTime slotEnd = slotStart.plusMinutes(60);
            
            // Check if this slot conflicts with any booked session
            boolean isAvailable = true;
            String conflictInfo = null;
            
            for (Session bookedSession : bookedSessions) {
                java.time.LocalDateTime bookedStart = bookedSession.getScheduledDate();
                java.time.LocalDateTime bookedEnd = bookedStart.plusMinutes(bookedSession.getDuration());
                
                // Check for overlap
                if ((slotStart.isBefore(bookedEnd) && slotEnd.isAfter(bookedStart))) {
                    isAvailable = false;
                    conflictInfo = "Đã được đăng ký";
                    break;
                }
            }
            
            // Don't show past slots
            if (slotStart.isBefore(LocalDateTime.now())) {
                isAvailable = false;
                conflictInfo = "Đã qua";
            }
            
            java.util.Map<String, Object> slotInfo = new java.util.HashMap<>();
            slotInfo.put("time", time.toString());
            slotInfo.put("date", targetDate.toString());
            slotInfo.put("available", isAvailable);
            slotInfo.put("status", conflictInfo != null ? conflictInfo : "Có thể đăng ký");
            slotInfo.put("scheduledDate", slotStart.toString());
            slots.add(slotInfo);
        }
        
        return slots;
    }
}
