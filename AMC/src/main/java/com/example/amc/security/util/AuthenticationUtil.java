package com.example.amc.security.util;

import com.example.amc.model.User;
import com.example.amc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthenticationUtil {

    private final UserRepository userRepository;

    // Simplified helper for development: return the first user in DB
    public User getCurrentUserFromDb() {
        return userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No users available in the database"));
    }

    public boolean isManager() {
        User user = getCurrentUserFromDb();
        return user.getRole() != null && user.getRole().name().equalsIgnoreCase("MANAGER");
    }
}
