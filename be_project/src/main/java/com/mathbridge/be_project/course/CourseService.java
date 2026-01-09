package com.mathbridge.be_project.course;

import com.mathbridge.be_project.courseregistration.CourseRegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {
    private final CourseRepository courseRepository;
    private final CourseRegistrationRepository registrationRepository;

    public CourseService(CourseRepository courseRepository, CourseRegistrationRepository registrationRepository) {
        this.courseRepository = courseRepository;
        this.registrationRepository = registrationRepository;
    }

    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream().map(c -> {
            long registered = registrationRepository.countByCourseNameAndStatus(c.getName(), "REGISTERED");
            return CourseDTO.fromEntity(c, registered);
        }).collect(Collectors.toList());
    }

    public Course getByName(String name) {
        return courseRepository.findByName(name).orElse(null);
    }
}
