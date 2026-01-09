package com.mathbridge.be_project.courseregistration;

import com.mathbridge.be_project.student.Student;
import com.mathbridge.be_project.student.StudentRepository;
import com.mathbridge.be_project.user.User;
import com.mathbridge.be_project.course.CourseRepository;
import com.mathbridge.be_project.course.Course;
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
    private final CourseRepository courseRepository;

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

        // Check course capacity; if course not configured, create it with default capacity
        Course course = courseRepository.findByName(courseName).orElse(null);
        if (course == null) {
            System.out.println("Course not found, creating default course entry: " + courseName);
            course = new Course();
            course.setName(courseName);
            course.setCapacity(50); // default capacity
            course = courseRepository.save(course);
        }

        long currentRegistered = courseRegistrationRepository.countByCourseNameAndStatus(courseName, "REGISTERED");
        System.out.println("Current registered for " + courseName + ": " + currentRegistered + ", capacity=" + course.getCapacity());
        if (course.getCapacity() != null && currentRegistered >= course.getCapacity()) {
            // Save a FAILED registration record for auditing and to prevent re-attempts
            CourseRegistration failed = new CourseRegistration();
            failed.setStudent(student);
            failed.setCourseName(courseName);
            failed.setSemester(request.getSemester() != null ? request.getSemester().trim() : getCurrentSemester());
            failed.setStatus("FAILED");
            failed.setRegisteredAt(java.time.LocalDateTime.now());
            courseRegistrationRepository.save(failed);
            throw new IllegalArgumentException("Đã đủ chỗ cho môn học này. Vui lòng chọn môn khác.");
        }

        // Kiểm tra xem đã từng đăng ký môn này chưa (không cho đăng ký lại dù trước đó đã hủy)
        Optional<CourseRegistration> existingRegistration = courseRegistrationRepository.findByStudentAndCourseName(student, courseName);
        System.out.println("Checking existing registration...");
        if (existingRegistration.isPresent()) {
            System.out.println("Found existing registration (any status). Denying re-registration.");
            throw new IllegalArgumentException("Bạn đã đăng ký môn học này rồi (không thể đăng ký lại). Nếu muốn thay đổi, hãy xóa đăng ký.");
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

        // Delete the registration record when student cancels
        courseRegistrationRepository.delete(registration);
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

