package com.marriagenetwork.userservice.repository;

import java.util.Optional; // Import JpaRepository

import org.springframework.data.jpa.repository.JpaRepository; // Import @Repository annotation
import org.springframework.stereotype.Repository; // Import Optional for handling potential null results

import com.marriagenetwork.userservice.User;

@Repository // Marks this interface as a Spring Data JPA repository component
public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository provides standard CRUD operations (Create, Read, Update, Delete)
    // for the User entity with a Long (ID) as its primary key.

    // You can define custom query methods here. Spring Data JPA will automatically
    // generate the implementation based on the method name.

    // Example: Find a user by their username
    Optional<User> findByUsername(String username);

    // Example: Find a user by their email
    Optional<User> findByEmail(String email);

    // You can add more custom methods like:
    // List<User> findByCity(String city);
    // List<User> findByGender(String gender);
}