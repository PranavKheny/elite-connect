package com.eliteconnect.userservice.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eliteconnect.userservice.User;
import com.eliteconnect.userservice.dto.ChatMessage;
import com.eliteconnect.userservice.dto.MessageRequest;
import com.eliteconnect.userservice.dto.MessageResponse;
import com.eliteconnect.userservice.exception.UserNotFoundException;
import com.eliteconnect.userservice.message.Message;
import com.eliteconnect.userservice.service.MessageService;
import com.eliteconnect.userservice.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    // ---------------- REST Endpoints ----------------

    @PostMapping("/{receiverId}")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable Long receiverId,
            @RequestBody MessageRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userService.findUserByUsername(currentUsername)
                .orElseThrow(() -> new UserNotFoundException("Sender not found"));

        Message sentMessage = messageService.sendMessage(
                currentUser.getId(),
                receiverId,
                request.getContent()
        );

        MessageResponse response = new MessageResponse(sentMessage);

        // 🔥 Broadcast via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/messages/" + receiverId,
                response
        );

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{otherUserId}")
    public ResponseEntity<Page<MessageResponse>> getConversation(
            @PathVariable Long otherUserId,
            Pageable pageable) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userService.findUserByUsername(currentUsername)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Page<Message> conversation = messageService.getConversation(
                currentUser.getId(),
                otherUserId,
                pageable
        );

        Page<MessageResponse> responsePage = conversation.map(MessageResponse::new);
        return ResponseEntity.ok(responsePage);
    }

    // ---------------- WebSocket Endpoints ----------------

    @MessageMapping("/chat")  // Client sends to: /app/chat
    public void sendMessageWS(@Payload ChatMessage chatMessage) {
        // ✅ persist to DB
        Message saved = messageService.sendMessage(
                chatMessage.getSenderId(),
                chatMessage.getReceiverId(),
                chatMessage.getContent()
        );

        MessageResponse response = new MessageResponse(saved);

        // ✅ broadcast only to receiver
        messagingTemplate.convertAndSend(
                "/topic/messages/" + chatMessage.getReceiverId(),
                response
        );
    }
}
