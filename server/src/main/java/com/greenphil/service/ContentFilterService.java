package com.greenphil.service;

import com.greenphil.domain.BlockedWord;
import com.greenphil.repository.BlockedWordRepository;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;

@Service
public class ContentFilterService {
    private static final List<String> FALLBACK_BLOCKED_WORDS = List.of("멍청이", "비속어", "욕설", "바보");
    private static final List<String> ANIMAL_REPLACEMENTS = List.of("🐢", "🐳", "🦊", "🐰", "🐱", "🐼");

    private final BlockedWordRepository blockedWords;

    public ContentFilterService(BlockedWordRepository blockedWords) {
        this.blockedWords = blockedWords;
    }

    public String filter(String text) {
        if (text == null || text.isBlank()) {
            return text;
        }
        String filtered = text;
        List<String> words = blockedWords.findByActiveTrueOrderByWordAsc().stream()
            .map(BlockedWord::getWord)
            .filter(word -> word != null && !word.isBlank())
            .toList();
        if (words.isEmpty()) {
            words = FALLBACK_BLOCKED_WORDS;
        }
        for (String word : words) {
            filtered = filtered.replaceAll("(?iu)" + java.util.regex.Pattern.quote(word), randomAnimal());
        }
        return filtered;
    }

    private String randomAnimal() {
        return ANIMAL_REPLACEMENTS.get(ThreadLocalRandom.current().nextInt(ANIMAL_REPLACEMENTS.size()));
    }
}
