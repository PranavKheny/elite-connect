package com.eliteconnect.userservice.util;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // --- Token Generation Methods ---

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        // Updated to use non-deprecated builder methods for JJWT 0.12.5+
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                // FIX: Use signWith(SecretKey key) variant as getSigningKey returns SecretKey
                .signWith(getSigningKey()) // Corrected method call for JJWT 0.12.5
                .compact();
    }

    // Changed return type to SecretKey for clarity and correct usage with signWith
    private SecretKey getSigningKey() { // Changed return type from Key to SecretKey
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // --- Token Validation & Extraction Methods ---

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        // Updated to use non-deprecated parser methods for JJWT 0.12.5+
        return Jwts.parser()
                .verifyWith(getSigningKey()) // FIX: Use verifyWith() instead of setSigningKey()
                .build()
                .parseSignedClaims(token) // FIX: Use parseSignedClaims() instead of parseClaimsJws()
                .getPayload(); // FIX: Use getPayload() instead of getBody()
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}