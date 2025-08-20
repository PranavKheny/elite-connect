package com.eliteconnect.userservice.match;

import java.time.LocalDateTime;

import com.eliteconnect.userservice.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;


@Entity
@Table(
    name = "matches",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_matches_user1_user2", columnNames = {"user1_id", "user2_id"})
    }
)
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Column(name = "matched_at", nullable = false)
    private LocalDateTime matchedAt = LocalDateTime.now();

    public Match() {}

    public Match(User user1, User user2) {
        this.user1 = user1;
        this.user2 = user2;
        this.matchedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public User getUser1() { return user1; }
    public User getUser2() { return user2; }
    public LocalDateTime getMatchedAt() { return matchedAt; }

    public void setId(Long id) { this.id = id; }
    public void setUser1(User user1) { this.user1 = user1; }
    public void setUser2(User user2) { this.user2 = user2; }
    public void setMatchedAt(LocalDateTime matchedAt) { this.matchedAt = matchedAt; }
}
