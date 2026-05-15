package com.matty.repository;

import com.matty.model.Template;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TemplateRepository extends MongoRepository<Template, String> {
    Page<Template> findByCategoryOrderByCreatedAtDesc(Template.Category category, Pageable pageable);
    Page<Template> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String keyword, Pageable pageable);
    Page<Template> findByCategoryAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(
            Template.Category category, String keyword, Pageable pageable);
    Page<Template> findByIsProOrderByCreatedAtDesc(boolean isPro, Pageable pageable);
    Page<Template> findAllByOrderByUsageCountDesc(Pageable pageable);
}
