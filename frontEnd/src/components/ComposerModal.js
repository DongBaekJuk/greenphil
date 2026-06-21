function ComposerModal({ draft, feedMode, onClose, onDraftChange, onSubmit }) {
  return (
    // 중앙 모달: 플로팅 작성 버튼을 누르면 열리는 글쓰기 폼입니다.
    <div className="modal-backdrop" role="presentation">
      <form className="modal-card composer" onSubmit={onSubmit}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Write</p>
            <h2>{feedMode === 'oneLine' ? '한마디 작성' : '게시글 작성'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        {feedMode === 'post' && (
          <label>
            제목
            <input
              value={draft.title}
              onChange={(event) => onDraftChange((currentDraft) => ({ ...currentDraft, title: event.target.value }))}
              placeholder="게시글 제목을 입력해보세요"
            />
          </label>
        )}

        <label>
          {feedMode === 'oneLine' ? '한마디' : '내용'}
          <textarea
            value={draft.content}
            onChange={(event) => onDraftChange((currentDraft) => ({ ...currentDraft, content: event.target.value }))}
            placeholder={
              feedMode === 'oneLine'
                ? '짧고 가볍게 한마디를 남겨보세요'
                : '조금 더 긴 호흡의 게시글을 작성해보세요'
            }
          />
        </label>

        <div className="modal-actions">
          <span>비속어는 순한 동물 이름으로 자동 치환됩니다.</span>
          <button type="submit" className="primary-button">
            등록
          </button>
        </div>
      </form>
    </div>
  );
}

export default ComposerModal;
