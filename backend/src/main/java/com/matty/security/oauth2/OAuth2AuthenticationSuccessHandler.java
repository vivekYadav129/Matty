package com.matty.security.oauth2;

import com.matty.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String defaultRedirectUri;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174}")
    private String allowedOrigins;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            log.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

        clearAuthenticationAttributes(request, response);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        Optional<String> redirectUri = CookieUtils.getCookie(request, HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME)
                .map(Cookie::getValue);

        String targetUrl = redirectUri.filter(this::isAuthorizedRedirectUri).orElse(defaultRedirectUri);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(
                userPrincipal.getId(),
                userPrincipal.getEmail(),
                userPrincipal.getUser().getRole().name()
        );

        return UriComponentsBuilder.fromUriString(targetUrl)
                .queryParam("token", token)
                .build().toUriString();
    }

    protected void clearAuthenticationAttributes(HttpServletRequest request, HttpServletResponse response) {
        super.clearAuthenticationAttributes(request);
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
    }

    private boolean isAuthorizedRedirectUri(String uri) {
        if (uri == null || uri.isBlank()) {
            return false;
        }

        if (defaultRedirectUri != null && uri.trim().equalsIgnoreCase(defaultRedirectUri.trim())) {
            return true;
        }

        try {
            URI clientRedirectUri = URI.create(uri.trim());
            List<String> origins = Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();

            int clientPort = clientRedirectUri.getPort() != -1
                    ? clientRedirectUri.getPort()
                    : ("https".equalsIgnoreCase(clientRedirectUri.getScheme()) ? 443 : 80);

            for (String allowed : origins) {
                URI allowedUri = URI.create(allowed);
                int allowedPort = allowedUri.getPort() != -1
                        ? allowedUri.getPort()
                        : ("https".equalsIgnoreCase(allowedUri.getScheme()) ? 443 : 80);

                if (allowedUri.getScheme() != null
                        && allowedUri.getScheme().equalsIgnoreCase(clientRedirectUri.getScheme())
                        && allowedUri.getHost() != null
                        && allowedUri.getHost().equalsIgnoreCase(clientRedirectUri.getHost())
                        && allowedPort == clientPort) {
                    return true;
                }
            }
        } catch (Exception e) {
            log.warn("Error parsing redirect uri: {}", uri);
        }
        return false;
    }
}
