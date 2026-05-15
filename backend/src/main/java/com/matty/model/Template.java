package com.matty.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "templates")
public class Template {

    @Id
    private String id;

    private String title;

    private Category category;

    /** Fabric.js canvas JSON stored as a raw object */
    private Object jsonData;

    private String thumbnailUrl;

    private boolean isPro = false;

    private List<String> tags = new ArrayList<>();

    private int usageCount = 0;

    private String createdBy;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Category {
        SOCIAL_MEDIA, POSTER, BANNER, PRESENTATION, FLYER, BUSINESS_CARD
    }
}
