package com.mathbridge.be_project.courseregistration;

import com.mathbridge.be_project.student.Student;
import com.mathbridge.be_project.student.StudentRepository;
import com.mathbridge.be_project.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseRegistrationService {

    private final CourseRegistrationRepository courseRegistrationRepository;
    private final StudentRepository studentRepository;

    /**
     * Đăng ký môn học cho student
     */
    public CourseRegistration registerCourse(User user, CourseRegistrationRequest request) {
        System.out.println("=== CourseRegistrationService.registerCourse ===");
        System.out.println("User: " + (user != null ? user.getEmail() : "null"));
        System.out.println("Request: " + request);
        
        if (request == null || request.getCourseName() == null || request.getCourseName().trim().isEmpty()) {
            System.out.println("ERROR: Course name is required");
            throw new IllegalArgumentException("Tên môn học là bắt buộc");
        }

        // Tìm student từ user
        if (user == null) {
            throw new IllegalArgumentException("User không được null");
        }
        
        System.out.println("Finding student for user ID: " + user.getId());
        Optional<Student> studentOpt = studentRepository.findByUser(user);
        
        if (studentOpt.isEmpty()) {
            System.out.println("ERROR: Student not found for user: " + user.getEmail());
            // Tự động tạo Student record nếu chưa có
            System.out.println("Attempting to create Student record...");
            Student newStudent = new Student();
            newStudent.setUser(user);
            newStudent.setFullName(user.getFullName() != null && !user.getFullName().isEmpty() 
                    ? user.getFullName() : "Học sinh");
            newStudent.setEmail(user.getEmail());
            newStudent = studentRepository.save(newStudent);
            System.out.println("Created new Student record with ID: " + newStudent.getId());
            studentOpt = Optional.of(newStudent);
        }

        Student student = studentOpt.get();
        System.out.println("Found student with ID: " + student.getId());
        String courseName = request.getCourseName().trim();
        System.out.println("Course name: " + courseName);

        // Kiểm tra xem đã đăng ký môn này chưa (chỉ kiểm tra các môn có status REGISTERED)
        Optional<CourseRegistration> existingRegistration = courseRegistrationRepository.findByStudentAndCourseName(student, courseName);
        System.out.println("Checking existing registration...");
        
        if (existingRegistration.isPresent()) {
            CourseRegistration existing = existingRegistration.get();
            System.out.println("Found existing registration with status: " + existing.getStatus());
            // Chỉ báo lỗi nếu môn học đã được đăng ký với status REGISTERED
            if ("REGISTERED".equals(existing.getStatus())) {
                System.out.println("ERROR: Course already registered with REGISTERED status");
                throw new IllegalArgumentException("Bạn đã đăng ký môn học này rồi.");
            }
            // Nếu môn học đã bị hủy (CANCELLED), cho phép đăng ký lại
            System.out.println("Existing registration has status: " + existing.getStatus() + ", allowing re-registration");
        }

        // Tạo đăng ký mới
        System.out.println("Creating new course registration...");
        CourseRegistration registration = new CourseRegistration();
        registration.setStudent(student);
        registration.setCourseName(courseName);
        registration.setSemester(request.getSemester() != null ? request.getSemester().trim() : getCurrentSemester());
        registration.setStatus("REGISTERED");
        registration.setRegisteredAt(LocalDateTime.now());

        System.out.println("Saving course registration...");
        CourseRegistration saved = courseRegistrationRepository.save(registration);
        System.out.println("Course registration saved with ID: " + saved.getId());
        
        return saved;
    }

    /**
     * Lấy danh sách môn học đã đăng ký của student
     */
    @Transactional(readOnly = true)
    public List<CourseRegistration> getRegisteredCourses(User user) {
        Optional<Student> studentOpt = studentRepository.findByUser(user);
        if (studentOpt.isEmpty()) {
            return List.of();
        }
        return courseRegistrationRepository.findByStudent(studentOpt.get());
    }

    /**
     * Lấy danh sách môn học đã đăng ký của student theo ID
     */
    @Transactional(readOnly = true)
    public List<CourseRegistration> getRegisteredCoursesByStudentId(Long studentId) {
        return courseRegistrationRepository.findByStudent_Id(studentId);
    }

    /**
     * Hủy đăng ký môn học
     */
    public void cancelRegistration(Long registrationId, User user) {
        Optional<CourseRegistration> registrationOpt = courseRegistrationRepository.findById(registrationId);
        if (registrationOpt.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy đăng ký môn học");
        }

        CourseRegistration registration = registrationOpt.get();
        
        // Kiểm tra quyền (chỉ student sở hữu mới được hủy)
        if (!registration.getStudent().getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền hủy đăng ký này");
        }

        registration.setStatus("CANCELLED");
        courseRegistrationRepository.save(registration);
    }

    /**
     * Xóa đăng ký (hard delete)
     */
    public void deleteRegistration(Long registrationId, User user) {
        Optional<CourseRegistration> registrationOpt = courseRegistrationRepository.findById(registrationId);
        if (registrationOpt.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy đăng ký môn học");
        }

        CourseRegistration registration = registrationOpt.get();
        
        // Kiểm tra quyền
        if (!registration.getStudent().getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa đăng ký này");
        }

        courseRegistrationRepository.delete(registration);
    }

    /**
     * Lấy kỳ học hiện tại (có thể cải thiện logic này sau)
     */
    private String getCurrentSemester() {
        int month = LocalDateTime.now().getMonthValue();
        int year = LocalDateTime.now().getYear();
        
        // Giả sử kỳ 1: 9-12, kỳ 2: 1-5, kỳ hè: 6-8
        if (month >= 9 || month <= 1) {
            return "Kỳ 1 - Năm học " + year + "-" + (year + 1);
        } else if (month >= 2 && month <= 5) {
            return "Kỳ 2 - Năm học " + (year - 1) + "-" + year;
        } else {
            return "Kỳ hè - Năm học " + (year - 1) + "-" + year;
        }
    }
}

