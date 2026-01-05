package com.mathbridge.be_project.session;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionRequest {
    @NotNull(message = "Date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    
    @NotNull(message = "Time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime time;
    
    @NotBlank(message = "Method is required")
    private String method; // "online" or "offline"
    
    private String note; // Optional
    
    private String subject; // Optional, default to "Toán học"
    
    private Long studentId; // Optional, if not provided, will use first available student
    
    private Long tutorId; // Required for student booking
}

