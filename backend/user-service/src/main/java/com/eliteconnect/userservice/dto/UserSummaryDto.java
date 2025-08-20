package com.eliteconnect.userservice.dto;

import com.eliteconnect.userservice.User;

public class UserSummaryDto {
    private Long id;
    private String username;

    public UserSummaryDto() {}

    public UserSummaryDto(Long id, String username) {
        this.id = id;
        this.username = username;
    }

    public static UserSummaryDto from(User u) {
        return new UserSummaryDto(u.getId(), u.getUsername());
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }

    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
}
