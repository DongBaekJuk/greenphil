package com.greenphil.service;

import com.greenphil.api.dto.CommentResponse;
import com.greenphil.api.dto.CreateCommentRequest;
import com.greenphil.api.dto.CreatePostRequest;
import com.greenphil.api.dto.PostResponse;
import com.greenphil.api.dto.ReportRequest;
import com.greenphil.api.dto.RiskyUserResponse;
import com.greenphil.api.dto.ToggleResponse;
import com.greenphil.api.dto.UserResponse;
import com.greenphil.domain.Comment;
import com.greenphil.domain.CommentLike;
import com.greenphil.domain.Post;
import com.greenphil.domain.PostLike;
import com.greenphil.domain.PostStatus;
import com.greenphil.domain.PostType;
import com.greenphil.domain.Report;
import com.greenphil.domain.ReportTargetType;
import com.greenphil.domain.Scrap;
import com.greenphil.domain.UserAccount;
import com.greenphil.repository.CommentLikeRepository;
import com.greenphil.repository.CommentRepository;
import com.greenphil.repository.PostLikeRepository;
import com.greenphil.repository.PostRepository;
import com.greenphil.repository.ReportRepository;
import com.greenphil.repository.ScrapRepository;
import com.greenphil.repository.UserAccountRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PostService {
    private static final List<PostStatus> VISIBLE_STATUSES = List.of(PostStatus.ACTIVE, PostStatus.REVIEW);

    private final PostRepository posts;
    private final CommentRepository comments;
    private final PostLikeRepository postLikes;
    private final CommentLikeRepository commentLikes;
    private final ScrapRepository scraps;
    private final ReportRepository reports;
    private final UserAccountRepository users;
    private final ContentFilterService contentFilter;

    public PostService(
        PostRepository posts,
        CommentRepository comments,
        PostLikeRepository postLikes,
        CommentLikeRepository commentLikes,
        ScrapRepository scraps,
        ReportRepository reports,
        UserAccountRepository users,
        ContentFilterService contentFilter
    ) {
        this.posts = posts;
        this.comments = comments;
        this.postLikes = postLikes;
        this.commentLikes = commentLikes;
        this.scraps = scraps;
        this.reports = reports;
        this.users = users;
        this.contentFilter = contentFilter;
    }

    @Transactional(readOnly = true)
    public List<PostResponse> search(PostType type, String q, String scope, UserAccount currentUser) {
        String normalizedQ = q == null || q.isBlank() ? null : q.trim();
        String normalizedScope = scope == null || scope.isBlank() ? "all" : scope;
        Long userId = currentUser == null ? null : currentUser.getId();

        List<Post> result = switch (normalizedScope) {
            case "mine" -> requireUserScope(userId, () -> posts.searchMine(userId, VISIBLE_STATUSES, type, normalizedQ));
            case "scrapped" -> requireUserScope(userId, () -> posts.searchScrapped(userId, VISIBLE_STATUSES, type, normalizedQ));
            case "liked" -> requireUserScope(userId, () -> posts.searchLiked(userId, VISIBLE_STATUSES, type, normalizedQ));
            default -> posts.searchAll(VISIBLE_STATUSES, type, normalizedQ);
        };

        return result.stream().map(post -> toResponse(post, currentUser, false)).toList();
    }

    @Transactional
    public PostResponse get(Long postId, UserAccount currentUser) {
        Post post = findVisiblePost(postId);
        post.addView();
        return toResponse(post, currentUser, true);
    }

    @Transactional
    public PostResponse create(CreatePostRequest request, UserAccount author) {
        if (request.type() == PostType.DAWN_POST && (request.title() == null || request.title().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "게시글 모드는 제목이 필요합니다.");
        }
        String title = request.type() == PostType.ONE_LINE ? null : request.title().trim();
        String content = request.content().trim();
        Post post = posts.save(new Post(author, request.type(), title, content, contentFilter.filter(content)));
        author.setActivityLevel(Math.max(author.getActivityLevel(), (int) Math.min(99, posts.searchMine(author.getId(), VISIBLE_STATUSES, null, null).size() / 5 + 1)));
        return toResponse(post, author, true);
    }

    @Transactional
    public PostResponse comment(Long postId, CreateCommentRequest request, UserAccount author) {
        Post post = findVisiblePost(postId);
        comments.save(new Comment(post, author, request.content().trim(), contentFilter.filter(request.content().trim())));
        return toResponse(post, author, true);
    }

    @Transactional
    public ToggleResponse togglePostLike(Long postId, UserAccount user) {
        Post post = findVisiblePost(postId);
        return postLikes.findByUserIdAndPostId(user.getId(), post.getId())
            .map(existing -> {
                postLikes.delete(existing);
                return new ToggleResponse(false, postLikes.countByPostId(post.getId()));
            })
            .orElseGet(() -> {
                postLikes.save(new PostLike(user, post));
                return new ToggleResponse(true, postLikes.countByPostId(post.getId()));
            });
    }

    @Transactional
    public ToggleResponse toggleCommentLike(Long commentId, UserAccount user) {
        Comment comment = comments.findById(commentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));
        return commentLikes.findByUserIdAndCommentId(user.getId(), comment.getId())
            .map(existing -> {
                commentLikes.delete(existing);
                return new ToggleResponse(false, commentLikes.countByCommentId(comment.getId()));
            })
            .orElseGet(() -> {
                commentLikes.save(new CommentLike(user, comment));
                return new ToggleResponse(true, commentLikes.countByCommentId(comment.getId()));
            });
    }

    @Transactional
    public ToggleResponse toggleScrap(Long postId, UserAccount user) {
        Post post = findVisiblePost(postId);
        return scraps.findByUserIdAndPostId(user.getId(), post.getId())
            .map(existing -> {
                scraps.delete(existing);
                return new ToggleResponse(false, scraps.countByUserId(user.getId()));
            })
            .orElseGet(() -> {
                scraps.save(new Scrap(user, post));
                return new ToggleResponse(true, scraps.countByUserId(user.getId()));
            });
    }

    @Transactional
    public PostResponse reportPost(Long postId, ReportRequest request, UserAccount reporter) {
        Post post = findVisiblePost(postId);
        if (!reports.existsByReporterIdAndTargetTypeAndTargetId(reporter.getId(), ReportTargetType.POST, post.getId())) {
            reports.save(new Report(reporter, ReportTargetType.POST, post.getId(), request == null ? null : request.reason()));
            post.addReport();
            post.getAuthor().addReport();
        }
        return toResponse(post, reporter, true);
    }

    @Transactional(readOnly = true)
    public List<RiskyUserResponse> riskyUsers() {
        return users.findAll().stream()
            .filter(user -> user.getReportCount() > 0)
            .sorted(Comparator.comparingInt(UserAccount::getReportCount).reversed())
            .limit(20)
            .map(user -> {
                String tone = user.getReportCount() >= 12 ? "danger" : user.getReportCount() >= 5 ? "warning" : "safe";
                String label = user.getReportCount() >= 12 ? "위험군" : user.getReportCount() >= 5 ? "주의군" : "정상";
                long userPosts = posts.searchMine(user.getId(), VISIBLE_STATUSES, null, null).size();
                return new RiskyUserResponse(UserResponse.from(user), userPosts, user.getReportCount(), label, tone);
            })
            .toList();
    }

    @Transactional(readOnly = true)
    public List<PostResponse> reportQueue(UserAccount currentUser) {
        return posts.findReportQueue(VISIBLE_STATUSES).stream()
            .filter(post -> post.getReportCount() > 0)
            .limit(10)
            .map(post -> toResponse(post, currentUser, false))
            .toList();
    }

    private Post findVisiblePost(Long postId) {
        Post post = posts.findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));
        if (!VISIBLE_STATUSES.contains(post.getStatus())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다.");
        }
        return post;
    }

    private PostResponse toResponse(Post post, UserAccount currentUser, boolean includeComments) {
        Long userId = currentUser == null ? null : currentUser.getId();
        boolean likedByMe = userId != null && postLikes.findByUserIdAndPostId(userId, post.getId()).isPresent();
        boolean scrappedByMe = userId != null && scraps.findByUserIdAndPostId(userId, post.getId()).isPresent();
        List<CommentResponse> commentResponses = includeComments
            ? comments.findByPostIdOrderByCreatedAtAsc(post.getId()).stream()
                .map(comment -> CommentResponse.from(
                    comment,
                    commentLikes.countByCommentId(comment.getId()),
                    userId != null && commentLikes.findByUserIdAndCommentId(userId, comment.getId()).isPresent()
                ))
                .toList()
            : List.of();
        return PostResponse.from(
            post,
            postLikes.countByPostId(post.getId()),
            comments.countByPostId(post.getId()),
            likedByMe,
            scrappedByMe,
            commentResponses
        );
    }

    private List<Post> requireUserScope(Long userId, java.util.function.Supplier<List<Post>> supplier) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return supplier.get();
    }
}
