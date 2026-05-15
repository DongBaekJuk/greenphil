package com.greenphil.api.dto;

import com.greenphil.domain.PostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreatePostRequest(
    @NotNull PostType type,
    String title,
    @NotBlank String content
) {
}
