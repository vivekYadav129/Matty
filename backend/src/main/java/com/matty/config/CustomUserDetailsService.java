package com.matty.config;

import com.matty.model.User;
import com.matty.repository.UserRepository;
import com.matty.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String normalizedEmail = AuthService.normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .or(() -> userRepository.findFirstByEmailIgnoreCase(normalizedEmail))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        String passwordHash = user.getPasswordHash();
        if (passwordHash == null || passwordHash.isBlank()) {
            // Placeholder hash that won't match any password for OAuth-only accounts
            passwordHash = "{noop}NO_PASSWORD_SET_USE_OAUTH";
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                passwordHash,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }
}
