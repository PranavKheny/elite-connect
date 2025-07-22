package com.marriagenetwork.userservice;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer; // New import for Spring Security 6+

@Configuration // Marks this class as a Spring configuration class
@EnableWebSecurity // Enables Spring Security's web security features
public class SecurityConfig {

    @Bean // Defines a Spring bean for the security filter chain
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF protection for API endpoints.
            // This is generally safe for APIs that use stateless token-based authentication (like JWT).
            // For browser-based applications using session cookies, CSRF protection is vital.
            .csrf(AbstractHttpConfigurer::disable) // For Spring Security 6.1.0+

            // Configure authorization for all requests.
            // For now, we allow all authenticated requests.
            // You can specify more granular rules later (e.g., permitAll() for some paths)
            .authorizeHttpRequests(authorize -> authorize
                .anyRequest().authenticated() // All requests require authentication
            );

        // Use HTTP Basic authentication (the default when no formLogin or other methods are configured)
        http.httpBasic();

        return http.build(); // Build the security filter chain
    }
}