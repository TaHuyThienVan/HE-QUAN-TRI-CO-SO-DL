package com.mathbridge.be_project.user;

import com.mathbridge.be_project.common.UserRole;
import com.mathbridge.be_project.common.UserStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Create new user
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    // Get user by ID
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    // Get user by email
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    // Get all users
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    // Get users by role
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }
    
    // Get users by status
    @Transactional(readOnly = true)
    public List<User> getUsersByStatus(UserStatus status) {
        return userRepository.findByStatus(status);
    }
    
    // Get pending tutors
    @Transactional(readOnly = true)
    public List<User> getPendingTutors() {
        return userRepository.findPendingTutors();
    }
    
    // Get active tutors
    @Transactional(readOnly = true)
    public List<User> getActiveTutors() {
        return userRepository.findActiveTutors();
    }
    
    // Get students by parent
    @Transactional(readOnly = true)
    public List<User> getStudentsByParent(Long parentId) {
        return userRepository.findStudentsByParent(parentId);
    }
    
    // Search users
    @Transactional(readOnly = true)
    public List<User> searchUsers(String keyword) {
        return userRepository.searchUsers(keyword);
    }
    
    // Update user
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    // Update user status
    public User updateUserStatus(Long userId, UserStatus status) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus(status);
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found with id: " + userId);
    }
    
    // Delete user
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    // Check if email exists
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }
    
    // Activate user
    public User activateUser(Long userId) {
        return updateUserStatus(userId, UserStatus.ACTIVE);
    }
    
    // Deactivate user
    public User deactivateUser(Long userId) {
        return updateUserStatus(userId, UserStatus.INACTIVE);
    }
}
