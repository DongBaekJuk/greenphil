function ProfilePanel({ authProvider, posts, profileTab, onTabChange }) {
  const visibleActivity = profileTab === 'posts' ? posts.slice(0, 3) : posts.filter((post) => post.likes > 80);

  return (
    // 우측 영역: 로그인 사용자의 작성 글/하트 글 요약 목록입니다.
    <section className="panel profile-panel">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>내 활동</h2>
        </div>
        <span className="level-badge">Lv. {authProvider ? 2 : 0}</span>
      </div>
      <div className="tab-row">
        <button type="button" className={profileTab === 'posts' ? 'active' : ''} onClick={() => onTabChange('posts')}>
          작성 글
        </button>
        <button type="button" className={profileTab === 'liked' ? 'active' : ''} onClick={() => onTabChange('liked')}>
          하트 글
        </button>
      </div>
      <ul className="activity-list">
        {visibleActivity.map((post) => (
          <li key={post.id}>
            <span>{post.type === 'post' ? post.title : post.content}</span>
            <strong>♥ {post.likes}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ProfilePanel;
