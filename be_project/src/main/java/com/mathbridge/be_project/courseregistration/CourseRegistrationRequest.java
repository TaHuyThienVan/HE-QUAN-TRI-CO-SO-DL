package com.mathbridge.be_project.courseregistration;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseRegistrationRequest {
    private String courseName;
    private String semester; // Optional, e.g., "Kỳ 1", "Kỳ 2", "Năm học 2024-2025"
}





