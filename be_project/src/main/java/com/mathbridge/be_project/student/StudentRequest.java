package com.mathbridge.be_project.student;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentRequest {
    private String fullName;
    private LocalDate dob;
    private String gender;
    private String district;
    private String email;
    private String phone;
    @JsonAlias("gradeLevel")
    private String grade;
    private String avatar;
    private String note;
}

