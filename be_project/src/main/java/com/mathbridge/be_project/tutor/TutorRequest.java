package com.mathbridge.be_project.tutor;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TutorRequest {
    private String employeeId; // Will be auto-generated if not provided
    private String avatar;
    private String fullName;
    private LocalDate dob;
    private String gender;
    private String department;
    private String title;
    private String degree;
    @JsonAlias("teachGrades")
    private String subjects; // Map teachGrades to subjects
    private String teachGrades; // Also accept teachGrades directly
    private String email;
    private String phone;
    private String office;
    private String qualification;
    private Integer experience;
}

