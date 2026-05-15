package com.greenphil.api.dto;

public record RiskyUserResponse(
    UserResponse user,
    long posts,
    int reports,
    String riskLabel,
    String tone
) {
}
