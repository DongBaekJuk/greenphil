package com.greenphil.repository;

import com.greenphil.domain.Scrap;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScrapRepository extends JpaRepository<Scrap, Long> {
    Optional<Scrap> findByUserIdAndPostId(Long userId, Long postId);
    long countByUserId(Long userId);
}
