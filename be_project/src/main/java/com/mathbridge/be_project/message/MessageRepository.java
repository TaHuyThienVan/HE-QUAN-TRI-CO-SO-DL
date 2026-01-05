package com.mathbridge.be_project.message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT DISTINCT m FROM Message m LEFT JOIN FETCH m.sender LEFT JOIN FETCH m.receiver WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2) OR (m.sender.id = :userId2 AND m.receiver.id = :userId1) ORDER BY m.createdAt ASC")
    List<Message> findConversationBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    @Query("SELECT DISTINCT m FROM Message m LEFT JOIN FETCH m.sender LEFT JOIN FETCH m.receiver WHERE m.receiver.id = :userId AND m.isRead = false ORDER BY m.createdAt DESC")
    List<Message> findUnreadMessagesByReceiver(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT m FROM Message m LEFT JOIN FETCH m.sender LEFT JOIN FETCH m.receiver WHERE m.sender.id = :userId OR m.receiver.id = :userId ORDER BY m.createdAt DESC")
    List<Message> findAllMessagesByUser(@Param("userId") Long userId);
}

