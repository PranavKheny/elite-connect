package com.marriagenetwork.userservice.controller;

import com.marriagenetwork.userservice.User; // Import your User entity
import com.marriagenetwork.userservice.dto.UserRequest; // Import UserRequest DTO
import com.marriagenetwork.userservice.dto.UserResponse; // Import UserResponse DTO
import com.marriagenetwork.userservice.service.UserService;
import jakarta.validation.Valid; // Import for validation annotation
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors; // To help map lists

@RestController // Marks this class as a REST Controller, handling incoming web requests
@RequestMapping("/api/users") // Base URL path for all endpoints in this controller
// Lombok: Generates a constructor with required arguments (final fields), facilitating dependency injection
// @RequiredArgsConstructor // We will explicitly define constructor to clarify dependency
public class UserController {

    private final UserService userService; // Inject the UserService

    // Constructor for dependency injection
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // POST /api/users
    // Endpoint to create a new user with DTO and validation
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest userRequest) {
        // Convert UserRequest DTO to User entity
        User user = new User();
        user.setUsername(userRequest.getUsername());
        user.setEmail(userRequest.getEmail());
        user.setPasswordHash(userRequest.getPasswordHash()); // In a real app, hash this password securely!
        user.setFullName(userRequest.getFullName());
        user.setGender(userRequest.getGender());
        user.setDateOfBirth(userRequest.getDateOfBirth());
        user.setCity(userRequest.getCity());
        user.setCountry(userRequest.getCountry());
        user.setBio(userRequest.getBio());
        user.setProfilePictureUrl(userRequest.getProfilePictureUrl());

        User createdUser = userService.createUser(user); // Call the service to create the user

        // Convert created User entity back to UserResponse DTO
        return new ResponseEntity<>(new UserResponse(createdUser), HttpStatus.CREATED); // Returns 201 Created status
    }

    // GET /api/users
    // Endpoint to get all users, returning DTOs
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllUsers(); // Get all users from service
        // Convert list of User entities to list of UserResponse DTOs
        List<UserResponse> userResponses = users.stream()
            .map(UserResponse::new) // Uses the constructor of UserResponse that takes a User object
            .collect(Collectors.toList());
        return new ResponseEntity<>(userResponses, HttpStatus.OK); // Returns 200 OK with list of user DTOs
    }

    // GET /api/users/{id}
    // Endpoint to get a user by their ID, returning DTO
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        // @PathVariable extracts the 'id' from the URL path
        return userService.getUserById(id) // Get user from service (returns Optional<User>)
            .map(UserResponse::new) // Convert User to UserResponse if found
            .map(userResponse -> new ResponseEntity<>(userResponse, HttpStatus.OK)) // If found, return 200 OK with DTO
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND)); // If not found, return 404 Not Found
    }

    // PUT /api/users/{id}
    // Endpoint to update an existing user with DTO and validation
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserRequest userRequest) {
        // Convert UserRequest DTO to a User entity for updating
        User userDetails = new User(); // Create a new User entity to hold the updated details from DTO
        userDetails.setUsername(userRequest.getUsername());
        userDetails.setEmail(userRequest.getEmail());
        userDetails.setPasswordHash(userRequest.getPasswordHash()); // Still needs to be hashed in a real app
        userDetails.setFullName(userRequest.getFullName());
        userDetails.setGender(userRequest.getGender());
        userDetails.setDateOfBirth(userRequest.getDateOfBirth());
        userDetails.setCity(userRequest.getCity());
        userDetails.setCountry(userRequest.getCountry());
        userDetails.setBio(userRequest.getBio());
        userDetails.setProfilePictureUrl(userRequest.getProfilePictureUrl());

        User updatedUser = userService.updateUser(id, userDetails); // Call service method to update

        // Convert updated User entity back to UserResponse DTO
        return new ResponseEntity<>(new UserResponse(updatedUser), HttpStatus.OK); // Returns 200 OK with updated DTO
    }

    // DELETE /api/users/{id}
    // Endpoint to delete a user by their ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id); // Call service to delete
        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Returns 204 No Content (successful deletion with no body)
    }
}