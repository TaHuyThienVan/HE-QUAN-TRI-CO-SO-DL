package com.mathbridge.be_project.courseregistration;

import com.mathbridge.be_project.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRegistrationRepository extends JpaRepository<CourseRegistration, Long> {
    
    // Find all registrations by student
    List<CourseRegistration> findByStudent(Student student);
    
    // Find all registrations by student ID (using nested property path)
    List<CourseRegistration> findByStudent_Id(Long studentId);
    
    // Find registration by student and course name
    Optional<CourseRegistration> findByStudentAndCourseName(Student student, String courseName);
    
    // Find all registrations by status
    List<CourseRegistration> findByStatus(String status);
    
    // Find all registrations by semester
    List<CourseRegistration> findBySemester(String semester);
    
    // Check if student has already registered for a course
    boolean existsByStudentAndCourseName(Student student, String courseName);
    
    // Check if student has already registered for a course with specific status
    boolean existsByStudentAndCourseNameAndStatus(Student student, String courseName, String status);
}

