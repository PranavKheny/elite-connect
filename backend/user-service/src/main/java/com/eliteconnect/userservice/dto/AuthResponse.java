package com.eliteconnect.userservice.dto;

import lombok.AllArgsConstructor; // Lombok: Generates a constructor with all arguments
import lombok.Getter; // Lombok: Generates getters

@Getter // Generates getters for token field
@AllArgsConstructor // Generates a constructor with all fields as arguments
public class AuthResponse {
    private String jwtToken;
    // You might add other user details here like username, roles etc.
}