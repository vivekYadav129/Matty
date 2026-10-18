package com.matty.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.InMemoryOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.AuthenticatedPrincipalOAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Configuration
public class OAuth2ClientConfig {

    @Value("${app.oauth2.google.client-id:${GOOGLE_CLIENT_ID:}}")
    private String googleClientId;

    @Value("${app.oauth2.google.client-secret:${GOOGLE_CLIENT_SECRET:}}")
    private String googleClientSecret;

    @Value("${app.oauth2.github.client-id:${GITHUB_CLIENT_ID:}}")
    private String githubClientId;

    @Value("${app.oauth2.github.client-secret:${GITHUB_CLIENT_SECRET:}}")
    private String githubClientSecret;

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        List<ClientRegistration> registrations = new ArrayList<>();

        if (StringUtils.hasText(googleClientId) && StringUtils.hasText(googleClientSecret)) {
            log.info("Configuring Google OAuth2 client registration");
            registrations.add(CommonOAuth2Provider.GOOGLE.getBuilder("google")
                    .clientId(googleClientId.trim())
                    .clientSecret(googleClientSecret.trim())
                    .scope("openid", "profile", "email")
                    .build());
        } else {
            log.warn("Google OAuth credentials not provided (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET). Google login will be disabled.");
        }

        if (StringUtils.hasText(githubClientId) && StringUtils.hasText(githubClientSecret)) {
            log.info("Configuring GitHub OAuth2 client registration");
            registrations.add(CommonOAuth2Provider.GITHUB.getBuilder("github")
                    .clientId(githubClientId.trim())
                    .clientSecret(githubClientSecret.trim())
                    .scope("read:user", "user:email")
                    .build());
        } else {
            log.warn("GitHub OAuth credentials not provided (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET). GitHub login will be disabled.");
        }

        if (registrations.isEmpty()) {
            registrations.add(CommonOAuth2Provider.GOOGLE.getBuilder("google")
                    .clientId("dummy-google-client-id")
                    .clientSecret("dummy-google-client-secret")
                    .scope("openid", "profile", "email")
                    .build());
        }

        return new InMemoryClientRegistrationRepository(registrations);
    }

    @Bean
    public OAuth2AuthorizedClientService authorizedClientService(ClientRegistrationRepository clientRegistrationRepository) {
        return new InMemoryOAuth2AuthorizedClientService(clientRegistrationRepository);
    }

    @Bean
    public OAuth2AuthorizedClientRepository authorizedClientRepository(OAuth2AuthorizedClientService authorizedClientService) {
        return new AuthenticatedPrincipalOAuth2AuthorizedClientRepository(authorizedClientService);
    }
}
