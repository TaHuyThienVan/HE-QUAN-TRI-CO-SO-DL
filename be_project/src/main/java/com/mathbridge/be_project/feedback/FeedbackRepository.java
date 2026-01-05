package com.mathbridge.be_project.feedback;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByCourseOrderByCreatedAtDesc(String course);
    List<Feedback> findByTeacherOrderByCreatedAtDesc(String teacher);
    List<Feedback> findAllByOrderByCreatedAtDesc();
}

