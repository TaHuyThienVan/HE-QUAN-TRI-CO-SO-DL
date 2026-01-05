package com.mathbridge.be_project.message;

import com.mathbridge.be_project.user.User;
import com.mathbridge.be_project.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;

    /**
     * Lấy user hiện tại từ SecurityContext (JWT token)
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        String email = authentication.getName();
        if (email == null || email.isEmpty()) {
            return null;
        }
        
        return userService.getUserByEmail(email).orElse(null);
    }

    private Long getCurrentUserId(HttpServletRequest request) {
        User user = getCurrentUser();
        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }
        return user.getId();
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody MessageRequest request, HttpServletRequest httpRequest) {
        try {
            Long senderId = getCurrentUserId(httpRequest);
            Message message = messageService.sendMessage(senderId, request.getReceiverId(), request.getContent());
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(message));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Failed to send message: " + e.getMessage()));
        }
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<?> getConversation(@PathVariable Long otherUserId, HttpServletRequest request) {
        try {
            Long currentUserId = getCurrentUserId(request);
            List<Message> messages = messageService.getConversation(currentUserId, otherUserId);
            List<Map<String, Object>> messageDTOs = messages.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(messageDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Failed to get conversation: " + e.getMessage()));
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadMessages(HttpServletRequest request) {
        try {
            Long userId = getCurrentUserId(request);
            List<Message> messages = messageService.getUnreadMessages(userId);
            List<Map<String, Object>> messageDTOs = messages.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(messageDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Failed to get unread messages: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllMessages(HttpServletRequest request) {
        try {
            Long userId = getCurrentUserId(request);
            List<Message> messages = messageService.getAllMessages(userId);
            List<Map<String, Object>> messageDTOs = messages.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(messageDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Failed to get messages: " + e.getMessage()));
        }
    }

    @PostMapping("/mark-read/{otherUserId}")
    public ResponseEntity<?> markConversationAsRead(@PathVariable Long otherUserId, HttpServletRequest request) {
        try {
            Long currentUserId = getCurrentUserId(request);
            messageService.markConversationAsRead(currentUserId, otherUserId);
            return ResponseEntity.ok(createSuccessResponse("Conversation marked as read"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Failed to mark as read: " + e.getMessage()));
        }
    }

    private Map<String, Object> convertToDTO(Message message) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", message.getId());
        // Trigger lazy loading within transaction context
        User sender = message.getSender();
        User receiver = message.getReceiver();
        dto.put("senderId", sender.getId());
        dto.put("senderName", sender.getFullName());
        dto.put("senderEmail", sender.getEmail());
        dto.put("receiverId", receiver.getId());
        dto.put("receiverName", receiver.getFullName());
        dto.put("receiverEmail", receiver.getEmail());
        dto.put("content", message.getContent());
        dto.put("isRead", message.getIsRead());
        dto.put("createdAt", message.getCreatedAt());
        return dto;
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("error", message);
        return response;
    }

    private Map<String, String> createSuccessResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return response;
    }
}

