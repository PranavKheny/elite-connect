package com.eliteconnect.userservice.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for WebSocket chat messages.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private Long senderId;
    private Long receiverId;
    private String content;
    private LocalDateTime timestamp = LocalDateTime.now();
}
