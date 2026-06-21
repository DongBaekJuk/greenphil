// 기능 단위: 게시글 목록은 포맷 토글, 정렬, 페이지네이션, 목록 액션을 담당합니다.
function FeedSection({
  errorMessage,
  fallbackSort,
  feedMode,
  isLoading,
  page,
  posts,
  sortMode,
  totalPages,
  totalPosts,
  onFeedModeChange,
  onLike,
  onOpenPost,
  onPageChange,
  onReport,
  onSortChange,
}) {
  return (
    <section className="feed-section" aria-label="게시글 목록">
      <div className="section-heading feed-heading">
        <div>
          <p className="eyebrow">Board</p>
          <h2>게시글 목록</h2>
        </div>

        <div className="feed-controls">
          <div className="sort-tabs" aria-label="정렬 선택">
            <button type="button" className={sortMode === 'latest' ? 'active' : ''} onClick={() => onSortChange('latest')}>
              최신순
            </button>
            <button type="button" className={sortMode === 'popular' ? 'active' : ''} onClick={() => onSortChange('popular')}>
              인기순
            </button>
          </div>

          <div className="mode-pill" role="tablist" aria-label="글 유형 선택">
            <button
              type="button"
              className={feedMode === 'one_line' ? 'active' : ''}
              onClick={() => onFeedModeChange('one_line')}
            >
              한마디
            </button>
            <button
              type="button"
              className={feedMode === 'post' ? 'active' : ''}
              onClick={() => onFeedModeChange('post')}
            >
              게시글
            </button>
          </div>
        </div>
      </div>

      {fallbackSort && <p className="feed-notice">최근 2일 인기 글이 없어 최신순으로 표시합니다.</p>}
      {errorMessage && <p className="inline-error">{errorMessage}</p>}

      <div className="post-list" aria-busy={isLoading}>
        {isLoading ? (
          <p className="empty-state">게시글을 불러오는 중입니다.</p>
        ) : posts.length ? (
          posts.map((post) => (
            <article
              className={`post-card feed-card ${post.kind === 'post' ? 'dawn-post' : 'one-line-card'}`}
              key={post.id}
            >
              <div className="card-top-row">
                <span className="post-meta">
                  {post.author} · Lv.{post.level} · {post.createdAt}
                </span>
                {post.kind === 'one_line' && (
                  <button type="button" className="heart-button compact-heart" onClick={() => onLike(post.id)}>
                    ♥ {post.likes}
                  </button>
                )}
              </div>

              <button type="button" className="post-main" onClick={() => onOpenPost(post)}>
                {post.kind === 'post' && <strong>{post.title}</strong>}
                <p>{post.content}</p>
              </button>

              <div className="card-bottom-row">
                <button type="button" className="text-button report-button" onClick={() => onReport(post.id)}>
                  신고 {post.reports}
                </button>
                <button type="button" className="comment-chip" onClick={() => onOpenPost(post)}>
                  댓글 {post.commentCount}
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-state">표시할 게시글이 없습니다.</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} totalPosts={totalPosts} onPageChange={onPageChange} />
    </section>
  );
}

function Pagination({ page, totalPages, totalPosts, onPageChange }) {
  const pages = buildPageItems(page, totalPages);

  return (
    <nav className="pagination" aria-label="게시글 페이지">
      <span>총 {totalPosts}개</span>
      <div>
        {pages.map((item, index) =>
          item === 'ellipsis' ? (
            <span className="pagination-ellipsis" key={`ellipsis-${index}`}>
              …
            </span>
          ) : (
            <button
              type="button"
              className={item === page ? 'active' : ''}
              key={item}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}
      </div>
    </nav>
  );
}

function buildPageItems(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const end = Math.min(totalPages - 1, page + 3);
  const middle = Array.from({ length: Math.max(0, end - page + 1) }, (_, index) => page + index);
  const pages = [1];

  if (page > 2) {
    pages.push('ellipsis');
  }

  middle.forEach((item) => {
    if (item > 1 && item < totalPages) {
      pages.push(item);
    }
  });

  if (end < totalPages - 1) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);
  return pages;
}

export default FeedSection;
