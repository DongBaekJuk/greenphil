package com.greenphil.repository;

import com.greenphil.domain.BlockedWord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlockedWordRepository extends JpaRepository<BlockedWord, Long> {
    List<BlockedWord> findByActiveTrueOrderByWordAsc();
}
