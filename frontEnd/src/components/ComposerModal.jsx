// 기능 단위: 글 작성 모달은 한마디/게시글 포맷 전환과 입력값 제출을 담당합니다.
function ComposerModal({ draft, kind, onClose, onDraftChange, onKindChange, onSubmit }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal-card composer" onSubmit={onSubmit}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Write</p>
            <h2>{kind === 'one_line' ? '한마디 작성' : '게시글 작성'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <div className="mode-pill composer-mode" role="tablist" aria-label="작성 포맷 선택">
          <button type="button" className={kind === 'one_line' ? 'active' : ''} onClick={() => onKindChange('one_line')}>
            한마디
          </button>
          <button type="button" className={kind === 'post' ? 'active' : ''} onClick={() => onKindChange('post')}>
            게시글
          </button>
        </div>

        {kind === 'post' && (
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
          {kind === 'one_line' ? '한마디' : '내용'}
          <textarea
            value={draft.content}
            onChange={(event) => onDraftChange((currentDraft) => ({ ...currentDraft, content: event.target.value }))}
            placeholder={kind === 'one_line' ? '짧고 가볍게 한마디를 남겨보세요' : '게시글 내용을 작성해보세요'}
          />
        </label>

        <div className="modal-actions">
          <span>비속어는 순한 이름으로 자동 치환됩니다.</span>
          <div className="modal-action-buttons">
            <button type="button" className="ghost-button" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="primary-button">
              작성하기
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ComposerModal;
