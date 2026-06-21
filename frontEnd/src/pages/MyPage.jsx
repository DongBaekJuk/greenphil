import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listLikedPosts, listMyComments, listMyPosts } from '../services/communityRepository';

const SECTION_LABELS = {
  posts: '내가 쓴 글',
  comments: '내가 쓴 댓글',
  liked: '좋아요 누른 글',
};

// 기능 단위: 마이페이지는 내 정보와 활동 목록 세 가지를 라우트별로 보여줍니다.
function MyPage({ profile, sessionUser }) {
  const { section = 'overview' } = useParams();
  const [items, setItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setLoading] = useState(false);

  const activeSection = useMemo(() => (SECTION_LABELS[section] ? section : 'overview'), [section]);

  useEffect(() => {
    if (activeSection === 'overview') {
      setItems([]);
      return;
    }

    loadActivity();
  }, [activeSection, sessionUser?.id]);

  async function loadActivity() {
    setLoading(true);
    setErrorMessage('');
    try {
      const data =
        activeSection === 'posts'
          ? await listMyPosts({ user: sessionUser })
          : activeSection === 'comments'
            ? await listMyComments({ user: sessionUser })
            : await listLikedPosts({ user: sessionUser });
      setItems(data);
    } catch (error) {
      setErrorMessage(error.message || '내 활동 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  if (!sessionUser) {
    return (
      <section className="feed-section my-page" aria-label="내 정보">
        <div className="section-heading">
          <div>
            <p className="eyebrow">My Page</p>
            <h2>내 정보</h2>
          </div>
        </div>
        <p>로그인 후 내 정보를 확인할 수 있습니다.</p>
      </section>
    );
  }

  return (
    <section className="feed-section my-page" aria-label="내 정보">
      <div className="section-heading">
        <div>
          <p className="eyebrow">My Page</p>
          <h2>{activeSection === 'overview' ? '내 정보' : SECTION_LABELS[activeSection]}</h2>
        </div>
      </div>

      <div className="my-profile-summary">
        <div className="avatar large">{profile?.displayName?.slice(0, 1) || 'G'}</div>
        <div>
          <strong>{profile?.displayName || sessionUser.email}</strong>
          <span>{profile?.provider ? `${profile.provider} 로그인` : 'Supabase 로그인'}</span>
        </div>
      </div>

      <nav className="my-page-tabs" aria-label="내 정보 메뉴">
        <Link to="/me/posts">내가 쓴 글</Link>
        <Link to="/me/comments">내가 쓴 댓글</Link>
        <Link to="/me/liked">좋아요 누른 글</Link>
      </nav>

      {activeSection === 'overview' ? (
        <p className="empty-state">확인할 활동 항목을 선택하세요.</p>
      ) : (
        <ActivityList items={items} section={activeSection} isLoading={isLoading} errorMessage={errorMessage} />
      )}
    </section>
  );
}

function ActivityList({ errorMessage, isLoading, items, section }) {
  if (isLoading) return <p className="empty-state">불러오는 중입니다.</p>;
  if (errorMessage) return <p className="inline-error">{errorMessage}</p>;
  if (!items.length) return <p className="empty-state">표시할 항목이 없습니다.</p>;

  return (
    <ul className="my-activity-list">
      {items.map((item) => (
        <li key={`${section}-${item.id}`}>
          {section === 'comments' ? (
            <>
              <span>{item.content}</span>
              <strong>{item.post?.title || item.post?.content || '원 게시글'}</strong>
            </>
          ) : (
            <>
              <span>{item.kind === 'post' ? item.title : item.content}</span>
              <strong>♥ {item.likes}</strong>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export default MyPage;
