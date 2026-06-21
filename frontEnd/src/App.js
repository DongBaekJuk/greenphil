import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { api } from './api';
import AuthPanel from './components/AuthPanel';
import CommunityLinkPanel from './components/CommunityLinkPanel';
import ComposerModal from './components/ComposerModal';
import FeedSection from './components/FeedSection';
import PostDetailModal from './components/PostDetailModal';
import ProfilePanel from './components/ProfilePanel';
import Topbar from './components/Topbar';
import { animalFilters, blockedWords, initialPosts } from './data/communitySeed';
import { supabase } from './supabase';

function filterText(text) {
  return blockedWords.reduce((filteredText, word) => {
    const pattern = new RegExp(word, 'gi');
    return filteredText.replace(pattern, () => animalFilters[Math.floor(Math.random() * animalFilters.length)]);
  }, text);
}

function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [activePost, setActivePost] = useState(null);
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [feedMode, setFeedMode] = useState('oneLine');
  const [draft, setDraft] = useState({ title: '', content: '' });
  const [commentDrafts, setCommentDrafts] = useState({});
  const [sessionUser, setSessionUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [authProvider, setAuthProvider] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSyncingUser, setSyncingUser] = useState(false);
  const [profileTab, setProfileTab] = useState('posts');

  const visiblePosts = useMemo(() => posts.filter((post) => post.type === feedMode), [feedMode, posts]);
  const signedInUser = backendUser?.displayName || sessionUser?.user_metadata?.name || sessionUser?.email || '게스트';
  const selectedPost = activePost ? posts.find((post) => post.id === activePost.id) : null;

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;
      applySession(session);
      if (session) {
        syncBackendUser();
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
      if (session) {
        syncBackendUser();
      } else {
        setBackendUser(null);
      }
    });

    loadSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function applySession(session) {
    const user = session?.user || null;
    setSessionUser(user);
    setAuthProvider(providerName(user));
    setAuthError('');
  }

  async function syncBackendUser() {
    setSyncingUser(true);
    try {
      const user = await api.me();
      setBackendUser(user);
      setAuthError('');
    } catch (error) {
      setAuthError('로그인은 완료됐지만 서버 회원 정보 동기화에 실패했습니다. 백엔드 JWT issuer 설정을 확인해주세요.');
    } finally {
      setSyncingUser(false);
    }
  }

  async function handleLogin(provider) {
    setAuthError('');
    const providerId = provider === 'Naver' ? 'custom:naver' : 'google';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: providerId,
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setAuthError(error.message);
    }
  }

  async function handleLogout() {
    setAuthError('');
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
      return;
    }
    setSessionUser(null);
    setBackendUser(null);
    setAuthProvider('');
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

  return (
    <div className="app-shell">
      <Topbar />

      <main className="layout-grid">
        <aside className="left-stack">
          <AuthPanel
            authError={authError}
            authProvider={authProvider}
            isLoggedIn={Boolean(sessionUser)}
            isSyncingUser={isSyncingUser}
            signedInUser={signedInUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
          <CommunityLinkPanel />
        </aside>

        <FeedSection
          feedMode={feedMode}
          posts={visiblePosts}
          onFeedModeChange={setFeedMode}
          onLike={handleLike}
          onOpenPost={openPost}
          onReport={handleReport}
        />

        <aside className="side-stack">
          <ProfilePanel authProvider={authProvider} posts={posts} profileTab={profileTab} onTabChange={setProfileTab} />
        </aside>
      </main>

      <button type="button" className="fab-compose" onClick={() => setComposerOpen(true)} aria-label="작성">
        ✎
      </button>

      {isComposerOpen && (
        <ComposerModal
          draft={draft}
          feedMode={feedMode}
          onClose={() => setComposerOpen(false)}
          onDraftChange={setDraft}
          onSubmit={handleCreatePost}
        />
      )}

      {selectedPost && (
        <PostDetailModal
          commentDrafts={commentDrafts}
          post={selectedPost}
          onClose={() => setActivePost(null)}
          onCommentDraftChange={setCommentDrafts}
          onCommentLike={handleCommentLike}
          onCreateComment={handleCreateComment}
          onLike={handleLike}
          onReport={handleReport}
        />
      )}
    </div>
  );
}

export default App;

function providerName(user) {
  const provider = user?.app_metadata?.provider;
  if (provider === 'google') return 'Google';
  if (provider === 'custom:naver' || provider === 'naver') return 'Naver';
  return provider || '';
}
