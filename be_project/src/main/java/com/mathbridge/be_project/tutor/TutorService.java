package com.mathbridge.be_project.tutor;

import com.mathbridge.be_project.common.ApprovalStatus;
import com.mathbridge.be_project.user.User;
import com.mathbridge.be_project.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TutorService {
    
    @Autowired
    private TutorRepository tutorRepository;
    
    @Autowired
    private UserService userService;
    
    // Create new tutor
    public Tutor createTutor(Tutor tutor) {
        return tutorRepository.save(tutor);
    }

    // Create or update tutor from request
    public Tutor createOrUpdateTutor(User user, TutorRequest request) {
        Optional<Tutor> existingTutor = tutorRepository.findByUserId(user.getId());
        Tutor tutor;
        
        if (existingTutor.isPresent()) {
            tutor = existingTutor.get();
        } else {
            tutor = new Tutor();
            tutor.setUser(user);
            // Generate employeeId if not provided
            if (request.getEmployeeId() == null || request.getEmployeeId().isEmpty()) {
                tutor.setEmployeeId(generateEmployeeId());
            } else {
                tutor.setEmployeeId(request.getEmployeeId());
            }
        }
        
        // Update fields from request - always update if provided
        if (request.getAvatar() != null) {
            tutor.setAvatar(request.getAvatar());
        }
        if (request.getDob() != null) {
            tutor.setDob(request.getDob());
        }
        // Update gender - allow null to clear the field
        if (request.getGender() != null) {
            tutor.setGender(request.getGender().isEmpty() ? null : request.getGender());
        }
        // Update title - allow null to clear the field
        if (request.getTitle() != null) {
            tutor.setTitle(request.getTitle().isEmpty() ? null : request.getTitle());
        }
        // Update degree - allow null to clear the field
        if (request.getDegree() != null) {
            tutor.setDegree(request.getDegree().isEmpty() ? null : request.getDegree());
        }
        // Update office - allow null to clear the field
        if (request.getOffice() != null) {
            tutor.setOffice(request.getOffice().isEmpty() ? null : request.getOffice());
        }
        // Map department to qualification (they are the same field)
        // Priority: department > qualification
        if (request.getDepartment() != null) {
            tutor.setQualification(request.getDepartment().isEmpty() ? null : request.getDepartment());
        } else if (request.getQualification() != null) {
            tutor.setQualification(request.getQualification().isEmpty() ? null : request.getQualification());
        }
        if (request.getExperience() != null) {
            tutor.setExperience(request.getExperience());
        }
        // Map teachGrades to subjects - check both fields
        // Priority: subjects > teachGrades
        if (request.getSubjects() != null) {
            tutor.setSubjects(request.getSubjects().isEmpty() ? null : request.getSubjects());
        } else if (request.getTeachGrades() != null) {
            tutor.setSubjects(request.getTeachGrades().isEmpty() ? null : request.getTeachGrades());
        }
        
        // Update user info if provided - reload user from database first to ensure we have the latest version
        boolean userUpdated = false;
        User userToUpdate = userService.getUserById(user.getId()).orElse(user);
        
        // Always update fullName if provided
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            userToUpdate.setFullName(request.getFullName().trim());
            userUpdated = true;
            System.out.println("Updating user fullName to: " + userToUpdate.getFullName());
        }
        // Update phone if provided (can be null to clear the field)
        // Check if phone field is present in request (not null means it was sent)
        if (request.getPhone() != null) {
            userToUpdate.setPhone(request.getPhone().trim().isEmpty() ? null : request.getPhone().trim());
            userUpdated = true;
            System.out.println("Updating user phone to: " + userToUpdate.getPhone());
        }
        if (userUpdated) {
            User savedUser = userService.updateUser(userToUpdate);
            System.out.println("User updated successfully. FullName: " + savedUser.getFullName() + ", Phone: " + savedUser.getPhone());
            // Update tutor's user reference to the saved user
            tutor.setUser(savedUser);
        }
        
        return tutorRepository.save(tutor);
    }

    // Generate unique employee ID
    private String generateEmployeeId() {
        // Format: GV + random 6 digits
        String prefix = "GV";
        int randomNum = (int) (Math.random() * 900000) + 100000; // 100000-999999
        return prefix + randomNum;
    }

    // Get tutor by user
    @Transactional(readOnly = true)
    public Optional<Tutor> getTutorByUser(User user) {
        Optional<Tutor> tutorOpt = tutorRepository.findByUserId(user.getId());
        // Force load user to avoid lazy loading issues
        if (tutorOpt.isPresent()) {
            Tutor tutor = tutorOpt.get();
            // Access user to trigger lazy loading
            tutor.getUser().getEmail();
        }
        return tutorOpt;
    }
    
    // Get tutor by ID
    @Transactional(readOnly = true)
    public Optional<Tutor> getTutorById(Long id) {
        return tutorRepository.findById(id);
    }
    
    // Get tutor by user ID
    @Transactional(readOnly = true)
    public Optional<Tutor> getTutorByUserId(Long userId) {
        return tutorRepository.findByUserId(userId);
    }
    
    // Get all tutors
    @Transactional(readOnly = true)
    public List<Tutor> getAllTutors() {
        return tutorRepository.findAll();
    }
    
    // Get tutors by approval status
    @Transactional(readOnly = true)
    public List<Tutor> getTutorsByApprovalStatus(ApprovalStatus status) {
        return tutorRepository.findByApprovalStatus(status);
    }
    
    // Get approved tutors
    @Transactional(readOnly = true)
    public List<Tutor> getApprovedTutors() {
        return tutorRepository.findByApprovalStatusOrderByRatingDesc(ApprovalStatus.APPROVED);
    }
    
    // Get pending tutors
    @Transactional(readOnly = true)
    public List<Tutor> getPendingTutors() {
        return tutorRepository.findByApprovalStatus(ApprovalStatus.PENDING);
    }
    
    // Search tutors
    @Transactional(readOnly = true)
    public List<Tutor> searchTutors(String subject, BigDecimal minRate, BigDecimal maxRate, 
                                   BigDecimal minRating, Integer minExperience) {
        return tutorRepository.searchTutors(subject, minRate, maxRate, minRating, minExperience);
    }
    
    // Get top rated tutors
    @Transactional(readOnly = true)
    public List<Tutor> getTopRatedTutors() {
        return tutorRepository.findTopRatedTutors();
    }
    
    // Get most experienced tutors
    @Transactional(readOnly = true)
    public List<Tutor> getMostExperiencedTutors() {
        return tutorRepository.findMostExperiencedTutors();
    }
    
    // Update tutor
    public Tutor updateTutor(Tutor tutor) {
        return tutorRepository.save(tutor);
    }
    
    // Approve tutor
    public Tutor approveTutor(Long tutorId, Long approvedById) {
        Optional<Tutor> tutorOpt = tutorRepository.findById(tutorId);
        if (tutorOpt.isPresent()) {
            Tutor tutor = tutorOpt.get();
            tutor.setApprovalStatus(ApprovalStatus.APPROVED);
            tutor.setApprovedAt(LocalDateTime.now());
            
            Optional<User> approverOpt = userService.getUserById(approvedById);
            if (approverOpt.isPresent()) {
                tutor.setApprovedBy(approverOpt.get());
            }
            
            // Activate the user account
            userService.activateUser(tutor.getUser().getId());
            
            return tutorRepository.save(tutor);
        }
        throw new RuntimeException("Tutor not found with id: " + tutorId);
    }
    
    // Reject tutor
    public Tutor rejectTutor(Long tutorId, Long rejectedById) {
        Optional<Tutor> tutorOpt = tutorRepository.findById(tutorId);
        if (tutorOpt.isPresent()) {
            Tutor tutor = tutorOpt.get();
            tutor.setApprovalStatus(ApprovalStatus.REJECTED);
            tutor.setApprovedAt(LocalDateTime.now());
            
            Optional<User> rejecterOpt = userService.getUserById(rejectedById);
            if (rejecterOpt.isPresent()) {
                tutor.setApprovedBy(rejecterOpt.get());
            }
            
            // Deactivate the user account
            userService.deactivateUser(tutor.getUser().getId());
            
            return tutorRepository.save(tutor);
        }
        throw new RuntimeException("Tutor not found with id: " + tutorId);
    }
    
    // Update tutor rating
    public Tutor updateTutorRating(Long tutorId, BigDecimal newRating) {
        Optional<Tutor> tutorOpt = tutorRepository.findById(tutorId);
        if (tutorOpt.isPresent()) {
            Tutor tutor = tutorOpt.get();
            tutor.setRating(newRating);
            return tutorRepository.save(tutor);
        }
        throw new RuntimeException("Tutor not found with id: " + tutorId);
    }
    
    // Increment total sessions
    public Tutor incrementTotalSessions(Long tutorId) {
        Optional<Tutor> tutorOpt = tutorRepository.findById(tutorId);
        if (tutorOpt.isPresent()) {
            Tutor tutor = tutorOpt.get();
            tutor.setTotalSessions(tutor.getTotalSessions() + 1);
            return tutorRepository.save(tutor);
        }
        throw new RuntimeException("Tutor not found with id: " + tutorId);
    }
    
    // Delete tutor
    public void deleteTutor(Long id) {
        tutorRepository.deleteById(id);
    }
    
    // Check if user is already a tutor
    @Transactional(readOnly = true)
    public boolean isUserTutor(Long userId) {
        return tutorRepository.findByUserId(userId).isPresent();
    }
}
