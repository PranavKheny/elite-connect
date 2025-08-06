package com.eliteconnect.userservice.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eliteconnect.userservice.User;
import com.eliteconnect.userservice.dto.AuthRequest;
import com.eliteconnect.userservice.dto.AuthResponse;
import com.eliteconnect.userservice.dto.UserRequest;
import com.eliteconnect.userservice.dto.UserResponse;
// NEW IMPORT: This is for our new DTO
import com.eliteconnect.userservice.dto.VerifyUserRequest;
import com.eliteconnect.userservice.exception.UserNotFoundException;
import com.eliteconnect.userservice.service.UserService;
import com.eliteconnect.userservice.util.JwtUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService,
                          AuthenticationManager authenticationManager,
                          UserDetailsService userDetailsService,
                          JwtUtil jwtUtil) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    // POST /api/users/register
    @PostMapping("/register")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest userRequest) {
        User user = new User();
        user.setUsername(userRequest.getUsername());
        user.setEmail(userRequest.getEmail());
        user.setPasswordHash(userRequest.getPassword());
        user.setFullName(userRequest.getFullName());
        user.setGender(userRequest.getGender());
        user.setDateOfBirth(userRequest.getDateOfBirth());
        user.setCity(userRequest.getCity());
        user.setCountry(userRequest.getCountry());
        user.setBio(userRequest.getBio());
        user.setProfilePictureUrl(userRequest.getProfilePictureUrl());

        User createdUser = userService.createUser(user);
        return new ResponseEntity<>(new UserResponse(createdUser), HttpStatus.CREATED);
    }

    // POST /api/users/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) throws Exception {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );

        Optional<User> userOptional = userService.findUserByUsername(authRequest.getUsername());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (!user.isVerified()) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(new AuthResponse("Account is not yet verified."));
            }

            final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());
            final String jwt = jwtUtil.generateToken(userDetails);
            return ResponseEntity.ok(new AuthResponse(jwt));
            
        } else {
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    // NEW ADMIN ENDPOINT START
    // PUT /api/users/{id}/verify
    @PutMapping("/{id}/verify")
    public ResponseEntity<UserResponse> updateUserVerificationStatus(
            @PathVariable Long id, 
            @Valid @RequestBody VerifyUserRequest request) {
        
        // This method will be implemented in the UserService in the next step.
        User updatedUser = userService.updateUserVerificationStatus(id, request.isVerified(), request.getVerificationNotes());
        return ResponseEntity.ok(new UserResponse(updatedUser));
    }
    // NEW ADMIN ENDPOINT END


    // GET /api/users
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponse> userResponses = users.stream()
            .map(UserResponse::new)
            .collect(Collectors.toList());
        return new ResponseEntity<>(userResponses, HttpStatus.OK);
    }

    // GET /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        return ResponseEntity.ok(new UserResponse(user));
    }

    // PUT /api/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserRequest userRequest) {
        userService.getUserById(id)
            .orElseThrow(() -> new UserNotFoundException("User to update not found with ID: " + id));

        User userDetails = new User();
        userDetails.setUsername(userRequest.getUsername());
        userDetails.setEmail(userRequest.getEmail());
        userDetails.setPasswordHash(userRequest.getPassword());
        userDetails.setFullName(userRequest.getFullName());
        userDetails.setGender(userRequest.getGender());
        userDetails.setDateOfBirth(userRequest.getDateOfBirth());
        userDetails.setCity(userRequest.getCity());
        userDetails.setCountry(userRequest.getCountry());
        userDetails.setBio(userRequest.getBio());
        userDetails.setProfilePictureUrl(userRequest.getProfilePictureUrl());

        User updatedUser = userService.updateUser(id, userDetails);
        return new ResponseEntity<>(new UserResponse(updatedUser), HttpStatus.OK);
    }

    // DELETE /api/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.getUserById(id)
            .orElseThrow(() -> new UserNotFoundException("User to delete not found with ID: " + id));

        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}