package com.matty.service;

import com.matty.dto.AuthResponse;
import com.matty.dto.LinkAccountRequest;
import com.matty.dto.LoginRequest;
import com.matty.dto.RegisterRequest;
import com.matty.model.User;
import com.matty.repository.UserRepository;
import com.matty.security.oauth2.GoogleOAuth2UserInfo;
import com.matty.security.oauth2.OAuthAccountLinkingRequiredException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNA==");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 604800000L);

        authService = new AuthService(userRepository, passwordEncoder, jwtService);

        sampleUser = new User();
        sampleUser.setId("user-1");
        sampleUser.setUsername("vivek_dev");
        sampleUser.setEmail("vivek@example.com");
        sampleUser.setPasswordHash(passwordEncoder.encode("myPassword"));
        sampleUser.setRole(User.Role.USER);
        sampleUser.setPlan(User.Plan.FREE);
        sampleUser.setProvider(User.AuthProvider.LOCAL);
        sampleUser.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Registration successfully normalizes email to lowercase and trims whitespace")
    void testRegisterNormalizesEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("Vivek_Dev ");
        request.setEmail("  Vivek@Example.COM  ");
        request.setPassword("Secret123!");

        when(userRepository.existsByEmailIgnoreCase("vivek@example.com")).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("Vivek_Dev")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId("new-id");
            return u;
        });

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("vivek@example.com", response.getEmail());
        assertEquals("Vivek_Dev", response.getUsername());
        assertNotNull(response.getToken());
        assertTrue(jwtService.isTokenValid(response.getToken()));
        assertEquals("new-id", jwtService.extractUserId(response.getToken()));
    }

    @Test
    @DisplayName("Registration rejects duplicate email case-insensitively")
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("VIVEK@example.com");
        request.setPassword("password123");

        when(userRepository.existsByEmailIgnoreCase("vivek@example.com")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(request));
        assertEquals("Email already registered", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Registration rejects duplicate username case-insensitively")
    void testRegisterDuplicateUsername() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("VIVEK_DEV");
        request.setEmail("different@example.com");
        request.setPassword("password123");

        when(userRepository.existsByEmailIgnoreCase("different@example.com")).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("VIVEK_DEV")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(request));
        assertEquals("Username already taken", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login succeeds repeatedly regardless of email casing and whitespace")
    void testLoginRepeatedlyWithDifferentCasing() {
        LoginRequest request = new LoginRequest();
        request.setEmail("  VIVEK@Example.Com ");
        request.setPassword("myPassword");

        when(userRepository.findByEmail("vivek@example.com")).thenReturn(Optional.of(sampleUser));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("vivek@example.com", response.getEmail());
        assertNotNull(response.getToken());
        assertTrue(jwtService.isTokenValid(response.getToken()));
        assertEquals("user-1", jwtService.extractUserId(response.getToken()));
    }

    @Test
    @DisplayName("Login rejects incorrect password")
    void testLoginIncorrectPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("vivek@example.com");
        request.setPassword("wrongPassword");

        when(userRepository.findByEmail("vivek@example.com")).thenReturn(Optional.of(sampleUser));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    @DisplayName("Login rejects unknown email")
    void testLoginUnknownEmail() {
        LoginRequest request = new LoginRequest();
        request.setEmail("unknown@example.com");
        request.setPassword("anyPassword");

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());
        when(userRepository.findFirstByEmailIgnoreCase("unknown@example.com")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    @DisplayName("OAuth: repeated logins with same provider ID resolve to the same account")
    void testOAuthRepeatedLogin() {
        GoogleOAuth2UserInfo googleInfo = new GoogleOAuth2UserInfo(Map.of(
                "sub", "google-sub-999",
                "email", "googleuser@gmail.com",
                "name", "Google User",
                "picture", "https://avatar.url/pic.jpg",
                "email_verified", true
        ));

        User existingOAuthUser = new User();
        existingOAuthUser.setId("oauth-user-id");
        existingOAuthUser.setEmail("googleuser@gmail.com");
        existingOAuthUser.setUsername("google_user");
        existingOAuthUser.setProvider(User.AuthProvider.GOOGLE);
        existingOAuthUser.setProviderId("google-sub-999");

        when(userRepository.findByProviderAndProviderId(User.AuthProvider.GOOGLE, "google-sub-999"))
                .thenReturn(Optional.of(existingOAuthUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = authService.processOAuthUser(User.AuthProvider.GOOGLE, googleInfo);

        assertEquals("oauth-user-id", result.getId());
        assertEquals("google-sub-999", result.getProviderId());
    }

    @Test
    @DisplayName("OAuth: creates new user when account does not exist")
    void testOAuthCreatesNewUser() {
        GoogleOAuth2UserInfo googleInfo = new GoogleOAuth2UserInfo(Map.of(
                "sub", "google-sub-12345",
                "email", "newuser@gmail.com",
                "name", "New User",
                "picture", "https://avatar.url/new.jpg",
                "email_verified", true
        ));

        when(userRepository.findByProviderAndProviderId(User.AuthProvider.GOOGLE, "google-sub-12345"))
                .thenReturn(Optional.empty());
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        when(userRepository.findByEmail("newuser@gmail.com")).thenReturn(Optional.empty());
        when(userRepository.findFirstByEmailIgnoreCase("newuser@gmail.com")).thenReturn(Optional.empty());
        when(userRepository.existsByUsernameIgnoreCase(anyString())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId("created-oauth-id");
            return u;
        });

        User result = authService.processOAuthUser(User.AuthProvider.GOOGLE, googleInfo);

        assertNotNull(result);
        assertEquals("created-oauth-id", result.getId());
        assertEquals(User.AuthProvider.GOOGLE, result.getProvider());
        assertEquals("google-sub-12345", result.getProviderId());
        assertEquals("newuser@gmail.com", result.getEmail());
    }

    @Test
    @DisplayName("OAuth: rejects silent merge if email belongs to password account and requires account linking")
    void testOAuthRequiresLinkingWhenEmailHasPassword() {
        GoogleOAuth2UserInfo googleInfo = new GoogleOAuth2UserInfo(Map.of(
                "sub", "google-sub-conflict",
                "email", "vivek@example.com",
                "name", "Vivek Yadav",
                "email_verified", true
        ));

        when(userRepository.findByProviderAndProviderId(User.AuthProvider.GOOGLE, "google-sub-conflict"))
                .thenReturn(Optional.empty());
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        when(userRepository.findByEmail("vivek@example.com")).thenReturn(Optional.of(sampleUser));

        OAuthAccountLinkingRequiredException ex = assertThrows(
                OAuthAccountLinkingRequiredException.class,
                () -> authService.processOAuthUser(User.AuthProvider.GOOGLE, googleInfo)
        );

        assertEquals("vivek@example.com", ex.getEmail());
        assertEquals("google", ex.getProvider());
        assertEquals("google-sub-conflict", ex.getProviderId());
    }

    @Test
    @DisplayName("Account linking succeeds when verified with correct password")
    void testLinkAccountSuccess() {
        LinkAccountRequest request = new LinkAccountRequest();
        request.setEmail("vivek@example.com");
        request.setPassword("myPassword");
        request.setProvider("google");
        request.setProviderId("google-sub-conflict");

        when(userRepository.findByEmail("vivek@example.com")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.linkAccount(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertTrue(jwtService.isTokenValid(response.getToken()));
        assertEquals("google-sub-conflict", sampleUser.getLinkedProviders().get("google"));
    }

    @Test
    @DisplayName("GitHub OAuth: handles private/unavailable email gracefully with reliable fallback and provider identity")
    void testGitHubOAuthPrivateEmail() {
        com.matty.security.oauth2.GitHubOAuth2UserInfo githubInfo = new com.matty.security.oauth2.GitHubOAuth2UserInfo(Map.of(
                "id", 1234567,
                "login", "octocat",
                "name", "The Octocat",
                "avatar_url", "https://avatar.url/octo.png"
        ));
        githubInfo.setResolvedEmail(null, false);

        when(userRepository.findByProviderAndProviderId(User.AuthProvider.GITHUB, "1234567"))
                .thenReturn(Optional.empty());
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        when(userRepository.existsByUsernameIgnoreCase(anyString())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId("github-user-id");
            return u;
        });

        User result = authService.processOAuthUser(User.AuthProvider.GITHUB, githubInfo);

        assertNotNull(result);
        assertEquals("github-user-id", result.getId());
        assertEquals(User.AuthProvider.GITHUB, result.getProvider());
        assertEquals("1234567", result.getProviderId());
        assertTrue(result.getEmail().contains("users.noreply.matty.internal"));
    }
}
