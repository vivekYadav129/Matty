package com.matty.controller;

import com.matty.dto.StatsResponse;
import com.matty.model.User;
import com.matty.repository.DesignRepository;
import com.matty.repository.TemplateRepository;
import com.matty.repository.UserRepository;
import com.matty.service.DesignService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final DesignRepository designRepository;
    private final TemplateRepository templateRepository;
    private final DesignService designService;

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<User> users = userRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        // Strip password hashes
        users.getContent().forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, String>> changeUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newRole = body.get("role");
        user.setRole(User.Role.valueOf(newRole.toUpperCase()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Role updated to " + newRole));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        designService.deleteAllUserDesigns(id);
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User and their designs deleted"));
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats() {
        return ResponseEntity.ok(new StatsResponse(
                userRepository.count(),
                designRepository.count(),
                templateRepository.count(),
                "N/A" // Cloudinary storage would go here
        ));
    }
}
