package com.matty.controller;

import com.matty.dto.TemplateRequest;
import com.matty.model.Design;
import com.matty.model.Template;
import com.matty.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<Page<Template>> listTemplates(
            @RequestParam(required = false) Template.Category category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isPro,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(templateService.listTemplates(category, search, isPro, sort, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Template> getTemplate(@PathVariable String id) {
        return ResponseEntity.ok(templateService.getTemplate(id));
    }

    @PostMapping("/{id}/use")
    public ResponseEntity<Design> useTemplate(
            @PathVariable String id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(templateService.useTemplate(id, authentication.getName()));
    }

    // === Admin endpoints ===

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Template> createTemplate(
            Authentication authentication,
            @RequestBody TemplateRequest request
    ) {
        return ResponseEntity.ok(templateService.createTemplate(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Template> updateTemplate(
            @PathVariable String id,
            @RequestBody TemplateRequest request
    ) {
        return ResponseEntity.ok(templateService.updateTemplate(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteTemplate(@PathVariable String id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok(Map.of("message", "Template deleted successfully"));
    }
}
