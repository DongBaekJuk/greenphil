function PostDetailModal({
  commentDrafts,
  post,
  onClose,
  onCommentDraftChange,
  onCommentLike,
  onCreateComment,
  onLike,
  onReport,
}) {
  return (
    // 중앙 모달: 게시글 상세 내용과 댓글 작성/좋아요 동작을 담당합니다.
    <div className="modal-backdrop" role="presentation">
      <article className="modal-card detail-card">
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {post.author} · Lv.{post.level}
            </p>
            {post.type === 'post' ? <h2>{post.title}</h2> : <h2>한마디</h2>}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>
        <p className="detail-content">{post.content}</p>
        <div className="post-footer">
          <button type="button" className="heart-button" onClick={() => onLike(post.id)}>
            ♥ {post.likes}
          </button>
          <button type="button" className="text-button" onClick={() => onReport(post.id)}>
            신고 {post.reports}
          </button>
        </div>

        <div className="comment-list">
          {post.comments.map((comment) => (
            <div className="comment-item" key={comment.id}>
              <div>
                <strong>{comment.author}</strong>
                <p>{comment.content}</p>
              </div>
              <button type="button" onClick={() => onCommentLike(post.id, comment.id)}>
                ♥ {comment.likes}
              </button>
            </div>
          ))}
        </div>

        <form className="comment-form" onSubmit={(event) => onCreateComment(event, post.id)}>
          <input
            value={commentDrafts[post.id] || ''}
            onChange={(event) =>
              onCommentDraftChange((currentDrafts) => ({
                ...currentDrafts,
                [post.id]: event.target.value,
              }))
            }
            placeholder="댓글을 작성해보세요"
          />
          <button type="submit">등록</button>
        </form>
      </article>
    </div>
  );
}

export default PostDetailModal;
