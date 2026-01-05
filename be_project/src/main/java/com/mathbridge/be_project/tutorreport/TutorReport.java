package com.mathbridge.be_project.tutorreport;

import com.mathbridge.be_project.common.ApprovalStatus;
import com.mathbridge.be_project.session.Session;
import com.mathbridge.be_project.tutor.Tutor;
import com.mathbridge.be_project.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "tutor_reports")
public class TutorReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    @NotNull(message = "Tutor is required")
    private Tutor tutor;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @NotNull(message = "Session is required")
    private Session session;

    @Min(value = 1, message = "Actual duration must be at least 1 minute")
    @Column(name = "actual_duration", nullable = false)
    private Integer actualDuration;

    @Column(name = "report_date", insertable = false, updatable = false)
    private LocalDateTime reportDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @Column(name = "evidence_files", length = 1000)
    private String evidenceFiles;

    @Column(name = "notes", length = 1000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public TutorReport() {}

    public TutorReport(Tutor tutor, Session session, Integer actualDuration, String evidenceFiles, String notes) {
        this.tutor = tutor;
        this.session = session;
        this.actualDuration = actualDuration;
        this.evidenceFiles = evidenceFiles;
        this.notes = notes;
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

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public Integer getActualDuration() {
        return actualDuration;
    }

    public void setActualDuration(Integer actualDuration) {
        this.actualDuration = actualDuration;
    }

    public LocalDateTime getReportDate() {
        return reportDate;
    }

    public void setReportDate(LocalDateTime reportDate) {
        this.reportDate = reportDate;
    }

    public ApprovalStatus getStatus() {
        return status;
    }

    public void setStatus(ApprovalStatus status) {
        this.status = status;
    }

    public String getEvidenceFiles() {
        return evidenceFiles;
    }

    public void setEvidenceFiles(String evidenceFiles) {
        this.evidenceFiles = evidenceFiles;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public User getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(User approvedBy) {
        this.approvedBy = approvedBy;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "TutorReport{" +
                "id=" + id +
                ", actualDuration=" + actualDuration +
                ", reportDate=" + reportDate +
                ", status=" + status +
                ", evidenceFiles='" + evidenceFiles + '\'' +
                ", notes='" + notes + '\'' +
                ", approvedAt=" + approvedAt +
                ", createdAt=" + createdAt +
                '}';
    }
}
