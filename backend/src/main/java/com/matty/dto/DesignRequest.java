package com.matty.dto;

import lombok.Data;

import java.util.List;

@Data
public class DesignRequest {
    private String title;
    private Object jsonData;
    private String thumbnailUrl;
    private Integer canvasWidth;
    private Integer canvasHeight;
    private Boolean isPublic;
    private List<String> tags;
}
