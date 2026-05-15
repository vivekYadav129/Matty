package com.matty.repository;

import com.matty.model.Design;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DesignRepository extends MongoRepository<Design, String> {
    Page<Design> findByUserIdOrderByUpdatedAtDesc(String userId, Pageable pageable);
    Page<Design> findByIsPublicTrueOrderByUpdatedAtDesc(Pageable pageable);
    List<Design> findByUserId(String userId);
    long countByUserId(String userId);
}
