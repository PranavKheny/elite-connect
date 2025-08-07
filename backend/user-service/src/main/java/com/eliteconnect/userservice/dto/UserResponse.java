package com.eliteconnect.userservice.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.eliteconnect.userservice.User;

import lombok.Data;

@Data
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
    private boolean verified; // CORRECTED field name
    private String verificationNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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
        this.verified = user.isVerified(); // Map from isVerified() getter
        this.verificationNotes = user.getVerificationNotes();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
    }
}