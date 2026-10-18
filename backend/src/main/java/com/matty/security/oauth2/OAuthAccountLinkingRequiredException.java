package com.matty.security.oauth2;

import org.springframework.security.core.AuthenticationException;

public class OAuthAccountLinkingRequiredException extends AuthenticationException {
    private final String email;
    private final String provider;
    private final String providerId;

    public OAuthAccountLinkingRequiredException(String message, String email, String provider, String providerId) {
        super(message);
        this.email = email;
        this.provider = provider;
        this.providerId = providerId;
    }

    public String getEmail() {
        return email;
    }

    public String getProvider() {
        return provider;
    }

    public String getProviderId() {
        return providerId;
    }
}
