package com.greenphil.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "users")
public class UserAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String supabaseUserId;

    @Column(nullable = false)
    private String displayName;

    private String avatarUrl;

    @Column(nullable = false)
    private int activityLevel = 1;

    @Column(nullable = false)
    private int reportCount = 0;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected UserAccount() {
    }

    public UserAccount(String supabaseUserId, String displayName, String avatarUrl) {
        this.supabaseUserId = supabaseUserId;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
    }

    public Long getId() {
        return id;
    }

    public String getSupabaseUserId() {
        return supabaseUserId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public int getActivityLevel() {
        return activityLevel;
    }

    public int getReportCount() {
        return reportCount;
    }

    public void refreshProfile(String displayName, String avatarUrl) {
        if (displayName != null && !displayName.isBlank()) {
            this.displayName = displayName;
        }
        if (avatarUrl != null && !avatarUrl.isBlank()) {
            this.avatarUrl = avatarUrl;
        }
        this.updatedAt = Instant.now();
    }

    public void addReport() {
        reportCount += 1;
        updatedAt = Instant.now();
    }

    public void setActivityLevel(int activityLevel) {
        this.activityLevel = activityLevel;
        this.updatedAt = Instant.now();
    }
}
