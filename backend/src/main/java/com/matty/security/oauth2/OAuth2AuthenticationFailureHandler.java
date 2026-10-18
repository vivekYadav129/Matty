package com.matty.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String defaultRedirectUri;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174}")
    private String allowedOrigins;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        String targetUrl = CookieUtils.getCookie(request, HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME)
                .map(Cookie::getValue)
                .filter(this::isAuthorizedRedirectUri)
                .orElse(defaultRedirectUri);

        Throwable cause = exception.getCause();
        if (cause instanceof OAuthAccountLinkingRequiredException linkingEx) {
            targetUrl = UriComponentsBuilder.fromUriString(targetUrl)
                    .queryParam("error", "account_linking_required")
                    .queryParam("email", linkingEx.getEmail())
                    .queryParam("provider", linkingEx.getProvider())
                    .queryParam("providerId", linkingEx.getProviderId())
                    .queryParam("message", linkingEx.getMessage())
                    .build().toUriString();
        } else {
            String errorMsg = exception.getLocalizedMessage();
            if (errorMsg == null || errorMsg.isBlank()) {
                errorMsg = "OAuth authentication failed";
            }
            targetUrl = UriComponentsBuilder.fromUriString(targetUrl)
                    .queryParam("error", errorMsg)
                    .build().toUriString();
        }

        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private boolean isAuthorizedRedirectUri(String uri) {
        if (uri == null || uri.isBlank()) {
            return false;
        }

        if (defaultRedirectUri != null && uri.trim().equalsIgnoreCase(defaultRedirectUri.trim())) {
            return true;
        }

        try {
            java.net.URI clientRedirectUri = java.net.URI.create(uri.trim());
            java.util.List<String> origins = java.util.Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();

            int clientPort = clientRedirectUri.getPort() != -1
                    ? clientRedirectUri.getPort()
                    : ("https".equalsIgnoreCase(clientRedirectUri.getScheme()) ? 443 : 80);

            for (String allowed : origins) {
                java.net.URI allowedUri = java.net.URI.create(allowed);
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
