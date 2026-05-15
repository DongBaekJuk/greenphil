package com.greenphil.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "blocked_words")
public class BlockedWord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String word;

    @Column(nullable = false)
    private boolean active = true;

    protected BlockedWord() {
    }

    public BlockedWord(String word) {
        this.word = word;
    }

    public String getWord() {
        return word;
    }

    public boolean isActive() {
        return active;
    }
}
