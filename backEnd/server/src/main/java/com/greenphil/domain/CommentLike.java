package com.greenphil.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(name = "comment_likes", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "comment_id"}))
public class CommentLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private UserAccount user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Comment comment;

    private Instant createdAt = Instant.now();

    protected CommentLike() {
    }

    public CommentLike(UserAccount user, Comment comment) {
        this.user = user;
        this.comment = comment;
    }
}
