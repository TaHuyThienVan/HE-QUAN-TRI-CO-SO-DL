package com.mathbridge.be_project.student;

import com.mathbridge.be_project.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

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
        
        return studentRepository.save(student);
    }

    public Student updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        applyRequest(student, request, false);
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

        if (request.getFullName() != null || allowNullOverwrite) {
            student.setFullName(request.getFullName());
        }
        if (request.getDob() != null || allowNullOverwrite) {
            student.setDob(request.getDob());
        }
        if (request.getGender() != null || allowNullOverwrite) {
            student.setGender(request.getGender());
        }
        if (request.getDistrict() != null || allowNullOverwrite) {
            student.setDistrict(request.getDistrict());
        }
        if (request.getEmail() != null || allowNullOverwrite) {
            student.setEmail(request.getEmail());
        }
        if (request.getPhone() != null || allowNullOverwrite) {
            student.setPhone(request.getPhone());
        }
        if (request.getGrade() != null || allowNullOverwrite) {
            student.setGrade(request.getGrade());
        }
        if (request.getAvatar() != null || allowNullOverwrite) {
            student.setAvatar(request.getAvatar());
        }
        if (request.getNote() != null || allowNullOverwrite) {
            student.setNote(request.getNote());
        }
    }
}

