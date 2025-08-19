package com.eliteconnect.userservice.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class ConnectionRequestActivityDto {
    private Long id;
    private Long senderId;
    private String senderUsername;
    private String status;
    private LocalDateTime createdAt;
}
