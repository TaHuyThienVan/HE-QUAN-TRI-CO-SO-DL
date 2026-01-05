package com.mathbridge.be_project.feedback;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequest {
    private String name;
    private String course;
    private String teacher;
    private LocalDate date;
    private String mode; // Trực tiếp / Online / Hybrid
    private Integer rating; // 1-5
    private String useful; // yes / no
    private String comments;
    private String suggestions;
    private Boolean anonymous = false;
}

