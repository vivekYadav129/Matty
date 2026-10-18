package com.matty.security.oauth2;

import com.matty.model.User;
import com.matty.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final AuthService authService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to process OAuth2 user", ex);
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        if (!StringUtils.hasText(oAuth2UserInfo.getId())) {
            throw new OAuth2AuthenticationException("Provider identity not found from " + registrationId);
        }

        // Special handling for GitHub private / unverified emails
        if (registrationId.equalsIgnoreCase("github") && oAuth2UserInfo instanceof GitHubOAuth2UserInfo gitHubUserInfo) {
            resolveGitHubEmail(oAuth2UserRequest.getAccessToken().getTokenValue(), gitHubUserInfo);
        }

        User.AuthProvider provider;
        try {
            provider = User.AuthProvider.valueOf(registrationId.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
        }

        User user = authService.processOAuthUser(provider, oAuth2UserInfo);
        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }

    private void resolveGitHubEmail(String accessToken, GitHubOAuth2UserInfo gitHubUserInfo) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    "https://api.github.com/user/emails",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            List<Map<String, Object>> emails = response.getBody();
            if (emails != null && !emails.isEmpty()) {
                String primaryVerified = null;
                String anyVerified = null;

                for (Map<String, Object> emailObj : emails) {
                    String email = (String) emailObj.get("email");
                    boolean verified = Boolean.TRUE.equals(emailObj.get("verified"));
                    boolean primary = Boolean.TRUE.equals(emailObj.get("primary"));

                    if (verified && primary) {
                        primaryVerified = email;
                        break;
                    } else if (verified && anyVerified == null) {
                        anyVerified = email;
                    }
                }

                if (primaryVerified != null) {
                    gitHubUserInfo.setResolvedEmail(primaryVerified, true);
                } else if (anyVerified != null) {
                    gitHubUserInfo.setResolvedEmail(anyVerified, true);
                } else {
                    // All emails are unverified. Do not treat as verified!
                    gitHubUserInfo.setResolvedEmail(null, false);
                }
            }
        } catch (Exception ex) {
            log.warn("Could not retrieve emails from GitHub API: {}", ex.getMessage());
        }
    }
}
