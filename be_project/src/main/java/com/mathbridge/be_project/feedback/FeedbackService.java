package com.mathbridge.be_project.feedback;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public Feedback createFeedback(FeedbackRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Feedback data is required");
        }
        if (request.getCourse() == null || request.getCourse().isBlank()) {
            throw new IllegalArgumentException("Course is required");
        }
        if (request.getTeacher() == null || request.getTeacher().isBlank()) {
            throw new IllegalArgumentException("Teacher is required");
        }
        if (request.getDate() == null) {
            throw new IllegalArgumentException("Date is required");
        }
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        if (request.getComments() == null || request.getComments().isBlank()) {
            throw new IllegalArgumentException("Comments are required");
        }

        Feedback feedback = new Feedback();
        feedback.setName(request.getName());
        feedback.setCourse(request.getCourse());
        feedback.setTeacher(request.getTeacher());
        feedback.setDate(request.getDate());
        feedback.setMode(request.getMode());
        feedback.setRating(request.getRating());
        feedback.setUseful(request.getUseful());
        feedback.setComments(request.getComments());
        feedback.setSuggestions(request.getSuggestions());
        feedback.setAnonymous(request.getAnonymous() != null ? request.getAnonymous() : false);

        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
    }

    public List<Feedback> getFeedbacksByCourse(String course) {
        return feedbackRepository.findByCourseOrderByCreatedAtDesc(course);
    }

    public List<Feedback> getFeedbacksByTeacher(String teacher) {
        return feedbackRepository.findByTeacherOrderByCreatedAtDesc(teacher);
    }

    public void deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new RuntimeException("Feedback not found with id: " + id);
        }
        feedbackRepository.deleteById(id);
    }
}

