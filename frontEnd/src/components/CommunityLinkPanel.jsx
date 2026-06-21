import { NavLink } from 'react-router-dom';

// 기능 단위: 카테고리 배너는 주요 커뮤니티 페이지 이동만 담당합니다.
function CommunityLinkPanel() {
  return (
    <nav className="panel community-link-panel" aria-label="커뮤니티 메뉴">
      <NavLink to="/discussions">토론장</NavLink>
      <NavLink to="/posts">게시판</NavLink>
    </nav>
  );
}

export default CommunityLinkPanel;
