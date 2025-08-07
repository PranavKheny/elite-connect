package com.eliteconnect.userservice.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.eliteconnect.userservice.User;
import com.eliteconnect.userservice.exception.UserNotFoundException;
import com.eliteconnect.userservice.message.Message;
import com.eliteconnect.userservice.repository.MessageRepository;
import com.eliteconnect.userservice.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public Message sendMessage(Long senderId, Long receiverId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException("Sender not found with ID: " + senderId));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new UserNotFoundException("Receiver not found with ID: " + receiverId));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);

        return messageRepository.save(message);
    }

    public Page<Message> getConversation(Long user1Id, Long user2Id, Pageable pageable) {
        return messageRepository.findConversation(user1Id, user2Id, pageable);
    }
}