package com.matty.controller;

import com.matty.dto.DesignRequest;
import com.matty.model.Design;
import com.matty.service.DesignService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/designs")
@RequiredArgsConstructor
public class DesignController {

    private final DesignService designService;

    @GetMapping
    public ResponseEntity<Page<Design>> getUserDesigns(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(designService.getUserDesigns(authentication.getName(), page, size));
    }

    @GetMapping("/public")
    public ResponseEntity<Page<Design>> getPublicDesigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(designService.getPublicDesigns(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Design> getDesign(@PathVariable String id) {
        return ResponseEntity.ok(designService.getDesign(id));
    }

    @PostMapping
    public ResponseEntity<Design> createDesign(
            Authentication authentication,
            @RequestBody DesignRequest request
    ) {
        return ResponseEntity.ok(designService.createDesign(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Design> updateDesign(
            @PathVariable String id,
            Authentication authentication,
            @RequestBody DesignRequest request
    ) {
        return ResponseEntity.ok(designService.updateDesign(id, authentication.getName(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDesign(
            @PathVariable String id,
            Authentication authentication
    ) {
        designService.deleteDesign(id, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Design deleted successfully"));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<Design> duplicateDesign(
            @PathVariable String id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(designService.duplicateDesign(id, authentication.getName()));
    }
}
