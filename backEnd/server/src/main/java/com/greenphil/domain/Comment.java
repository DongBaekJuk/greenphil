package com.greenphil.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private UserAccount author;

    @Column(nullable = false, length = 3000)
    private String content;

    @Column(nullable = false, length = 3000)
    private String filteredContent;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Comment() {
    }

    public Comment(Post post, UserAccount author, String content, String filteredContent) {
        this.post = post;
        this.author = author;
        this.content = content;
        this.filteredContent = filteredContent;
    }

    public Long getId() {
        return id;
    }

    public Post getPost() {
        return post;
    }

    public UserAccount getAuthor() {
        return author;
    }

    public String getFilteredContent() {
        return filteredContent;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
