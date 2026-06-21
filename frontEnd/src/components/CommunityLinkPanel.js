function CommunityLinkPanel() {
  return (
    // 좌측 하단: 데이터를 받지 않는 와이어프레임 영역이며, 페이지 이동 링크만 배치합니다.
    <nav className="panel community-link-panel" aria-label="커뮤니티 메뉴">
      <a href="/posts">게시글</a>
      <a href="/discussions">토론장</a>
    </nav>
  );
}

export default CommunityLinkPanel;
