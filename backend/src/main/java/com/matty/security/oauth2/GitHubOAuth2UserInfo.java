package com.matty.security.oauth2;

import java.util.Map;

public class GitHubOAuth2UserInfo extends OAuth2UserInfo {

    private String resolvedEmail;
    private boolean emailVerified;

    public GitHubOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    public void setResolvedEmail(String resolvedEmail, boolean verified) {
        this.resolvedEmail = resolvedEmail;
        this.emailVerified = verified;
    }

    @Override
    public String getId() {
        Object idObj = attributes.get("id");
        return idObj != null ? String.valueOf(idObj) : null;
    }

    @Override
    public String getName() {
        String name = (String) attributes.get("name");
        if (name == null || name.isBlank()) {
            name = (String) attributes.get("login");
        }
        return name;
    }

    @Override
    public String getEmail() {
        if (resolvedEmail != null && !resolvedEmail.isBlank()) {
            return resolvedEmail;
        }
        return (String) attributes.get("email");
    }

    @Override
    public String getImageUrl() {
        return (String) attributes.get("avatar_url");
    }

    @Override
    public boolean isEmailVerified() {
        return emailVerified;
    }
}
