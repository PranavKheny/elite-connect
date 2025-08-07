package com.eliteconnect.userservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eliteconnect.userservice.message.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :user1Id AND m.receiver.id = :user2Id) OR (m.sender.id = :user2Id AND m.receiver.id = :user1Id)")
    Page<Message> findConversation(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id, Pageable pageable);
}