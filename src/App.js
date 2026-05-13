import { useMemo, useState } from 'react';
import './App.css';

const animalFilters = ['다람쥐', '고래', '올빼미', '수달', '고양이', '판다'];
const blockedWords = ['멍청이', '비속어', '욕설', '바보'];

const initialPosts = [
  {
    id: 1,
    type: 'oneLine',
    author: '나린',
    level: 8,
    title: '',
    content: '물이 천천히 끓듯이 마음도 천천히 괜찮아진다.',
    likes: 128,
    comments: [
      { id: 101, author: '서윤', content: '오늘 꼭 필요한 말이었어요.', likes: 14 },
      { id: 102, author: '초록', content: '진짜 한 줄에 힘이 있네요.', likes: 9 },
    ],
    reports: 1,
    views: 2040,
    createdAt: '방금 전',
  },
  {
    id: 2,
    type: 'post',
    author: '서하',
    level: 15,
    title: '새벽 2시의 문장',
    content:
      '잠들지 못한 시간은 가끔 나를 심문하지만, 그 안에서도 내일로 넘어가는 작은 문은 있다. 오늘은 그 문 앞에 오래 앉아 있었다.',
    likes: 342,
    comments: [{ id: 201, author: '태경', content: '문장이 깊고 오래 남아요.', likes: 31 }],
    reports: 6,
    views: 1800,
    createdAt: '12분 전',
  },
  {
    id: 3,
    type: 'oneLine',
    author: '로아',
    level: 4,
    title: '',
    content: '오늘도 버텼다면 이미 충분히 잘한 사람.',
    likes: 87,
    comments: [],
    reports: 0,
    views: 920,
    createdAt: '31분 전',
  },
];

const users = [
  { name: '나린', level: 8, reports: 1, posts: 12, liked: 44 },
  { name: '서하', level: 15, reports: 6, posts: 38, liked: 109 },
  { name: '시윤', level: 3, reports: 18, posts: 5, liked: 16 },
];

function filterText(text) {
  return blockedWords.reduce((filteredText, word) => {
    const pattern = new RegExp(word, 'gi');
    return filteredText.replace(pattern, () => animalFilters[Math.floor(Math.random() * animalFilters.length)]);
  }, text);
}

function getRiskStatus(reports) {
  if (reports >= 12) return { label: '위험군', tone: 'danger' };
  if (reports >= 5) return { label: '주의군', tone: 'warning' };
  return { label: '정상', tone: 'safe' };
}

