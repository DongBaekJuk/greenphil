package com.greenphil.api.dto;

import com.greenphil.domain.Post;
import com.greenphil.domain.PostStatus;
import com.greenphil.domain.PostType;
import java.time.Instant;
import java.util.List;

public record PostResponse(
    Long id,
    PostType type,
    String title,
    String content,
    UserResponse author,
    long views,
    int reports,
    long likes,
    long commentsCount,
    boolean likedByMe,
    boolean scrappedByMe,
    PostStatus status,
    Instant createdAt,
    List<CommentResponse> comments
) {
    public static PostResponse from(
        Post post,
        long likes,
        long commentsCount,
        boolean likedByMe,
        boolean scrappedByMe,
        List<CommentResponse> comments
    ) {
        return new PostResponse(
            post.getId(),
            post.getType(),
            post.getTitle(),
            post.getFilteredContent(),
            UserResponse.from(post.getAuthor()),
            post.getViewCount(),
            post.getReportCount(),
            likes,
            commentsCount,
            likedByMe,
            scrappedByMe,
            post.getStatus(),
            post.getCreatedAt(),
            comments
        );
    }
}
