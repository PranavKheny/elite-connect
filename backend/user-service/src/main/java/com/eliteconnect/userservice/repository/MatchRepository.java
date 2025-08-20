package com.eliteconnect.userservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eliteconnect.userservice.match.Match;

public interface MatchRepository extends JpaRepository<Match, Long> {

    // Find all matches where the given user is on either side
    List<Match> findByUser1IdOrUser2Id(Long userId1, Long userId2);

    // Check if a specific ordered pair exists (user1,user2)
    boolean existsByUser1IdAndUser2Id(Long user1Id, Long user2Id);

    // Optionally fetch a specific ordered pair
    Optional<Match> findByUser1IdAndUser2Id(Long user1Id, Long user2Id);
}
