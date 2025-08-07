package com.eliteconnect.userservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eliteconnect.userservice.match.Like;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByLikerIdAndLikedUserId(Long likerId, Long likedUserId);
    List<Like> findByLikerId(Long likerId);

    // NEW METHOD to find likes a user has received
    List<Like> findByLikedUserId(Long likedUserId);
}