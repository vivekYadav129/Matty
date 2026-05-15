package com.matty.dto;

import com.matty.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String id;
    private String username;
    private String email;
    private User.Role role;
    private User.Plan plan;
    private String profilePicUrl;
}