function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [activePost, setActivePost] = useState(null);
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [feedMode, setFeedMode] = useState('oneLine');
  const [draft, setDraft] = useState({ title: '', content: '' });
  const [commentDrafts, setCommentDrafts] = useState({});
  const [authProvider, setAuthProvider] = useState('');
  const [profileTab, setProfileTab] = useState('posts');

  const reportQueue = useMemo(
    () =>
      posts
        .map((post) => ({
          ...post,
          reportRate: Math.round((post.reports / Math.max(post.views, 1)) * 10000) / 100,
        }))
        .sort((first, second) => second.reportRate - first.reportRate),
    [posts],
  );

  const visiblePosts = useMemo(() => posts.filter((post) => post.type === feedMode), [feedMode, posts]);
  const signedInUser = authProvider ? '초록별' : '게스트';

  function handleLogin(provider) {
    setAuthProvider(provider);
  }

  function handleCreatePost(event) {
    event.preventDefault();

    if (!draft.content.trim()) return;
    if (feedMode === 'post' && !draft.title.trim()) return;

    const newPost = {
      id: Date.now(),
      type: feedMode,
      author: signedInUser,
      level: 1,
      title: feedMode === 'post' ? filterText(draft.title.trim()) : '',
      content: filterText(draft.content.trim()),
      likes: 0,
      comments: [],
      reports: 0,
      views: 1,
      createdAt: '지금',
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);
    setDraft({ title: '', content: '' });
    setComposerOpen(false);
  }

  function handleLike(postId) {
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)),
    );
  }

  function handleCommentLike(postId, commentId) {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment,
              ),
            }
          : post,
      ),
    );
  }

  function handleReport(postId) {
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post.id === postId ? { ...post, reports: post.reports + 1 } : post)),
    );
  }

  function handleCreateComment(event, postId) {
    event.preventDefault();
    const content = commentDrafts[postId]?.trim();

    if (!content) return;

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: Date.now(),
                  author: signedInUser,
                  content: filterText(content),
                  likes: 0,
                },
              ],
            }
          : post,
      ),
    );
    setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [postId]: '' }));
  }

  function openPost(post) {
    setActivePost(post);
  }

  const selectedPost = activePost ? posts.find((post) => post.id === activePost.id) : null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="logo-mark" aria-label="GreenPhil logo">
          GREENPHIL
        </div>
        <button type="button" className="profile-trigger" aria-label="프로필">
          <span className="profile-trigger-circle" />
        </button>
      </header>

      <main className="layout-grid">
        <aside className="panel auth-panel">
          <div className="profile-card">
            <div className="avatar">{authProvider ? '초' : 'G'}</div>
            <div>
              <strong>{signedInUser}</strong>
              <span>{authProvider ? `${authProvider}로 로그인됨` : '로그인이 필요합니다'}</span>
            </div>
          </div>

          <div className="auth-buttons" aria-label="소셜 로그인">
            <button type="button" onClick={() => handleLogin('Google')}>
              Google
            </button>
            <button type="button" onClick={() => handleLogin('Naver')}>
              Naver
            </button>
          </div>

          <div className="mini-stats">
            <div>
              <span>활동 레벨</span>
              <strong>Lv. {authProvider ? 2 : 0}</strong>
            </div>
            <div>
              <span>작성 글</span>
              <strong>{authProvider ? 1 : 0}</strong>
            </div>
            <div>
              <span>누른 하트</span>
              <strong>{authProvider ? 7 : 0}</strong>
            </div>
          </div>
        </aside>

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
                onClick={() => setFeedMode('oneLine')}
              >
                한마디
              </button>
              <button
                type="button"
                className={feedMode === 'post' ? 'active' : ''}
                onClick={() => setFeedMode('post')}
              >
                게시글
              </button>
            </div>
          </div>

          <div className="post-list">
            {visiblePosts.map((post) => (
              <article className={`post-card feed-card ${post.type === 'post' ? 'dawn-post' : 'one-line-card'}`} key={post.id}>
                <div className="card-top-row">
                  <span className="post-meta">
                    {post.author} · Lv.{post.level} · {post.createdAt}
                  </span>
                  <button type="button" className="heart-button compact-heart" onClick={() => handleLike(post.id)}>
                    ♥ {post.likes}
                  </button>
                </div>

                <button type="button" className="post-main" onClick={() => openPost(post)}>
                  {post.type === 'post' && <strong>{post.title}</strong>}
                  <p>{post.content}</p>
                </button>

                <div className="card-bottom-row">
                  {post.type === 'post' ? (
                    <button type="button" className="text-button report-button" onClick={() => handleReport(post.id)}>
                      신고 {post.reports}
                    </button>
                  ) : (
                    <span />
                  )}
                  <button type="button" className="comment-chip" onClick={() => openPost(post)}>
                    댓글 {post.comments.length}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="side-stack">
          <section className="panel profile-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Profile</p>
                <h2>내 활동</h2>
              </div>
              <span className="level-badge">Lv. {authProvider ? 2 : 0}</span>
            </div>
            <div className="tab-row">
              <button
                type="button"
                className={profileTab === 'posts' ? 'active' : ''}
                onClick={() => setProfileTab('posts')}
              >
                작성 글
              </button>
              <button
                type="button"
                className={profileTab === 'liked' ? 'active' : ''}
                onClick={() => setProfileTab('liked')}
              >
                하트 글
              </button>
            </div>
            <ul className="activity-list">
              {(profileTab === 'posts' ? posts.slice(0, 3) : posts.filter((post) => post.likes > 80)).map((post) => (
                <li key={post.id}>
                  <span>{post.type === 'post' ? post.title : post.content}</span>
                  <strong>♥ {post.likes}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel moderation-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">AI Moderation</p>
                <h2>신고/필터링</h2>
              </div>
            </div>

            <div className="filter-summary">
              <div>
                <strong>1차 AI 필터</strong>
                <span>기본 톤은 부드럽게, 위험 표현만 강화합니다.</span>
              </div>
              <div>
                <strong>걸러짐 단어 List</strong>
                <span>조회 시 비유적인 동물 이름으로 자동 치환됩니다.</span>
              </div>
            </div>

            <div className="risk-list">
              {users.map((user) => {
                const status = getRiskStatus(user.reports);
                return (
                  <div className="risk-item" key={user.name}>
                    <div>
                      <strong>{user.name}</strong>
                      <span>
                        신고 {user.reports}건 · 글 {user.posts}개
                      </span>
                    </div>
                    <span className={`status-badge ${status.tone}`}>{status.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="report-queue">
              <strong>검토 우선 게시물</strong>
              {reportQueue.slice(0, 2).map((post) => (
                <button type="button" key={post.id} onClick={() => openPost(post)}>
                  <span>{post.type === 'post' ? post.title : post.content}</span>
                  <em>{post.reportRate}%</em>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </main>

      <button type="button" className="fab-compose" onClick={() => setComposerOpen(true)} aria-label="작성">
        ✎
      </button>

      {isComposerOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-card composer" onSubmit={handleCreatePost}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Write</p>
                <h2>{feedMode === 'oneLine' ? '한마디 작성' : '게시글 작성'}</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setComposerOpen(false)} aria-label="닫기">
                ×
              </button>
            </div>

            {feedMode === 'post' && (
              <label>
                제목
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, title: event.target.value }))}
                  placeholder="게시글 제목을 입력해보세요"
                />
              </label>
            )}

            <label>
              {feedMode === 'oneLine' ? '한마디' : '내용'}
              <textarea
                value={draft.content}
                onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, content: event.target.value }))}
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
      )}

      {selectedPost && (
        <div className="modal-backdrop" role="presentation">
          <article className="modal-card detail-card">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {selectedPost.author} · Lv.{selectedPost.level}
                </p>
                {selectedPost.type === 'post' ? <h2>{selectedPost.title}</h2> : <h2>한마디</h2>}
              </div>
              <button type="button" className="icon-button" onClick={() => setActivePost(null)} aria-label="닫기">
                ×
              </button>
            </div>
            <p className="detail-content">{selectedPost.content}</p>
            <div className="post-footer">
              <button type="button" className="heart-button" onClick={() => handleLike(selectedPost.id)}>
                ♥ {selectedPost.likes}
              </button>
              <button type="button" className="text-button" onClick={() => handleReport(selectedPost.id)}>
                신고 {selectedPost.reports}
              </button>
            </div>

            <div className="comment-list">
              {selectedPost.comments.map((comment) => (
                <div className="comment-item" key={comment.id}>
                  <div>
                    <strong>{comment.author}</strong>
                    <p>{comment.content}</p>
                  </div>
                  <button type="button" onClick={() => handleCommentLike(selectedPost.id, comment.id)}>
                    ♥ {comment.likes}
                  </button>
                </div>
              ))}
            </div>

            <form className="comment-form" onSubmit={(event) => handleCreateComment(event, selectedPost.id)}>
              <input
                value={commentDrafts[selectedPost.id] || ''}
                onChange={(event) =>
                  setCommentDrafts((currentDrafts) => ({
                    ...currentDrafts,
                    [selectedPost.id]: event.target.value,
                  }))
                }
                placeholder="댓글을 작성해보세요"
              />
              <button type="submit">등록</button>
            </form>
          </article>
        </div>
      )}
    </div>
  );
}

export default App;
