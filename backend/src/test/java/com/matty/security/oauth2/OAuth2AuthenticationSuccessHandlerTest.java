package com.matty.security.oauth2;

import com.matty.model.User;
import com.matty.repository.UserRepository;
import com.matty.service.AuthService;
import com.matty.service.JwtService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuth2AuthenticationSuccessHandlerTest {

    private JwtService jwtService;
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    private OAuth2AuthenticationSuccessHandler successHandler;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNA==");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 604800000L);

        authService = new AuthService(userRepository, new BCryptPasswordEncoder(), jwtService);

        successHandler = new OAuth2AuthenticationSuccessHandler(
                jwtService,
                authService,
                httpCookieOAuth2AuthorizationRequestRepository
        );

        ReflectionTestUtils.setField(successHandler, "defaultRedirectUri", "http://localhost:5173/oauth2/redirect");
        ReflectionTestUtils.setField(successHandler, "allowedOrigins", "http://localhost:5173,http://localhost:5174,https://matty-design-tau.vercel.app");

        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();

        sampleUser = new User();
        sampleUser.setId("matty-user-1");
        sampleUser.setEmail("googleuser@gmail.com");
        sampleUser.setUsername("googleuser");
        sampleUser.setRole(User.Role.USER);
        sampleUser.setPlan(User.Plan.FREE);
        sampleUser.setProvider(User.AuthProvider.GOOGLE);
        sampleUser.setProviderId("google-sub-12345");
    }

    @Test
    @DisplayName("Regression test: DefaultOidcUser principal is handled without ClassCastException")
    void testGoogleDefaultOidcUserHandledWithoutClassCastException() {
        Map<String, Object> claims = Map.of(
                "sub", "google-sub-12345",
                "name", "Google User",
                "email", "googleuser@gmail.com",
                "picture", "https://avatar.url/photo.jpg"
        );
        OidcIdToken idToken = new OidcIdToken("token-val", Instant.now(), Instant.now().plusSeconds(3600), claims);
        OidcUserInfo userInfo = new OidcUserInfo(claims);
        DefaultOidcUser defaultOidcUser = new DefaultOidcUser(
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")),
                idToken,
                userInfo,
                "sub"
        );

        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                defaultOidcUser,
                defaultOidcUser.getAuthorities(),
                "google"
        );

        request.setCookies(new Cookie("redirect_uri", "https://matty-design-tau.vercel.app/oauth2/redirect"));

        when(userRepository.findByProviderAndProviderId(User.AuthProvider.GOOGLE, "google-sub-12345"))
                .thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        String targetUrl = successHandler.determineTargetUrl(request, response, authToken);

        assertNotNull(targetUrl);
        assertTrue(targetUrl.startsWith("https://matty-design-tau.vercel.app/oauth2/redirect"));
        assertTrue(targetUrl.contains("token="));
        verify(userRepository, times(1)).findByProviderAndProviderId(User.AuthProvider.GOOGLE, "google-sub-12345");
    }

    @Test
    @DisplayName("UserPrincipal principal is handled directly without re-processing")
    void testUserPrincipalHandledDirectly() {
        UserPrincipal userPrincipal = UserPrincipal.create(sampleUser);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userPrincipal);

        String targetUrl = successHandler.determineTargetUrl(request, response, authentication);

        assertNotNull(targetUrl);
        assertTrue(targetUrl.startsWith("http://localhost:5173/oauth2/redirect"));
        assertTrue(targetUrl.contains("token="));
        verify(userRepository, never()).findByProviderAndProviderId(any(), any());
    }

    @Test
    @DisplayName("GitHub DefaultOAuth2User is handled and resolves user via AuthService")
    void testGitHubDefaultOAuth2UserHandled() {
        Map<String, Object> attributes = Map.of(
                "id", 9876543,
                "login", "octocat",
                "name", "Octo Cat",
                "avatar_url", "https://github.com/images/error/octocat_happy.gif"
        );
        DefaultOAuth2User githubUser = new DefaultOAuth2User(
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "id"
        );

        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                githubUser,
                githubUser.getAuthorities(),
                "github"
        );

        sampleUser.setProvider(User.AuthProvider.GITHUB);
        sampleUser.setProviderId("9876543");
        when(userRepository.findByProviderAndProviderId(User.AuthProvider.GITHUB, "9876543"))
                .thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        String targetUrl = successHandler.determineTargetUrl(request, response, authToken);

        assertNotNull(targetUrl);
        assertTrue(targetUrl.contains("token="));
        verify(userRepository, times(1)).findByProviderAndProviderId(User.AuthProvider.GITHUB, "9876543");
    }

    @Test
    @DisplayName("Unauthorized redirect URI cookie is rejected and falls back to defaultRedirectUri")
    void testUnauthorizedRedirectUriFallback() {
        UserPrincipal userPrincipal = UserPrincipal.create(sampleUser);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userPrincipal);

        request.setCookies(new Cookie("redirect_uri", "https://attacker-controlled-site.com/steal-token"));

        String targetUrl = successHandler.determineTargetUrl(request, response, authentication);

        assertNotNull(targetUrl);
        assertTrue(targetUrl.startsWith("http://localhost:5173/oauth2/redirect"));
        assertFalse(targetUrl.contains("attacker-controlled-site.com"));
    }
}

