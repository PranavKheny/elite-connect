package com.eliteconnect.userservice.security;

import java.util.Collection; // Import your User entity
import java.util.Collections;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.eliteconnect.userservice.User;

public class CustomUserDetails implements UserDetails {

    private String username;
    private String password; // This will be the hashed password
    private List<GrantedAuthority> authorities;

    // Constructor to create CustomUserDetails from your User entity
    public CustomUserDetails(User user) {
        this.username = user.getUsername();
        this.password = user.getPasswordHash(); // Use the stored hashed password
        // For now, assign a default "USER" role. You can expand this later.
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    // --- Account Status Flags (for now, always return true) ---
    // In a real application, these would be managed (e.g., enable/disable accounts)

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}