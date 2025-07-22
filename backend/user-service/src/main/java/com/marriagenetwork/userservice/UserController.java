package com.marriagenetwork.userservice;

import java.util.List;
import java.util.Optional; // For HTTP status codes

import org.springframework.http.HttpStatus; // For building HTTP responses
import org.springframework.http.ResponseEntity; // For REST annotations
import org.springframework.web.bind.annotation.DeleteMapping; // Add this line
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController // Marks this class as a REST Controller, handling incoming web requests
@RequestMapping("/api/users") // Base URL path for all endpoints in this controller
@RequiredArgsConstructor // Lombok: Generates a constructor with required arguments (final fields), facilitating dependency injection
public class UserController {

    private final UserService userService; // Inject the UserService

    // POST /api/users
    // Endpoint to register a new user
    @PostMapping // Handles HTTP POST requests to the base URL /api/users
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        // In a real application, you would typically use a DTO (Data Transfer Object)
        // for incoming request bodies to avoid exposing internal entity details
        // and for validation.
        User registeredUser = userService.registerUser(user);
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED); // Returns 201 Created status
    }

    // GET /api/users/{id}
    // Endpoint to get a user by their ID
    @GetMapping("/{id}") // Handles HTTP GET requests to /api/users/{id}
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        // @PathVariable extracts the 'id' from the URL path
        return userService.findUserById(id)
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK)) // If found, return 200 OK
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND)); // If not found, return 404 Not Found
    }

    // GET /api/users
    // Endpoint to get all users
    @GetMapping // Handles HTTP GET requests to the base URL /api/users
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK); // Returns 200 OK with list of users
    }

    // PUT /api/users/{id}
    // Endpoint to update an existing user
    @PutMapping("/{id}") // Handles HTTP PUT requests to /api/users/{id}
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            User updatedUser = userService.updateUser(id, userDetails);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK); // Returns 200 OK with updated user
        } catch (RuntimeException e) { // Catch the RuntimeException from UserService for "User not found"
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Return 404 Not Found
        }
    }

    // DELETE /api/users/{id}
    // Endpoint to delete a user by their ID
    @DeleteMapping("/{id}") // Handles HTTP DELETE requests to /api/users/{id}
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Returns 204 No Content (successful deletion with no body)
    }

    // POST /api/users/login
    // Basic Login Endpoint (for demonstration - a real one would be more secure)
    @PostMapping("/login") // Handles HTTP POST requests to /api/users/login
    public ResponseEntity<User> loginUser(@RequestBody User loginRequest) {
        // In a real application, you'd probably use a dedicated LoginRequest DTO
        // with username and rawPassword fields, not the full User entity.
        Optional<User> userOptional = userService.loginUser(loginRequest.getUsername(), loginRequest.getPasswordHash()); // Using passwordHash as raw password for now

        return userOptional.map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                           .orElseGet(() -> new ResponseEntity<>(HttpStatus.UNAUTHORIZED)); // 401 Unauthorized for failed login
    }
}