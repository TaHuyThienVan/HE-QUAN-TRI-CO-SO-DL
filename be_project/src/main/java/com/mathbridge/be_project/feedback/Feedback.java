package com.mathbridge.be_project.feedback;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 255)
    private String name;

    @Column(name = "course", nullable = false, length = 255)
    private String course;

    @Column(name = "teacher", nullable = false, length = 255)
    private String teacher;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "mode", length = 50)
    private String mode; // Trực tiếp / Online / Hybrid

    @Column(name = "rating", nullable = false)
    private Integer rating; // 1-5

    @Column(name = "useful", length = 10)
    private String useful; // yes / no

    @Column(name = "comments", nullable = false, length = 2000)
    private String comments;

    @Column(name = "suggestions", length = 2000)
    private String suggestions;

    @Column(name = "anonymous", nullable = false)
    private Boolean anonymous = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Feedback() {}

    public Feedback(String name, String course, String teacher, LocalDate date, String mode,
                   Integer rating, String useful, String comments, String suggestions, Boolean anonymous) {
        this.name = name;
        this.course = course;
        this.teacher = teacher;
        this.date = date;
        this.mode = mode;
        this.rating = rating;
        this.useful = useful;
        this.comments = comments;
        this.suggestions = suggestions;
        this.anonymous = anonymous;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getTeacher() {
        return teacher;
    }

    public void setTeacher(String teacher) {
        this.teacher = teacher;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getUseful() {
        return useful;
    }

    public void setUseful(String useful) {
        this.useful = useful;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public String getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(String suggestions) {
        this.suggestions = suggestions;
    }

    public Boolean getAnonymous() {
        return anonymous;
    }

    public void setAnonymous(Boolean anonymous) {
        this.anonymous = anonymous;
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
}

