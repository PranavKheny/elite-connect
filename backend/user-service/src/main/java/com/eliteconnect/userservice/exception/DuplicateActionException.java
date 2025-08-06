package com.eliteconnect.userservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class DuplicateActionException extends RuntimeException {
    public DuplicateActionException(String message) {
        super(message);
    }
}