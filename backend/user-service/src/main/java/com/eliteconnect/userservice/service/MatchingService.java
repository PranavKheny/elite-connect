package com.eliteconnect.userservice.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.eliteconnect.userservice.User;
import com.eliteconnect.userservice.exception.UserNotFoundException;
import com.eliteconnect.userservice.match.ConnectionRequest;
import com.eliteconnect.userservice.match.Like;
import com.eliteconnect.userservice.repository.ConnectionRequestRepository;
import com.eliteconnect.userservice.repository.LikeRepository;
import com.eliteconnect.userservice.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final ConnectionRequestRepository connectionRequestRepository;

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

        return Optional.of(likeRepository.save(newLike));
    }

    public Optional<ConnectionRequest> createConnectionRequest(Long senderId, Long receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException("Sender not found with ID: " + senderId));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new UserNotFoundException("Receiver not found with ID: " + receiverId));

        Optional<ConnectionRequest> existingRequest = connectionRequestRepository.findBySenderIdAndReceiverId(senderId, receiverId);

        if (existingRequest.isPresent()) {
            return Optional.empty();
        }

        ConnectionRequest newRequest = new ConnectionRequest();
        newRequest.setSender(sender);
        newRequest.setReceiver(receiver);

        return Optional.of(connectionRequestRepository.save(newRequest));
    }
}