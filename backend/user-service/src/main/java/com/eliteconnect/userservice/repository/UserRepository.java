package com.eliteconnect.userservice.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eliteconnect.userservice.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    // NEW METHOD FOR PAGINATION
    @Query("SELECT u FROM User u WHERE u.id <> :currentUserId")
    Page<User> findAllUsersExcludingCurrentUser(@Param("currentUserId") Long currentUserId, Pageable pageable);
}