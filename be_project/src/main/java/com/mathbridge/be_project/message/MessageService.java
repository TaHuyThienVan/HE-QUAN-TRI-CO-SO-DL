package com.mathbridge.be_project.message;

import com.mathbridge.be_project.user.User;
import com.mathbridge.be_project.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    public Message sendMessage(Long senderId, Long receiverId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found with id: " + senderId));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found with id: " + receiverId));

        Message message = new Message(sender, receiver, content);
        return messageRepository.save(message);
    }

    public List<Message> getConversation(Long userId1, Long userId2) {
        return messageRepository.findConversationBetweenUsers(userId1, userId2);
    }

    public List<Message> getUnreadMessages(Long userId) {
        return messageRepository.findUnreadMessagesByReceiver(userId);
    }

    public List<Message> getAllMessages(Long userId) {
        return messageRepository.findAllMessagesByUser(userId);
    }

    public void markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + messageId));
        message.setIsRead(true);
        messageRepository.save(message);
    }

    public void markConversationAsRead(Long userId1, Long userId2) {
        List<Message> messages = messageRepository.findConversationBetweenUsers(userId1, userId2);
        for (Message message : messages) {
            if (message.getReceiver().getId().equals(userId1) && !message.getIsRead()) {
                message.setIsRead(true);
            }
        }
        messageRepository.saveAll(messages);
    }
}

