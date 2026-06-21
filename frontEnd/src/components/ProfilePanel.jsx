import { NavLink } from 'react-router-dom';

// 기능 단위: 우측 패널은 내 정보 진입과 활동 목록 바로가기를 제공합니다.
function ProfilePanel({ authProvider, profile }) {
  return (
    <section className="panel profile-panel">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>내 정보</h2>
        </div>
        <span className="level-badge">Lv. {profile?.activityLevel || (authProvider ? 1 : 0)}</span>
      </div>
      <div className="tab-row stacked">
        <NavLink to="/me">마이페이지</NavLink>
        <NavLink to="/me/posts">내가 쓴 글</NavLink>
        <NavLink to="/me/comments">내가 쓴 댓글</NavLink>
        <NavLink to="/me/liked">좋아요 누른 글</NavLink>
      </div>
    </section>
  );
}

export default ProfilePanel;
