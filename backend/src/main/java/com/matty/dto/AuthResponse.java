package com.matty.dto;

import com.matty.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String id;
    private String username;
    private String email;
    private User.Role role;
    private User.Plan plan;
    private String profilePicUrl;
    private User.AuthProvider provider;

    public AuthResponse(String token, String id, String username, String email, User.Role role, User.Plan plan, String profilePicUrl) {
        this(token, id, username, email, role, plan, profilePicUrl, User.AuthProvider.LOCAL);
    }
}
