package com.greenphil.api;

import com.greenphil.api.dto.PostResponse;
import com.greenphil.api.dto.RiskyUserResponse;
import com.greenphil.service.CurrentUserService;
import com.greenphil.service.PostService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/moderation")
public class ModerationController {
    private final PostService postService;
    private final CurrentUserService currentUserService;

    public ModerationController(PostService postService, CurrentUserService currentUserService) {
        this.postService = postService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/risky-users")
    public List<RiskyUserResponse> riskyUsers() {
        return postService.riskyUsers();
    }

    @GetMapping("/report-queue")
    public List<PostResponse> reportQueue() {
        return postService.reportQueue(currentUserService.currentUserOrNull());
    }
}
