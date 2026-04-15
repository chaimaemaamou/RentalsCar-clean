package com.example.amc.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "password";
        String hash = encoder.encode(password);
        System.out.println("BCrypt hash for '" + password + "':");
        System.out.println(hash);
        
        // Verify the existing hash from data.sql
        String existingHash = "$2a$10$7EqJtq98hPqEX7fNZaFWoOHi2D2W.Z6Q/ueJm6w4G6dWfQ5.8F8Ui";
        boolean matches = encoder.matches(password, existingHash);
        System.out.println("\nExisting hash matches 'password': " + matches);
    }
}
