package com.greenphil.api;

import com.greenphil.api.dto.CreateCommentRequest;
import com.greenphil.api.dto.CreatePostRequest;
import com.greenphil.api.dto.PostResponse;
import com.greenphil.api.dto.ReportRequest;
import com.greenphil.api.dto.ToggleResponse;
import com.greenphil.domain.PostType;
import com.greenphil.service.CurrentUserService;
import com.greenphil.service.PostService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;
    private final CurrentUserService currentUserService;

    public PostController(PostService postService, CurrentUserService currentUserService) {
        this.postService = postService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<PostResponse> list(
        @RequestParam(required = false) PostType type,
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "all") String scope
    ) {
        return postService.search(type, q, scope, currentUserService.currentUserOrNull());
    }

    @GetMapping("/{postId}")
    public PostResponse detail(@PathVariable Long postId) {
        return postService.get(postId, currentUserService.currentUserOrNull());
    }

    @PostMapping
    public PostResponse create(@Valid @RequestBody CreatePostRequest request) {
        return postService.create(request, currentUserService.requireCurrentUser());
    }

    @PostMapping("/{postId}/comments")
    public PostResponse comment(@PathVariable Long postId, @Valid @RequestBody CreateCommentRequest request) {
        return postService.comment(postId, request, currentUserService.requireCurrentUser());
    }

    @PostMapping("/{postId}/like")
    public ToggleResponse like(@PathVariable Long postId) {
        return postService.togglePostLike(postId, currentUserService.requireCurrentUser());
    }

    @PostMapping("/{postId}/scrap")
    public ToggleResponse scrap(@PathVariable Long postId) {
        return postService.toggleScrap(postId, currentUserService.requireCurrentUser());
    }

    @PostMapping("/{postId}/report")
    public PostResponse report(@PathVariable Long postId, @RequestBody(required = false) ReportRequest request) {
        return postService.reportPost(postId, request, currentUserService.requireCurrentUser());
    }
}
