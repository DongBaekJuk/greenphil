import { useMemo, useState } from 'react';
import './App.css';

const animalFilters = ['🐰', '🐻', '🐶', '🐱', '🦊', '🐼'];
const blockedWords = ['욕설', '비속어', '나쁜말', '바보'];

const initialPosts = [
  {
    id: 1,
    type: 'short',
    author: '나린',
    level: 8,
    title: '오늘의 작은 위로',
    content: '물이 천천히 끓듯이 마음도 천천히 괜찮아진다.',
    likes: 128,
    comments: [
      { id: 101, author: '윤서', content: '오늘 필요한 말이었어요.', likes: 14 },
      { id: 102, author: '초록', content: '짧아서 더 오래 남네요.', likes: 9 },
    ],
    reports: 1,
    views: 2040,
    createdAt: '방금 전',
  },
  {
    id: 2,
    type: 'dawn',
    author: '서하',
    level: 15,
    title: '새벽 2시의 문장',
    content:
      '잠들지 못한 시간은 가끔 나를 심문하지만, 그 안에서도 내일로 넘어가는 작은 문은 있다. 오늘은 그 문 앞에 오래 앉아 있었다.',
    likes: 342,
    comments: [
      { id: 201, author: '은겸', content: '무게가 있는데 따뜻하네요.', likes: 31 },
    ],
    reports: 6,
    views: 1800,
    createdAt: '12분 전',
  },
  {
    id: 3,
    type: 'short',
    author: '로아',
    level: 4,
    title: '퇴근길',
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
  { name: '도윤', level: 3, reports: 18, posts: 5, liked: 16 },
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
  const [isDawnMode, setDawnMode] = useState(false);
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

  const signedInUser = authProvider ? '초록필' : '게스트';

  function handleLogin(provider) {
    setAuthProvider(provider);
  }

  function handleCreatePost(event) {
    event.preventDefault();

    if (!draft.title.trim() || !draft.content.trim()) return;

    const newPost = {
      id: Date.now(),
      type: isDawnMode ? 'dawn' : 'short',
      author: signedInUser,
      level: 1,
      title: filterText(draft.title.trim()),
      content: filterText(draft.content.trim()),
      likes: 0,
      comments: [],
      reports: 0,
      views: 1,
      createdAt: '지금',
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);
    setDraft({ title: '', content: '' });
    setDawnMode(false);
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
        <div>
          <p className="eyebrow">GreenPhil Community</p>
          <h1>가벼운 위로부터 새벽감성까지</h1>
        </div>
        <nav className="top-actions" aria-label="주요 메뉴">
          <button type="button" className="ghost-button">
            피드
          </button>
          <button type="button" className="ghost-button">
            프로필
          </button>
          <button type="button" className="primary-button" onClick={() => setComposerOpen(true)}>
            + 글쓰기
          </button>
        </nav>
      </header>

      <main className="layout-grid">
        <aside className="panel auth-panel">
          <div className="profile-card">
            <div className="avatar">{authProvider ? '초' : 'G'}</div>
            <div>
              <strong>{signedInUser}</strong>
              <span>{authProvider ? `${authProvider} 로그인` : '로그인이 필요합니다'}</span>
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
            <div className="mode-pill">
              <span>짧은글</span>
              <span>새벽감성</span>
            </div>
          </div>

          <div className="post-list">
            {posts.map((post) =>
              post.type === 'short' ? (
                <article className="post-card short-post" key={post.id}>
                  <button type="button" className="post-main" onClick={() => openPost(post)}>
                    <span className="post-meta">
                      {post.author} · Lv.{post.level} · {post.createdAt}
                    </span>
                    <strong>{post.title}</strong>
                    <p>{post.content}</p>
                  </button>
                  <button type="button" className="heart-button compact-heart" onClick={() => handleLike(post.id)}>
                    ♥ {post.likes}
                  </button>
                </article>
              ) : (
                <article className="post-card dawn-post" key={post.id}>
                  <div className="post-meta">
                    {post.author} · Lv.{post.level} · {post.createdAt}
                  </div>
                  <button type="button" className="dawn-open" onClick={() => openPost(post)}>
                    <span>새벽감성</span>
                    <strong>{post.title}</strong>
                    <p>{post.content}</p>
                  </button>
                  <div className="post-footer">
                    <button type="button" className="heart-button" onClick={() => handleLike(post.id)}>
                      ♥ {post.likes}
                    </button>
                    <button type="button" className="text-button" onClick={() => handleReport(post.id)}>
                      신고 {post.reports}
                    </button>
                  </div>
                </article>
              ),
            )}
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
                  <span>{post.title}</span>
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
                <span>기준은 널널하게, 위험군만 강화</span>
              </div>
              <div>
                <strong>거름망 List</strong>
                <span>조회수 대비 신고율로 후보 분류</span>
              </div>
            </div>

            <div className="risk-list">
              {users.map((user) => {
                const status = getRiskStatus(user.reports);
                return (
                  <div className="risk-item" key={user.name}>
                    <div>
                      <strong>{user.name}</strong>
                      <span>신고 {user.reports}회 · 글 {user.posts}개</span>
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
                  <span>{post.title}</span>
                  <em>{post.reportRate}%</em>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </main>

      {isComposerOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-card composer" onSubmit={handleCreatePost}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Write</p>
                <h2>새 글 작성</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setComposerOpen(false)} aria-label="닫기">
                ×
              </button>
            </div>

            <label>
              제목
              <input
                value={draft.title}
                onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, title: event.target.value }))}
                placeholder="한 문장으로 남겨보세요"
              />
            </label>

            <label>
              내용
              <textarea
                value={draft.content}
                onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, content: event.target.value }))}
                placeholder={
                  isDawnMode
                    ? '조금 더 깊고 오래 남는 문장으로 써보세요.'
                    : '가볍게, 한 줄에서 두 줄 정도로 충분합니다.'
                }
              />
            </label>

            <button
              type="button"
              className={`dawn-toggle ${isDawnMode ? 'active' : ''}`}
              onClick={() => setDawnMode((currentMode) => !currentMode)}
            >
              새벽감성 {isDawnMode ? 'ON' : 'OFF'}
            </button>

            <div className="modal-actions">
              <span>비속어는 랜덤 이모지로 자동 치환됩니다.</span>
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
                <h2>{selectedPost.title}</h2>
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
                placeholder="댓글을 작성하세요"
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
