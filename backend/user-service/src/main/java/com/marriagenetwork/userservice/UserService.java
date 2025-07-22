package com.marriagenetwork.userservice;

import java.util.List; // For constructor injection
import java.util.Optional; // Marks this as a Spring Service component

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service // This annotation marks this class as a Spring Service component
@RequiredArgsConstructor // Lombok: Generates a constructor with required arguments (final fields), facilitating dependency injection
public class UserService {

    private final UserRepository userRepository; // Inject the UserRepository

    // Method to register a new user
    public User registerUser(User user) {
        // In a real application, you would add more business logic here:
        // 1. Check if username or email already exists (we have findBy methods for this)
        // 2. Hash the password before saving (e.g., using Spring Security's BCryptPasswordEncoder)
        // 3. Perform input validation (e.g., email format, password strength)

        // For now, we'll just save the user as is.
        return userRepository.save(user);
    }

    // Method to find a user by ID
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }

    // Method to find a user by username
    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Method to find all users
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    // Method to update an existing user
    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            // Update specific fields. Only update fields that are allowed to be changed.
            user.setUsername(updatedUser.getUsername());
            user.setEmail(updatedUser.getEmail());
            user.setBio(updatedUser.getBio());
            user.setGender(updatedUser.getGender());
            user.setDateOfBirth(updatedUser.getDateOfBirth());
            user.setCity(updatedUser.getCity());
            user.setCountry(updatedUser.getCountry());
            user.setProfilePictureUrl(updatedUser.getProfilePictureUrl());
            // passwordHash should be updated via a separate method (e.g., changePassword) for security

            return userRepository.save(user); // Save the updated user
        }).orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        // In a real app, you'd throw a custom NotFoundException
    }

    // Method to delete a user by ID
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // Example of a login method - password handling would be done securely
    public Optional<User> loginUser(String username, String rawPassword) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // In a real app, you'd compare rawPassword with user.getPasswordHash() using a password encoder (e.g., BCrypt)
            // For now, let's assume rawPassword matches the stored passwordHash for demonstration (NOT SECURE!)
            if (user.getPasswordHash().equals(rawPassword)) { // This is a placeholder for actual password verification
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }
}