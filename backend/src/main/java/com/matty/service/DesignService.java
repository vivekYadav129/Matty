package com.matty.service;

import com.matty.dto.DesignRequest;
import com.matty.model.Design;
import com.matty.repository.DesignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DesignService {

    private final DesignRepository designRepository;

    public Page<Design> getUserDesigns(String userId, int page, int size) {
        return designRepository.findByUserIdOrderByUpdatedAtDesc(userId, PageRequest.of(page, size));
    }

    public Page<Design> getPublicDesigns(int page, int size) {
        return designRepository.findByIsPublicTrueOrderByUpdatedAtDesc(PageRequest.of(page, size));
    }

    public Design getDesign(String designId) {
        return designRepository.findById(designId)
                .orElseThrow(() -> new RuntimeException("Design not found"));
    }

    public Design createDesign(String userId, DesignRequest request) {
        Design design = new Design();
        design.setUserId(userId);
        design.setTitle(request.getTitle() != null ? request.getTitle() : "Untitled Design");
        design.setJsonData(request.getJsonData());
        design.setThumbnailUrl(request.getThumbnailUrl());
        design.setCanvasWidth(request.getCanvasWidth());
        design.setCanvasHeight(request.getCanvasHeight());
        design.setPublic(request.getIsPublic() != null && request.getIsPublic());
        design.setTags(request.getTags());
        return designRepository.save(design);
    }

    public Design updateDesign(String designId, String userId, DesignRequest request) {
        Design design = getDesign(designId);
        validateOwner(design, userId);

        if (request.getTitle() != null) design.setTitle(request.getTitle());
        if (request.getJsonData() != null) design.setJsonData(request.getJsonData());
        if (request.getThumbnailUrl() != null) design.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getCanvasWidth() != null) design.setCanvasWidth(request.getCanvasWidth());
        if (request.getCanvasHeight() != null) design.setCanvasHeight(request.getCanvasHeight());
        if (request.getIsPublic() != null) design.setPublic(request.getIsPublic());
        if (request.getTags() != null) design.setTags(request.getTags());
        design.setUpdatedAt(LocalDateTime.now());

        return designRepository.save(design);
    }

    public void deleteDesign(String designId, String userId) {
        Design design = getDesign(designId);
        validateOwner(design, userId);
        designRepository.delete(design);
    }

    public Design duplicateDesign(String designId, String userId) {
        Design original = getDesign(designId);
        validateOwner(original, userId);

        Design copy = new Design();
        copy.setUserId(userId);
        copy.setTitle(original.getTitle() + " (Copy)");
        copy.setJsonData(original.getJsonData());
        copy.setThumbnailUrl(original.getThumbnailUrl());
        copy.setCanvasWidth(original.getCanvasWidth());
        copy.setCanvasHeight(original.getCanvasHeight());
        copy.setPublic(false);
        copy.setTags(original.getTags());

        return designRepository.save(copy);
    }

    public void deleteAllUserDesigns(String userId) {
        designRepository.findByUserId(userId).forEach(designRepository::delete);
    }

    private void validateOwner(Design design, String userId) {
        if (!design.getUserId().equals(userId)) {
            throw new RuntimeException("You don't have permission to modify this design");
        }
    }
}
