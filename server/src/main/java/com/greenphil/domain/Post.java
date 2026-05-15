package com.greenphil.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private UserAccount author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostType type;

    private String title;

    @Column(nullable = false, length = 6000)
    private String content;

    @Column(nullable = false, length = 6000)
    private String filteredContent;

    @Column(nullable = false)
    private long viewCount = 0;

    @Column(nullable = false)
    private int reportCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status = PostStatus.ACTIVE;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected Post() {
    }

    public Post(UserAccount author, PostType type, String title, String content, String filteredContent) {
        this.author = author;
        this.type = type;
        this.title = title;
        this.content = content;
        this.filteredContent = filteredContent;
    }

    public Long getId() {
        return id;
    }

    public UserAccount getAuthor() {
        return author;
    }

    public PostType getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public String getFilteredContent() {
        return filteredContent;
    }

    public long getViewCount() {
        return viewCount;
    }

    public int getReportCount() {
        return reportCount;
    }

    public PostStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void addView() {
        viewCount += 1;
    }

    public void addReport() {
        reportCount += 1;
        if (reportCount >= 5) {
            status = PostStatus.REVIEW;
        }
        updatedAt = Instant.now();
    }
}
