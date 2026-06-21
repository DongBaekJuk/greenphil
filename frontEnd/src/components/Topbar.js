function Topbar() {
  return (
    // 최상단 영역: 서비스 로고와 원형 프로필 진입 버튼을 보여줍니다.
    <header className="topbar">
      <div className="logo-mark" aria-label="GreenPhil logo">
        GREENPHIL
      </div>
      <button type="button" className="profile-trigger" aria-label="프로필">
        <span className="profile-trigger-circle" />
      </button>
    </header>
  );
}

export default Topbar;
