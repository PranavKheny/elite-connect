package com.eliteconnect.userservice;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column
    private String fullName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column
    private String gender;

    @Column
    private LocalDate dateOfBirth;

    @Column
    private String city;

    @Column
    private String country;

    @Column
    private String profilePictureUrl;

    // *** CHANGES START HERE ***
    @Column(nullable = false)
    private boolean isVerified = false; // New field for verification status, defaults to false

    // An important design consideration: a new field for the verification process.
    // Let's add a field for admin notes regarding verification. This is good practice.
    @Column(columnDefinition = "TEXT")
    private String verificationNotes;
    // *** CHANGES END HERE ***

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}