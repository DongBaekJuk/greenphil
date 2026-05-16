package com.greenphil.repository;

import com.greenphil.domain.Post;
import com.greenphil.domain.PostStatus;
import com.greenphil.domain.PostType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {
    @Query("""
        select p from Post p
        where p.status in :statuses
          and (:type is null or p.type = :type)
          and (:q is null or lower(coalesce(p.title, '')) like lower(concat('%', :q, '%'))
               or lower(p.filteredContent) like lower(concat('%', :q, '%')))
        order by p.createdAt desc
        """)
    List<Post> searchAll(@Param("statuses") List<PostStatus> statuses, @Param("type") PostType type, @Param("q") String q);

    @Query("""
        select p from Post p
        where p.author.id = :userId
          and p.status in :statuses
          and (:type is null or p.type = :type)
          and (:q is null or lower(coalesce(p.title, '')) like lower(concat('%', :q, '%'))
               or lower(p.filteredContent) like lower(concat('%', :q, '%')))
        order by p.createdAt desc
        """)
    List<Post> searchMine(@Param("userId") Long userId, @Param("statuses") List<PostStatus> statuses, @Param("type") PostType type, @Param("q") String q);

    @Query("""
        select s.post from Scrap s
        where s.user.id = :userId
          and s.post.status in :statuses
          and (:type is null or s.post.type = :type)
          and (:q is null or lower(coalesce(s.post.title, '')) like lower(concat('%', :q, '%'))
               or lower(s.post.filteredContent) like lower(concat('%', :q, '%')))
        order by s.post.createdAt desc
        """)
    List<Post> searchScrapped(@Param("userId") Long userId, @Param("statuses") List<PostStatus> statuses, @Param("type") PostType type, @Param("q") String q);

    @Query("""
        select l.post from PostLike l
        where l.user.id = :userId
          and l.post.status in :statuses
          and (:type is null or l.post.type = :type)
          and (:q is null or lower(coalesce(l.post.title, '')) like lower(concat('%', :q, '%'))
               or lower(l.post.filteredContent) like lower(concat('%', :q, '%')))
        order by l.post.createdAt desc
        """)
    List<Post> searchLiked(@Param("userId") Long userId, @Param("statuses") List<PostStatus> statuses, @Param("type") PostType type, @Param("q") String q);

    @Query("""
        select p from Post p
        where p.status in :statuses
        order by (case when p.viewCount = 0 then p.reportCount else (p.reportCount * 1.0 / p.viewCount) end) desc,
                 p.reportCount desc,
                 p.createdAt desc
        """)
    List<Post> findReportQueue(@Param("statuses") List<PostStatus> statuses);
}
