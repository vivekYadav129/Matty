package com.matty.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
@CompoundIndexes({
    @CompoundIndex(name = "provider_providerId_idx", def = "{'provider': 1, 'providerId': 1}", sparse = true)
})
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private Role role = Role.USER;

    private String profilePicUrl;

    private Plan plan = Plan.FREE;

    private AuthProvider provider = AuthProvider.LOCAL;

    private String providerId;

    private Map<String, String> linkedProviders = new HashMap<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    public AuthProvider getProvider() {
        return provider != null ? provider : AuthProvider.LOCAL;
    }

    public Map<String, String> getLinkedProviders() {
        if (linkedProviders == null) {
            linkedProviders = new HashMap<>();
        }
        return linkedProviders;
    }

    public enum Role {
        USER, ADMIN
    }

    public enum Plan {
        FREE, PRO
    }

    public enum AuthProvider {
        LOCAL, GOOGLE, GITHUB
    }
}
