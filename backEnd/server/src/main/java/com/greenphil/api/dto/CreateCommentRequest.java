package com.greenphil.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentRequest(@NotBlank String content) {
}
