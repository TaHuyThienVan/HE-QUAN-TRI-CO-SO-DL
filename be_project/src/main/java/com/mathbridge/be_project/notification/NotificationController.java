package com.mathbridge.be_project.notification;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*") // Cho phép frontend Next.js gọi API
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return service.getNotificationsByUser(userId);
    }

    @PostMapping
    public Notification createNotification(@RequestBody Notification request) {
        return service.createNotification(request.getUserId(), request.getMessage(), request.getType());
    }

    @PutMapping("/{id}/read")
    public void markNotificationAsRead(@PathVariable Long id) {
        service.markAsRead(id);
    }
}
