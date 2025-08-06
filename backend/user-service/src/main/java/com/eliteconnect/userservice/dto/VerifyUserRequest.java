// src/main/java/com/eliteconnect/userservice/dto/VerifyUserRequest.java
package com.eliteconnect.userservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyUserRequest {
    
    @NotNull(message = "Verification status cannot be null")
    private boolean isVerified;
    private String verificationNotes;
}