package com.eliteconnect.userservice.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eliteconnect.userservice.User;
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

    @PostMapping("/{receiverId}")
    public ResponseEntity<Message> sendMessage(@PathVariable Long receiverId, @RequestBody String content) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        User currentUser = userService.findUserByUsername(currentUsername)
                .orElseThrow(() -> new UserNotFoundException("Sender not found"));
        
        Message sentMessage = messageService.sendMessage(currentUser.getId(), receiverId, content);
        return new ResponseEntity<>(sentMessage, HttpStatus.CREATED);
    }

    @GetMapping("/{otherUserId}")
    public ResponseEntity<Page<Message>> getConversation(@PathVariable Long otherUserId, Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        User currentUser = userService.findUserByUsername(currentUsername)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Page<Message> conversation = messageService.getConversation(currentUser.getId(), otherUserId, pageable);
        return ResponseEntity.ok(conversation);
    }
}