package com.matty.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatsResponse {
    private long totalUsers;
    private long totalDesigns;
    private long totalTemplates;
    private String storageUsed;
}
