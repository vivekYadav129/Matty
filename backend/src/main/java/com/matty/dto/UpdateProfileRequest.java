package com.matty.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String username;
    private String profilePicUrl;
}
