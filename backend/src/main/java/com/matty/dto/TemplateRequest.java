package com.matty.dto;

import com.matty.model.Template;
import lombok.Data;

import java.util.List;

@Data
public class TemplateRequest {
    private String title;
    private Template.Category category;
    private Object jsonData;
    private String thumbnailUrl;
    private Boolean isPro;
    private List<String> tags;
}
