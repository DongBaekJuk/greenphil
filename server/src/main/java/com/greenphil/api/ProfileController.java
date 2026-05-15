package com.greenphil.api;

import com.greenphil.api.dto.PostResponse;
import com.greenphil.api.dto.UserResponse;
import com.greenphil.domain.UserAccount;
import com.greenphil.service.CurrentUserService;
import com.greenphil.service.PostService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class ProfileController {
    private final CurrentUserService currentUserService;
    private final PostService postService;

    public ProfileController(CurrentUserService currentUserService, PostService postService) {
        this.currentUserService = currentUserService;
        this.postService = postService;
    }

    @GetMapping
    public UserResponse me() {
        return UserResponse.from(currentUserService.requireCurrentUser());
    }

    @GetMapping("/posts")
    public List<PostResponse> posts() {
        UserAccount user = currentUserService.requireCurrentUser();
        return postService.search(null, null, "mine", user);
    }

    @GetMapping("/liked-posts")
    public List<PostResponse> likedPosts() {
        UserAccount user = currentUserService.requireCurrentUser();
        return postService.search(null, null, "liked", user);
    }

    @GetMapping("/scraps")
    public List<PostResponse> scraps() {
        UserAccount user = currentUserService.requireCurrentUser();
        return postService.search(null, null, "scrapped", user);
    }
}
