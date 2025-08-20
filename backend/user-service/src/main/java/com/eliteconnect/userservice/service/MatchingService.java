package com.eliteconnect.userservice.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eliteconnect.userservice.User;
import com.eliteconnect.userservice.exception.UserNotFoundException;
import com.eliteconnect.userservice.match.ConnectionRequest;
import com.eliteconnect.userservice.match.Like;
import com.eliteconnect.userservice.match.Match;
import com.eliteconnect.userservice.repository.ConnectionRequestRepository;
import com.eliteconnect.userservice.repository.LikeRepository;
import com.eliteconnect.userservice.repository.MatchRepository;
import com.eliteconnect.userservice.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final ConnectionRequestRepository connectionRequestRepository;
    private final MatchRepository matchRepository;

    /**
     * A likes B.
     * If B had already liked A, we create a match.
     */
    @Transactional
    public Optional<Like> createLike(Long likerId, Long likedUserId) {
        User liker = userRepository.findById(likerId)
                .orElseThrow(() -> new UserNotFoundException("Liker not found with ID: " + likerId));
        User likedUser = userRepository.findById(likedUserId)
                .orElseThrow(() -> new UserNotFoundException("Liked user not found with ID: " + likedUserId));

        Optional<Like> existingLike = likeRepository.findByLikerIdAndLikedUserId(likerId, likedUserId);
        if (existingLike.isPresent()) {
            return Optional.empty();
        }

        Like newLike = new Like();
        newLike.setLiker(liker);
        newLike.setLikedUser(likedUser);
        Optional<Like> saved = Optional.of(likeRepository.save(newLike));

        // If the other person already liked back, create a match.
        Optional<Like> reciprocal = likeRepository.findByLikerIdAndLikedUserId(likedUserId, likerId);
        if (reciprocal.isPresent()) {
            createMatchIfAbsent(likerId, likedUserId);
        }

        return saved;
    }

    /**
     * A sends connection request to B.
     */
    @Transactional
    public Optional<ConnectionRequest> createConnectionRequest(Long senderId, Long receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException("Sender not found with ID: " + senderId));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new UserNotFoundException("Receiver not found with ID: " + receiverId));

        Optional<ConnectionRequest> existingRequest =
                connectionRequestRepository.findBySenderIdAndReceiverId(senderId, receiverId);

        if (existingRequest.isPresent()) {
            return Optional.empty();
        }

        ConnectionRequest newRequest = new ConnectionRequest();
        newRequest.setSender(sender);
        newRequest.setReceiver(receiver);

        return Optional.of(connectionRequestRepository.save(newRequest));
    }

    /**
     * B accepts a connection request from A.
     * When accepted, create a match between A and B (if not already matched).
     */
    @Transactional
    public Optional<ConnectionRequest> acceptConnectionRequest(Long requestId, Long userId) {
        ConnectionRequest request = connectionRequestRepository.findById(requestId)
                .orElseThrow(() -> new UserNotFoundException("Connection request not found"));

        if (!request.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("User is not authorized to accept this request.");
        }

        request.setStatus("ACCEPTED");
        Optional<ConnectionRequest> saved = Optional.of(connectionRequestRepository.save(request));

        // Create a match between sender and receiver.
        Long a = request.getSender().getId();
        Long b = request.getReceiver().getId();
        createMatchIfAbsent(a, b);

        return saved;
    }

    /**
     * B declines a connection request from A.
     */
    @Transactional
    public void declineConnectionRequest(Long requestId, Long userId) {
        ConnectionRequest request = connectionRequestRepository.findById(requestId)
                .orElseThrow(() -> new UserNotFoundException("Connection request not found"));

        if (!request.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("User is not authorized to decline this request.");
        }

        connectionRequestRepository.delete(request);
    }

    /**
     * Helper: create a single match row for a pair, ignoring order.
     * Returns the Match if created; returns null if already matched.
     */
    private Match createMatchIfAbsent(Long userId1, Long userId2) {
        Long a = Math.min(userId1, userId2);
        Long b = Math.max(userId1, userId2);

        if (matchRepository.existsByUser1IdAndUser2Id(a, b) ||
            matchRepository.existsByUser1IdAndUser2Id(b, a)) {
            return null; // already matched
        }

        User u1 = userRepository.findById(a)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + a));
        User u2 = userRepository.findById(b)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + b));

        Match m = new Match(u1, u2);
        return matchRepository.save(m);
    }

    @Transactional(readOnly = true)
public List<User> getMatchedUsers(Long userId) {
    var all = matchRepository.findByUser1IdOrUser2Id(userId, userId);
    return all.stream()
        .map(m -> m.getUser1().getId().equals(userId) ? m.getUser2() : m.getUser1())
        .collect(Collectors.toList());
}
}
