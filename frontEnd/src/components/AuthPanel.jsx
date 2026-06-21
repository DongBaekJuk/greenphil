// 기능 단위: 소셜 로그인 상태와 Supabase 프로필 동기화 상태를 표시합니다.
function AuthPanel({ authError, authProvider, isLoggedIn, isSyncingUser, profile, signedInUser, onLogin, onLogout }) {
  return (
    // 좌측 상단: Supabase OAuth 로그인 상태와 서버 회원 동기화 상태를 보여주는 패널입니다.
    <section className="panel auth-panel">
      <div className="profile-card">
        <div className="avatar">{profile?.displayName?.slice(0, 1) || (authProvider ? '초' : 'G')}</div>
        <div>
          <strong>{signedInUser}</strong>
          <span>{authProvider ? `${authProvider}로 로그인됨` : '로그인이 필요합니다'}</span>
        </div>
      </div>

      <div className="auth-buttons" aria-label="소셜 로그인">
        {isLoggedIn ? (
          <button type="button" onClick={onLogout}>
            로그아웃
          </button>
        ) : (
          <>
            <button type="button" onClick={() => onLogin('Google')}>
              Google
            </button>
            <button type="button" onClick={() => onLogin('Naver')}>
              Naver
            </button>
          </>
        )}
      </div>

      {isSyncingUser && <p className="auth-message">회원 정보를 동기화하는 중입니다.</p>}
      {authError && <p className="auth-message error">{authError}</p>}

      <div className="mini-stats">
        <div>
          <span>활동 레벨</span>
          <strong>Lv. {profile?.activityLevel || (authProvider ? 1 : 0)}</strong>
        </div>
        <div>
          <span>로그인</span>
          <strong>{isLoggedIn ? '완료' : '대기'}</strong>
        </div>
        <div>
          <span>신고 누적</span>
          <strong>{profile?.reportCount || 0}</strong>
        </div>
      </div>
    </section>
  );
}

export default AuthPanel;
