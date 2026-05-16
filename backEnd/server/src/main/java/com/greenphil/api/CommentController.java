package com.greenphil.api;

import com.greenphil.api.dto.ToggleResponse;
import com.greenphil.service.CurrentUserService;
import com.greenphil.service.PostService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    private final PostService postService;
    private final CurrentUserService currentUserService;

    public CommentController(PostService postService, CurrentUserService currentUserService) {
        this.postService = postService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/{commentId}/like")
    public ToggleResponse like(@PathVariable Long commentId) {
        return postService.toggleCommentLike(commentId, currentUserService.requireCurrentUser());
    }
}
