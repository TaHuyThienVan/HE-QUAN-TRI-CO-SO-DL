package com.mathbridge.be_project.student;

import com.mathbridge.be_project.user.User;
import com.mathbridge.be_project.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserService userService;

    @Transactional
    public Student createStudent(User user, StudentRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Student data is required");
        }
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }

        // Kiểm tra xem user đã có student record chưa (do @OneToOne unique constraint)
        Optional<Student> existingStudent = studentRepository.findByUser(user);
        Student student;
        
        if (existingStudent.isPresent()) {
            // Nếu đã có student, cập nhật thông tin
            student = existingStudent.get();
            applyRequest(student, request, true);
        } else {
            // Nếu chưa có, tạo mới
            student = new Student();
            student.setUser(user);
            applyRequest(student, request, true);
        }
        
        // Cập nhật thông tin User nếu có thay đổi (fullName, phone)
        updateUserFromRequest(user, request);
        
        return studentRepository.save(student);
    }

    public Student updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        applyRequest(student, request, false);
        
        // Cập nhật thông tin User nếu có thay đổi
        if (student.getUser() != null) {
            updateUserFromRequest(student.getUser(), request);
        }
        
        return studentRepository.save(student);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
    }

    public Optional<Student> getStudentByUser(User user) {
        return studentRepository.findByUser(user);
    }

    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    private void applyRequest(Student student, StudentRequest request, boolean allowNullOverwrite) {
        if (request == null) {
            return;
        }

        // Only update fields that are provided in the request, or if allowNullOverwrite is true (for new records)
        // For existing records, only update if the value is not null
        if (request.getFullName() != null) {
            student.setFullName(request.getFullName());
        } else if (allowNullOverwrite && student.getFullName() == null) {
            // Only set to null if creating new record and field is not set
            student.setFullName(null);
        }
        
        if (request.getDob() != null) {
            student.setDob(request.getDob());
        } else if (allowNullOverwrite) {
            student.setDob(null);
        }
        
        if (request.getGender() != null) {
            student.setGender(request.getGender());
        } else if (allowNullOverwrite) {
            student.setGender(null);
        }
        
        if (request.getDistrict() != null) {
            student.setDistrict(request.getDistrict());
        } else if (allowNullOverwrite) {
            student.setDistrict(null);
        }
        
        if (request.getEmail() != null) {
            student.setEmail(request.getEmail());
        } else if (allowNullOverwrite) {
            student.setEmail(null);
        }
        
        if (request.getPhone() != null) {
            student.setPhone(request.getPhone());
        } else if (allowNullOverwrite) {
            student.setPhone(null);
        }
        
        if (request.getGrade() != null) {
            student.setGrade(request.getGrade());
        } else if (allowNullOverwrite) {
            student.setGrade(null);
        }
        
        if (request.getAvatar() != null) {
            student.setAvatar(request.getAvatar());
        } else if (allowNullOverwrite) {
            student.setAvatar(null);
        }
        
        if (request.getNote() != null) {
            student.setNote(request.getNote());
        } else if (allowNullOverwrite) {
            student.setNote(null);
        }
    }
    
    /**
     * Cập nhật thông tin User từ StudentRequest
     * Cập nhật fullName và phone trong bảng users khi cập nhật student
     */
    private void updateUserFromRequest(User user, StudentRequest request) {
        if (request == null || user == null) {
            return;
        }
        
        // Reload user from database to ensure we have the latest version
        User userToUpdate = userService.getUserById(user.getId()).orElse(user);
        boolean userUpdated = false;
        
        // Cập nhật fullName nếu có trong request
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            userToUpdate.setFullName(request.getFullName().trim());
            userUpdated = true;
        }
        
        // Cập nhật phone nếu có trong request (có thể là null để xóa)
        if (request.getPhone() != null) {
            userToUpdate.setPhone(request.getPhone().trim().isEmpty() ? null : request.getPhone().trim());
            userUpdated = true;
        }
        
        // Lưu user nếu có thay đổi
        if (userUpdated) {
            userService.updateUser(userToUpdate);
        }
    }
}

