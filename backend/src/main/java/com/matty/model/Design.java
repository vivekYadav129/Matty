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
@Document(collection = "designs")
public class Design {

    @Id
    private String id;

    private String userId;

    private String title;

    /** Fabric.js canvas JSON stored as a raw object */
    private Object jsonData;

    private String thumbnailUrl;

    private Integer canvasWidth;

    private Integer canvasHeight;

    private boolean isPublic = false;

    private List<String> tags = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();
}
