package com.eliteconnect.userservice.dto;

import java.time.LocalDate; // Import your User entity
import java.time.LocalDateTime;

import com.eliteconnect.userservice.User;

public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String gender;
    private LocalDate dateOfBirth;
    private String city;
    private String country;
    private String bio;
    private String profilePictureUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public UserResponse() {}

    // Constructor to convert from User entity to UserResponse DTO
    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.gender = user.getGender();
        this.dateOfBirth = user.getDateOfBirth();
        this.city = user.getCity();
        this.country = user.getCountry();
        this.bio = user.getBio();
        this.profilePictureUrl = user.getProfilePictureUrl();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
        // passwordHash is deliberately omitted
    }

    // Getters (You can generate these using your IDE: right-click -> Source Action -> Generate Getters)
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getGender() {
        return gender;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public String getBio() {
        return bio;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // Setters (Only if needed for deserialization, but often not for response DTOs unless for testing)
    // public void setId(Long id) { this.id = id; }
    // ... and so on for other fields if required for specific mapping
}