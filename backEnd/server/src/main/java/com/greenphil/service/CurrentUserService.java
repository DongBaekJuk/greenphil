package com.greenphil.service;

import com.greenphil.domain.UserAccount;
import com.greenphil.repository.UserAccountRepository;
import com.greenphil.security.DevAuthenticationFilter.DevUserDetails;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CurrentUserService {
    private final UserAccountRepository users;

    public CurrentUserService(UserAccountRepository users) {
        this.users = users;
    }

    @Transactional
    public UserAccount requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new IllegalStateException("Login is required.");
        }

        String supabaseUserId = authentication.getName();
        String displayName = "GREENPHIL 사용자";
        String avatarUrl = null;

        if (authentication instanceof JwtAuthenticationToken jwtAuthentication) {
            Jwt jwt = jwtAuthentication.getToken();
            supabaseUserId = jwt.getSubject();
            displayName = claimText(jwt.getClaims(), "name", "full_name", "email");
            avatarUrl = claimText(jwt.getClaims(), "avatar_url", "picture");
            Object metadata = jwt.getClaims().get("user_metadata");
            if (metadata instanceof Map<?, ?> map) {
                displayName = firstNonBlank(displayName, valueOf(map.get("name")), valueOf(map.get("full_name")));
                avatarUrl = firstNonBlank(avatarUrl, valueOf(map.get("avatar_url")), valueOf(map.get("picture")));
            }
        } else if (authentication.getDetails() instanceof DevUserDetails devUserDetails) {
            displayName = firstNonBlank(devUserDetails.displayName(), "개발 사용자");
            avatarUrl = devUserDetails.avatarUrl();
        }

        String finalDisplayName = firstNonBlank(displayName, "GREENPHIL 사용자");
        String finalAvatarUrl = avatarUrl;
        UserAccount user = users.findBySupabaseUserId(supabaseUserId)
            .orElseGet(() -> users.save(new UserAccount(supabaseUserId, finalDisplayName, finalAvatarUrl)));
        user.refreshProfile(finalDisplayName, finalAvatarUrl);
        return user;
    }

    @Transactional
    public UserAccount currentUserOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        return requireCurrentUser();
    }

    private static String claimText(Map<String, Object> claims, String... keys) {
        for (String key : keys) {
            String value = valueOf(claims.get(key));
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static String valueOf(Object value) {
        return value == null ? null : value.toString();
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
