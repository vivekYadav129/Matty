package com.matty.controller;

import com.matty.dto.AuthResponse;
import com.matty.dto.LinkAccountRequest;
import com.matty.dto.LoginRequest;
import com.matty.dto.RegisterRequest;
import com.matty.model.User;
import com.matty.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final ClientRegistrationRepository clientRegistrationRepository;

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String defaultRedirectUri;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/link-account")
    public ResponseEntity<AuthResponse> linkAccount(@Valid @RequestBody LinkAccountRequest request) {
        return ResponseEntity.ok(authService.linkAccount(request));
    }

    @GetMapping("/oauth2/authorize/{provider}")
    public void authorizeProvider(
            @PathVariable String provider,
            @RequestParam(required = false) String redirect_uri,
            HttpServletResponse response
    ) throws IOException {
        String providerKey = provider.toLowerCase(Locale.ROOT);
        ClientRegistration registration = clientRegistrationRepository.findByRegistrationId(providerKey);

        String frontendTarget = (redirect_uri != null && !redirect_uri.isBlank()) ? redirect_uri : defaultRedirectUri;
        String fallbackErrorBase = frontendTarget.contains("/oauth2/redirect")
                ? frontendTarget.replace("/oauth2/redirect", "/")
                : frontendTarget;

        if (registration == null || registration.getClientId().startsWith("dummy-")) {
            String errorMsg = provider.toUpperCase() + " OAuth is not configured on the backend. Please configure " 
                    + provider.toUpperCase() + "_CLIENT_ID and " + provider.toUpperCase() + "_CLIENT_SECRET in backend environment variables.";
            response.sendRedirect(fallbackErrorBase + "?error=" + URLEncoder.encode(errorMsg, StandardCharsets.UTF_8));
            return;
        }

        String target = "/oauth2/authorization/" + providerKey;
        if (redirect_uri != null && !redirect_uri.isBlank()) {
            target += "?redirect_uri=" + URLEncoder.encode(redirect_uri, StandardCharsets.UTF_8);
        }
        response.sendRedirect(target);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        User user = authService.getCurrentUser(authentication.getName());
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("plan", user.getPlan());
        response.put("profilePicUrl", user.getProfilePicUrl() != null ? user.getProfilePicUrl() : "");
        response.put("provider", user.getProvider());
        response.put("linkedProviders", user.getLinkedProviders());
        response.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
        return ResponseEntity.ok(response);
    }
}
