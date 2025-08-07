
package com.eliteconnect.userservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eliteconnect.userservice.match.ConnectionRequest;

@Repository
public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, Long> {
    Optional<ConnectionRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);
    List<ConnectionRequest> findByReceiverId(Long receiverId);
    List<ConnectionRequest> findBySenderId(Long senderId); // NEW METHOD
}