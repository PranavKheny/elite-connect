package com.eliteconnect.userservice.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eliteconnect.userservice.User;
import com.eliteconnect.userservice.dto.AuthRequest;
import com.eliteconnect.userservice.dto.AuthResponse;
import com.eliteconnect.userservice.dto.UserRequest;
import com.eliteconnect.userservice.dto.UserResponse;
import com.eliteconnect.userservice.dto.VerifyUserRequest;
import com.eliteconnect.userservice.exception.DuplicateActionException;
import com.eliteconnect.userservice.exception.UserNotFoundException;
import com.eliteconnect.userservice.match.ConnectionRequest;
import com.eliteconnect.userservice.match.Like;
import com.eliteconnect.userservice.repository.ConnectionRequestRepository;
import com.eliteconnect.userservice.repository.LikeRepository;
import com.eliteconnect.userservice.repository.UserRepository;
import com.eliteconnect.userservice.service.MatchingService;
import com.eliteconnect.userservice.service.UserService;
import com.eliteconnect.userservice.util.JwtUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final MatchingService matchingService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final ConnectionRequestRepository connectionRequestRepository;


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

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) throws Exception {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );
        
        final User user = userService.findUserByUsername(authRequest.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(jwt));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.findUserByUsername(username).orElseThrow(() -> new UserNotFoundException("User not found"));
        return ResponseEntity.ok(new UserResponse(user));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<UserResponse> updateUserVerificationStatus(
            @PathVariable Long id, 
            @Valid @RequestBody VerifyUserRequest request) {
        User updatedUser = userService.updateUserVerificationStatus(id, request.isVerified(), request.getVerificationNotes());
        return ResponseEntity.ok(new UserResponse(updatedUser));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getPaginatedUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        Pageable pageable) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        User currentUser = userService.findUserByUsername(currentUsername).orElseThrow(() -> new UserNotFoundException("Current user not found"));
        
        Page<User> userPage = userRepository.findVerifiedUsersExcludingCurrentUser(currentUser.getId(), pageable);


        List<UserResponse> userResponses = userPage.getContent().stream()
            .map(UserResponse::new)
            .collect(Collectors.toList());

        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Total-Count", String.valueOf(userPage.getTotalElements()));
        headers.add("X-Total-Pages", String.valueOf(userPage.getTotalPages()));

        return ResponseEntity.ok().headers(headers).body(userResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        return ResponseEntity.ok(new UserResponse(user));
    }

    @GetMapping("/likes/received")
    public ResponseEntity<List<Like>> getReceivedLikesForCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findUserByUsername(username).orElseThrow(() -> new UserNotFoundException("User not found"));
        List<Like> receivedLikes = likeRepository.findByLikedUserId(currentUser.getId());
        return ResponseEntity.ok(receivedLikes);
    }

    @GetMapping("/connections/received")
    public ResponseEntity<List<ConnectionRequest>> getReceivedConnectionRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findUserByUsername(username).orElseThrow(() -> new UserNotFoundException("User not found"));
        List<ConnectionRequest> receivedRequests = connectionRequestRepository.findByReceiverIdAndStatus(currentUser.getId(), "PENDING");
        return ResponseEntity.ok(receivedRequests);
    }

    @GetMapping("/likes/sent")
    public ResponseEntity<List<Like>> getSentLikesForCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findUserByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        List<Like> sentLikes = likeRepository.findByLikerId(currentUser.getId());
        return ResponseEntity.ok(sentLikes);
    }

    @GetMapping("/connections/sent")
    public ResponseEntity<List<ConnectionRequest>> getSentConnectionRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findUserByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        List<ConnectionRequest> sentRequests = connectionRequestRepository.findBySenderId(currentUser.getId());
        return ResponseEntity.ok(sentRequests);
    }

    @GetMapping("/likes/sentIds")
public ResponseEntity<List<Long>> getSentLikeTargetIds() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    User currentUser = userService.findUserByUsername(username)
        .orElseThrow(() -> new UserNotFoundException("User not found"));
    List<Long> ids = likeRepository.findLikedUserIdsByLikerId(currentUser.getId());
    return ResponseEntity.ok(ids);
}

@GetMapping("/connections/sentIds")
public ResponseEntity<List<Long>> getSentConnectionTargetIds() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    User currentUser = userService.findUserByUsername(username)
        .orElseThrow(() -> new UserNotFoundException("User not found"));
    List<Long> ids = connectionRequestRepository.findPendingReceiverIdsBySenderId(currentUser.getId());
    return ResponseEntity.ok(ids);
}

    
    @PutMapping("/connections/{requestId}/accept")
    public ResponseEntity<ConnectionRequest> acceptConnectionRequest(@PathVariable Long requestId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findUserByUsername(username).orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Optional<ConnectionRequest> acceptedRequest = matchingService.acceptConnectionRequest(requestId, currentUser.getId());
        
        return acceptedRequest.map(req -> ResponseEntity.ok(req)).orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/connections/{requestId}/decline")
    public ResponseEntity<Void> declineConnectionRequest(@PathVariable Long requestId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findUserByUsername(username).orElseThrow(() -> new UserNotFoundException("User not found"));

        matchingService.declineConnectionRequest(requestId, currentUser.getId());
        
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/{receiverId}/like")
    public ResponseEntity<?> likeUser(@PathVariable Long receiverId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User liker = userService.findUserByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        User receiver = userService.getUserById(receiverId)
                .orElseThrow(() -> new UserNotFoundException("Target user not found"));

        // Guard: both must be verified
        if (!Boolean.TRUE.equals(liker.isVerified()) || !Boolean.TRUE.equals(receiver.isVerified())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Likes are allowed only between verified members."));
        }

        Optional<Like> like = matchingService.createLike(liker.getId(), receiverId);
        if (like.isEmpty()) {
            throw new DuplicateActionException("User already liked this profile.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/{receiverId}/connect")
    public ResponseEntity<?> sendConnectionRequest(@PathVariable Long receiverId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User sender = userService.findUserByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        User receiver = userService.getUserById(receiverId)
                .orElseThrow(() -> new UserNotFoundException("Target user not found"));

        // Guard: both must be verified
        if (!Boolean.TRUE.equals(sender.isVerified()) || !Boolean.TRUE.equals(receiver.isVerified())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Connection requests are allowed only between verified members."));
        }

        Optional<ConnectionRequest> request = matchingService.createConnectionRequest(sender.getId(), receiverId);
        if (request.isEmpty()) {
            throw new DuplicateActionException("Connection request already sent.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.getUserById(id)
            .orElseThrow(() -> new UserNotFoundException("User to delete not found with ID: " + id));
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}