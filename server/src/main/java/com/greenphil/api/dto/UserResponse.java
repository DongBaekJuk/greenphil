package com.greenphil.api.dto;

import com.greenphil.domain.UserAccount;

public record UserResponse(
    Long id,
    String supabaseUserId,
    String displayName,
    String avatarUrl,
    int activityLevel,
    int reportCount
) {
    public static UserResponse from(UserAccount user) {
        return new UserResponse(
            user.getId(),
            user.getSupabaseUserId(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            user.getActivityLevel(),
            user.getReportCount()
        );
    }
}
