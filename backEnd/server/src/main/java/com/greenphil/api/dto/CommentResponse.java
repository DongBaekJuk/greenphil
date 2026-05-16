package com.greenphil.api.dto;

import com.greenphil.domain.Comment;
import java.time.Instant;

public record CommentResponse(
    Long id,
    UserResponse author,
    String content,
    long likes,
    boolean likedByMe,
    Instant createdAt
) {
    public static CommentResponse from(Comment comment, long likes, boolean likedByMe) {
        return new CommentResponse(
            comment.getId(),
            UserResponse.from(comment.getAuthor()),
            comment.getFilteredContent(),
            likes,
            likedByMe,
            comment.getCreatedAt()
        );
    }
}
