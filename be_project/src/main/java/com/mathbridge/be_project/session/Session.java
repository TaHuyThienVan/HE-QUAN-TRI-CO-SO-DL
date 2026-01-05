package com.mathbridge.be_project.session;

import com.mathbridge.be_project.common.SessionStatus;
import com.mathbridge.be_project.student.Student;
import com.mathbridge.be_project.tutor.Tutor;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    @NotNull(message = "Tutor is required")
    private Tutor tutor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, referencedColumnName = "id")
    @NotNull(message = "Student is required")
    private Student student;

    @NotBlank(message = "Subject is required")
    @Column(name = "subject", nullable = false, length = 100)
    private String subject;

    @NotNull(message = "Scheduled date is required")
    @Column(name = "scheduled_date", nullable = false)
    private LocalDateTime scheduledDate;

    @Min(value = 30, message = "Duration must be at least 30 minutes")
    @Column(name = "duration", nullable = false)
    private Integer duration = 60;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private SessionStatus status = SessionStatus.SCHEDULED;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "notes", length = 1000)
    private String notes;

    @DecimalMin(value = "0.0", message = "Hourly rate must be non-negative")
    @Column(name = "hourly_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @DecimalMin(value = "0.0", message = "Total amount must be non-negative")
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public Session() {}

    public Session(Tutor tutor, Student student, String subject, LocalDateTime scheduledDate, 
                   Integer duration, BigDecimal hourlyRate, String location) {
        this.tutor = tutor;
        this.student = student;
        this.subject = subject;
        this.scheduledDate = scheduledDate;
        this.duration = duration;
        this.hourlyRate = hourlyRate;
        this.location = location;
        this.totalAmount = hourlyRate.multiply(BigDecimal.valueOf(duration / 60.0));
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Tutor getTutor() {
        return tutor;
    }

    public void setTutor(Tutor tutor) {
        this.tutor = tutor;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
        // Recalculate total amount when duration changes
        if (hourlyRate != null) {
            this.totalAmount = hourlyRate.multiply(BigDecimal.valueOf(duration / 60.0));
        }
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
        // Recalculate total amount when hourly rate changes
        if (duration != null) {
            this.totalAmount = hourlyRate.multiply(BigDecimal.valueOf(duration / 60.0));
        }
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "Session{" +
                "id=" + id +
                ", subject='" + subject + '\'' +
                ", scheduledDate=" + scheduledDate +
                ", duration=" + duration +
                ", status=" + status +
                ", location='" + location + '\'' +
                ", hourlyRate=" + hourlyRate +
                ", totalAmount=" + totalAmount +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
