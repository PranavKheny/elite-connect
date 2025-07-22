package com.marriagenetwork.userservice.dto;

import jakarta.validation.constraints.Email; // For email validation
import jakarta.validation.constraints.NotBlank; // For non-blank strings
import jakarta.validation.constraints.NotNull; // For non-null objects
import jakarta.validation.constraints.Past; // For dates in the past
import jakarta.validation.constraints.Size; // For string length

import java.time.LocalDate;

public class UserRequest {
    @NotBlank(message = "Username cannot be empty")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password cannot be empty")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String passwordHash; // In a real app, this would be 'password' and hashed by the service

    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    private String gender; // Could add @Pattern for specific values (e.g., Male, Female, Other)

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private String city;
    private String country;

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;

    private String profilePictureUrl;

    // Getters (Generate these using your IDE)
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getFullName() { return fullName; }
    public String getGender() { return gender; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public String getCity() { return city; }
    public String getCountry() { return country; }
    public String getBio() { return bio; }
    public String getProfilePictureUrl() { return profilePictureUrl; }


    // Setters (Generate these using your IDE)
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setGender(String gender) { this.gender = gender; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public void setCity(String city) { this.city = city; }
    public void setCountry(String country) { this.country = country; }
    public void setBio(String bio) { this.bio = bio; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
}