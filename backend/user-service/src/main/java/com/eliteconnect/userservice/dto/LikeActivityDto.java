package com.eliteconnect.userservice.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class LikeActivityDto {
    private Long id;
    private Long likerId;
    private String likerUsername;
    private LocalDateTime createdAt;
}
