package com.eliteconnect.userservice.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.eliteconnect.userservice.dto.UserSummaryDto;
import com.eliteconnect.userservice.service.MatchingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchingService matchingService;

    // Simple form for now: client passes userId
    @GetMapping("/of/{userId}")
    public ResponseEntity<List<UserSummaryDto>> getMatchesOf(@PathVariable Long userId) {
        var users = matchingService.getMatchedUsers(userId); // we'll add this method next
        var dto = users.stream().map(UserSummaryDto::from).toList();
        return ResponseEntity.ok(dto);
    }
}
