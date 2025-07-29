package com.eliteconnect.userservice.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // Import BCryptPasswordEncoder
import org.springframework.stereotype.Service;

import com.eliteconnect.userservice.User;
import com.eliteconnect.userservice.repository.UserRepository;

import lombok.RequiredArgsConstructor; // Ensure this import is present if using Lombok

@Service // Marks this class as a Spring Service component
@RequiredArgsConstructor // Lombok: Generates a constructor with required arguments (final fields)
public class UserService {

    private final UserRepository userRepository; // Inject the UserRepository
    private final BCryptPasswordEncoder passwordEncoder; // Inject BCryptPasswordEncoder for password hashing

    // Method to create a new user (renamed from registerUser to match UserController)
    public User createUser(User user) {
        // Hash the password before saving
        // The 'user' object here receives the plain password from the DTO,
        // which then gets set to its passwordHash field.
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash())); // HASH THE PASSWORD
        return userRepository.save(user);
    }

    // Method to get a user by ID (renamed from findUserById to match UserController)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // Method to get all users (renamed from findAllUsers to match UserController)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Method to update an existing user
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id)); // Using RuntimeException for now

        // Update specific fields from userDetails (coming from DTO via controller)
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());

        // Only update passwordHash if a new password is provided and not empty.
        // HASH THE NEW PASSWORD before saving.
        if (userDetails.getPasswordHash() != null && !userDetails.getPasswordHash().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(userDetails.getPasswordHash())); // HASH THE NEW PASSWORD
        }
        user.setFullName(userDetails.getFullName());
        user.setGender(userDetails.getGender());
        user.setDateOfBirth(userDetails.getDateOfBirth());
        user.setCity(userDetails.getCity());
        user.setCountry(userDetails.getCountry());
        user.setBio(userDetails.getBio());
        user.setProfilePictureUrl(userDetails.getProfilePictureUrl());

        return userRepository.save(user); // Save the updated user
    }

    // Method to delete a user by ID
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // Method to find a user by username (used for login, still kept)
    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Example of a login method - password handling would be done securely
    public Optional<User> loginUser(String username, String rawPassword) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Use passwordEncoder.matches() to compare the raw password with the stored hashed password
            if (passwordEncoder.matches(rawPassword, user.getPasswordHash())) { // SECURE PASSWORD COMPARISON
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }
}