package com.eliteconnect.userservice.dto;

import java.time.LocalDateTime;

import com.eliteconnect.userservice.message.Message;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MessageResponse {

    private Long id;
    private Long senderId;
    private Long receiverId;
    private String content;
    private LocalDateTime createdAt;
    
    public MessageResponse(Message message) {
        this.id = message.getId();
        this.senderId = message.getSender().getId();
        this.receiverId = message.getReceiver().getId();
        this.content = message.getContent();
        this.createdAt = message.getCreatedAt();
    }
}