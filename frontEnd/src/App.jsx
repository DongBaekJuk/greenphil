import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import AuthPanel from './components/AuthPanel';
import CommunityLinkPanel from './components/CommunityLinkPanel';
import ProfilePanel from './components/ProfilePanel';
import Topbar from './components/Topbar';
import BoardPage from './pages/BoardPage';
import DiscussionPage from './pages/DiscussionPage';
import MyPage from './pages/MyPage';
import { ensureProfile } from './services/communityRepository';
import { supabase } from './supabase';

// 기능 단위: 앱 셸은 인증 상태와 공통 레이아웃을 관리하고, 실제 화면은 라우트별 페이지에 위임합니다.
function App() {
  const [sessionUser, setSessionUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authProvider, setAuthProvider] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSyncingUser, setSyncingUser] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;
      await applySession(session);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    loadSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function applySession(session) {
    const user = session?.user || null;
    setSessionUser(user);
    setAuthProvider(providerName(user));
    setAuthError('');

    if (!user) {
      setProfile(null);
      return;
    }

    setSyncingUser(true);
    try {
      setProfile(await ensureProfile(user));
    } catch (error) {
      setAuthError(error.message || '회원 정보 동기화에 실패했습니다.');
    } finally {
      setSyncingUser(false);
    }
  }

  // 기능 단위: Supabase OAuth 로그인은 Google과 Naver provider만 노출합니다.
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
    setProfile(null);
    setAuthProvider('');
  }

  const signedInUser = profile?.displayName || sessionUser?.user_metadata?.name || sessionUser?.email || '게스트';

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
            profile={profile}
            signedInUser={signedInUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
          <CommunityLinkPanel />
        </aside>

        <Routes>
          <Route path="/" element={<Navigate to="/posts" replace />} />
          <Route path="/posts" element={<BoardPage sessionUser={sessionUser} />} />
          <Route path="/discussions" element={<DiscussionPage />} />
          <Route path="/me" element={<MyPage profile={profile} sessionUser={sessionUser} />} />
          <Route path="/me/:section" element={<MyPage profile={profile} sessionUser={sessionUser} />} />
          <Route path="*" element={<Navigate to="/posts" replace />} />
        </Routes>

        <aside className="side-stack">
          <ProfilePanel authProvider={authProvider} profile={profile} />
        </aside>
      </main>
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
