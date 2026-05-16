package com.greenphil.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class DevAuthenticationFilter extends OncePerRequestFilter {
    private final boolean devMode;

    public DevAuthenticationFilter(@Value("${app.auth.dev-mode:false}") boolean devMode) {
        this.devMode = devMode;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        String devUserId = request.getHeader("X-Dev-User-Id");
        if (devMode && devUserId != null && !devUserId.isBlank()
            && SecurityContextHolder.getContext().getAuthentication() == null) {
            var auth = new UsernamePasswordAuthenticationToken(
                devUserId,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
            );
            auth.setDetails(new DevUserDetails(
                request.getHeader("X-Dev-User-Name"),
                request.getHeader("X-Dev-User-Avatar")
            ));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        filterChain.doFilter(request, response);
    }

    public record DevUserDetails(String displayName, String avatarUrl) {
    }
}
