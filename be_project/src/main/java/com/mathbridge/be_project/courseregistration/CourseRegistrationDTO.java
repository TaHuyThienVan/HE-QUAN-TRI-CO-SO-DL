package com.mathbridge.be_project.courseregistration;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseRegistrationDTO {
    private Long id;
    private Long studentId;
    private String courseName;
    private String semester;
    private String status;
    private LocalDateTime registeredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CourseRegistrationDTO fromEntity(CourseRegistration registration) {
        if (registration == null) {
            return null;
        }
        CourseRegistrationDTO dto = new CourseRegistrationDTO();
        dto.setId(registration.getId());
        dto.setStudentId(registration.getStudentId());
        dto.setCourseName(registration.getCourseName());
        dto.setSemester(registration.getSemester());
        dto.setStatus(registration.getStatus());
        dto.setRegisteredAt(registration.getRegisteredAt());
        dto.setCreatedAt(registration.getCreatedAt());
        dto.setUpdatedAt(registration.getUpdatedAt());
        return dto;
    }
}





