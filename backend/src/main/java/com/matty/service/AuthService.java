package com.matty.service;

import com.matty.dto.AuthResponse;
import com.matty.dto.LinkAccountRequest;
import com.matty.dto.LoginRequest;
import com.matty.dto.RegisterRequest;
import com.matty.model.User;
import com.matty.repository.UserRepository;
import com.matty.security.oauth2.OAuth2UserInfo;
import com.matty.security.oauth2.OAuthAccountLinkingRequiredException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedUsername = request.getUsername() != null ? request.getUsername().trim() : "";

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            throw new RuntimeException("Username already taken");
        }

        User user = new User();
        user.setUsername(normalizedUsername);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        user.setPlan(User.Plan.FREE);
        user.setProvider(User.AuthProvider.LOCAL);
        user.setCreatedAt(LocalDateTime.now());

        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getPlan(),
                user.getProfilePicUrl(),
                user.getProvider()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(normalizedEmail)
                .or(() -> userRepository.findFirstByEmailIgnoreCase(normalizedEmail))
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new RuntimeException("This account was created with " + user.getProvider() + ". Please sign in with " + user.getProvider() + ".");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Auto-heal legacy records: ensure persisted email is normalized for repeated logins
        if (!normalizedEmail.equals(user.getEmail())) {
            user.setEmail(normalizedEmail);
            user = userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getPlan(),
                user.getProfilePicUrl(),
                user.getProvider()
        );
    }

    public AuthResponse linkAccount(LinkAccountRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(normalizedEmail)
                .or(() -> userRepository.findFirstByEmailIgnoreCase(normalizedEmail))
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String providerKey = request.getProvider().trim().toLowerCase(Locale.ROOT);
        user.getLinkedProviders().put(providerKey, request.getProviderId().trim());
        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getPlan(),
                user.getProfilePicUrl(),
                user.getProvider()
        );
    }

    public User processOAuthUser(User.AuthProvider provider, OAuth2UserInfo userInfo) {
        String providerId = userInfo.getId();
        if (!StringUtils.hasText(providerId)) {
            throw new RuntimeException("Provider identity missing from OAuth response");
        }

        // 1. Check if user already exists with this provider and providerId
        Optional<User> userOptional = userRepository.findByProviderAndProviderId(provider, providerId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if ((user.getProfilePicUrl() == null || user.getProfilePicUrl().isBlank()) && StringUtils.hasText(userInfo.getImageUrl())) {
                user.setProfilePicUrl(userInfo.getImageUrl());
                user = userRepository.save(user);
            }
            return user;
        }

        // 2. Check if providerId is present in linkedProviders of an existing user
        String providerKey = provider.name().toLowerCase(Locale.ROOT);
        for (User candidate : userRepository.findAll()) {
            if (providerId.equals(candidate.getLinkedProviders().get(providerKey))) {
                return candidate;
            }
        }

        // 3. Not registered under this providerId yet. Check if email exists
        String rawEmail = userInfo.getEmail();
        String normalizedEmail = normalizeEmail(rawEmail);

        if (StringUtils.hasText(normalizedEmail)) {
            Optional<User> userByEmail = userRepository.findByEmail(normalizedEmail)
                    .or(() -> userRepository.findFirstByEmailIgnoreCase(normalizedEmail));

            if (userByEmail.isPresent()) {
                // Account already exists with this email. Do NOT silently merge without password verification.
                throw new OAuthAccountLinkingRequiredException(
                        "An account with email " + normalizedEmail + " already exists. Please log in with your password to link your " + provider.name() + " account.",
                        normalizedEmail,
                        providerKey,
                        providerId
                );
            }
        }

        // 4. Create brand new User
        User newUser = new User();
        newUser.setProvider(provider);
        newUser.setProviderId(providerId);

        if (StringUtils.hasText(normalizedEmail)) {
            newUser.setEmail(normalizedEmail);
        } else {
            // Safe fallback for GitHub users with private/unavailable emails
            newUser.setEmail(providerId + "+" + providerKey + "@users.noreply.matty.internal");
        }

        String preferredName = userInfo.getName();
        newUser.setUsername(generateUniqueUsername(preferredName, newUser.getEmail()));
        newUser.setProfilePicUrl(userInfo.getImageUrl());
        newUser.setRole(User.Role.USER);
        newUser.setPlan(User.Plan.FREE);
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.getLinkedProviders().put(providerKey, providerId);

        return userRepository.save(newUser);
    }

    private String generateUniqueUsername(String preferredName, String email) {
        String base = null;
        if (StringUtils.hasText(preferredName)) {
            base = preferredName.trim().replaceAll("[^a-zA-Z0-9_.-]", "_");
        }
        if (!StringUtils.hasText(base) && StringUtils.hasText(email)) {
            int atIdx = email.indexOf('@');
            base = atIdx > 0 ? email.substring(0, atIdx) : email;
            base = base.replaceAll("[^a-zA-Z0-9_.-]", "_");
        }
        if (!StringUtils.hasText(base)) {
            base = "user";
        }
        if (base.length() < 3) {
            base = base + "_user";
        }
        if (base.length() > 25) {
            base = base.substring(0, 25);
        }

        String candidate = base;
        int counter = 1;
        while (userRepository.existsByUsernameIgnoreCase(candidate)) {
            candidate = base + counter;
            counter++;
        }
        return candidate;
    }

    public User getCurrentUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
