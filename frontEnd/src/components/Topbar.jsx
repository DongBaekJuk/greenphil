import { Link } from 'react-router-dom';

// 기능 단위: 로고는 게시판으로, 프로필 버튼은 내 정보 페이지로 이동합니다.
function Topbar() {
  return (
    <header className="topbar">
      <Link to="/posts" className="logo-mark" aria-label="GreenPhil 게시판으로 이동">
        GREENPHIL
      </Link>
      <Link to="/me" className="profile-trigger" aria-label="내 정보">
        <span className="profile-trigger-circle" />
      </Link>
    </header>
  );
}

export default Topbar;
