package com.greenphil.repository;

import com.greenphil.domain.UserAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findBySupabaseUserId(String supabaseUserId);
}
