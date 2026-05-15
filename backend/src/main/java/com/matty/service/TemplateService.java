package com.matty.service;

import com.matty.dto.TemplateRequest;
import com.matty.model.Design;
import com.matty.model.Template;
import com.matty.repository.DesignRepository;
import com.matty.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;
    private final DesignRepository designRepository;

    public Page<Template> listTemplates(Template.Category category, String search, Boolean isPro,
                                         String sort, int page, int size) {
        PageRequest pageRequest;

        if ("popular".equalsIgnoreCase(sort)) {
            pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "usageCount"));
        } else {
            pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        if (category != null && search != null && !search.isBlank()) {
            return templateRepository.findByCategoryAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(
                    category, search, pageRequest);
        } else if (category != null) {
            return templateRepository.findByCategoryOrderByCreatedAtDesc(category, pageRequest);
        } else if (search != null && !search.isBlank()) {
            return templateRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(search, pageRequest);
        } else if (isPro != null) {
            return templateRepository.findByIsProOrderByCreatedAtDesc(isPro, pageRequest);
        }

        return templateRepository.findAll(pageRequest);
    }

    public Template getTemplate(String templateId) {
        return templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));
    }

    public Design useTemplate(String templateId, String userId) {
        Template template = getTemplate(templateId);

        // Increment usage count
        template.setUsageCount(template.getUsageCount() + 1);
        templateRepository.save(template);

        // Create a new design from the template
        Design design = new Design();
        design.setUserId(userId);
        design.setTitle(template.getTitle());
        design.setJsonData(template.getJsonData());
        design.setThumbnailUrl(template.getThumbnailUrl());
        design.setPublic(false);
        design.setTags(template.getTags());

        return designRepository.save(design);
    }

    // Admin operations
    public Template createTemplate(String adminId, TemplateRequest request) {
        Template template = new Template();
        template.setTitle(request.getTitle());
        template.setCategory(request.getCategory());
        template.setJsonData(request.getJsonData());
        template.setThumbnailUrl(request.getThumbnailUrl());
        template.setPro(request.getIsPro() != null && request.getIsPro());
        template.setTags(request.getTags());
        template.setCreatedBy(adminId);
        return templateRepository.save(template);
    }

    public Template updateTemplate(String templateId, TemplateRequest request) {
        Template template = getTemplate(templateId);
        if (request.getTitle() != null) template.setTitle(request.getTitle());
        if (request.getCategory() != null) template.setCategory(request.getCategory());
        if (request.getJsonData() != null) template.setJsonData(request.getJsonData());
        if (request.getThumbnailUrl() != null) template.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getIsPro() != null) template.setPro(request.getIsPro());
        if (request.getTags() != null) template.setTags(request.getTags());
        return templateRepository.save(template);
    }

    public void deleteTemplate(String templateId) {
        templateRepository.deleteById(templateId);
    }
}
