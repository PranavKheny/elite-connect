package com.eliteconnect.userservice.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

public class UserRequest {
    @NotBlank(message = "Username cannot be empty")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password cannot be empty")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password; // Correct: Renamed from passwordHash to password

    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    private String gender;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private String city;
    private String country; // Keep this field as is

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;

    private String profilePictureUrl;

    // Getters (Ensure only ONE of each, especially getCountry())
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPassword() { return password; } // Correct: Getter for 'password'
    public String getFullName() { return fullName; }
    public String getGender() { return gender; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public String getCity() { return city; }
    public String getCountry() { return country; } // Correct: ONLY ONE getCountry() method
    public String getBio() { return bio; }
    public String getProfilePictureUrl() { return profilePictureUrl; }

    // Setters (Ensure only ONE of each, especially setCountry())
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; } // Correct: Setter for 'password'
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setGender(String gender) { this.gender = gender; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public void setCity(String city) { this.city = city; }
    public void setCountry(String country) { this.country = country; } // Correct: ONLY ONE setCountry() method
    public void setBio(String bio) { this.bio = bio; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
}