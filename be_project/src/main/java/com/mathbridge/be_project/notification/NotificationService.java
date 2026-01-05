package com.mathbridge.be_project.notification;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification createNotification(Long userId, String message, String type) {
        Notification notification = new Notification(userId, message, type);
        return repository.save(notification);
    }

    public void markAsRead(Long id) {
        Notification notification = repository.findById(id).orElseThrow();
        notification.setRead(true);
        repository.save(notification);
    }
}
