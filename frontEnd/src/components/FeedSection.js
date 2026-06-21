function FeedSection({ feedMode, posts, onFeedModeChange, onLike, onOpenPost, onReport }) {
  return (
    // 가운데 영역: 현재 선택된 글 유형에 맞춰 게시글 카드를 렌더링합니다.
    <section className="feed-section" aria-label="게시글 목록">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Live Feed</p>
          <h2>게시글 목록</h2>
        </div>
        <div className="mode-pill" role="tablist" aria-label="글 유형 선택">
          <button
            type="button"
            className={feedMode === 'oneLine' ? 'active' : ''}
            onClick={() => onFeedModeChange('oneLine')}
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

      <div className="post-list">
        {posts.map((post) => (
          <article className={`post-card feed-card ${post.type === 'post' ? 'dawn-post' : 'one-line-card'}`} key={post.id}>
            <div className="card-top-row">
              <span className="post-meta">
                {post.author} · Lv.{post.level} · {post.createdAt}
              </span>
              <button type="button" className="heart-button compact-heart" onClick={() => onLike(post.id)}>
                ♥ {post.likes}
              </button>
            </div>

            <button type="button" className="post-main" onClick={() => onOpenPost(post)}>
              {post.type === 'post' && <strong>{post.title}</strong>}
              <p>{post.content}</p>
            </button>

            <div className="card-bottom-row">
              {post.type === 'post' ? (
                <button type="button" className="text-button report-button" onClick={() => onReport(post.id)}>
                  신고 {post.reports}
                </button>
              ) : (
                <span />
              )}
              <button type="button" className="comment-chip" onClick={() => onOpenPost(post)}>
                댓글 {post.comments.length}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeedSection;
