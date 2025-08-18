package com.eliteconnect.userservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eliteconnect.userservice.match.ConnectionRequest;

@Repository
public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, Long> {
    Optional<ConnectionRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);
    List<ConnectionRequest> findByReceiverId(Long receiverId);
    List<ConnectionRequest> findBySenderId(Long senderId);

    // NEW METHOD to find incoming pending connection requests
    List<ConnectionRequest> findByReceiverIdAndStatus(Long receiverId, String status);

    
@Query("select c.receiver.id from ConnectionRequest c where c.sender.id = :senderId and c.status = 'PENDING'")
List<Long> findPendingReceiverIdsBySenderId(@Param("senderId") Long senderId);
}