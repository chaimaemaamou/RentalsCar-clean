package com.example.amc.exception.custom;

public class UnauthorizedViewException extends RuntimeException {
    public UnauthorizedViewException(String message) {
        super(message);
    }
}
