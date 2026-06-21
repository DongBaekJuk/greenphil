import { useEffect, useMemo, useState } from 'react';
import ComposerModal from '../components/ComposerModal';
import FeedSection from '../components/FeedSection';
import PostDetailModal from '../components/PostDetailModal';
import {
  createComment,
  createPost,
  getPost,
  listPosts,
  reportPost,
  toggleCommentLike,
  togglePostLike,
} from '../services/communityRepository';

const PAGE_SIZE = 20;

// 기능 단위: 게시판은 목록 조회, 정렬, 페이지 이동, 작성, 상세 팝업을 한 화면에서 조율합니다.
function BoardPage({ sessionUser }) {
  const [posts, setPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [feedMode, setFeedMode] = useState('one_line');
  const [composeKind, setComposeKind] = useState('one_line');
  const [sortMode, setSortMode] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [usedFallbackSort, setUsedFallbackSort] = useState(false);
  const [draft, setDraft] = useState({ title: '', content: '' });
  const [commentDrafts, setCommentDrafts] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalPosts / PAGE_SIZE)), [totalPosts]);

  useEffect(() => {
    loadPosts();
  }, [feedMode, sortMode, page]);

  async function loadPosts({ nextFeedMode = feedMode, nextSortMode = sortMode, nextPage = page } = {}) {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await listPosts({ kind: nextFeedMode, sort: nextSortMode, page: nextPage, pageSize: PAGE_SIZE });
      setPosts(result.posts);
      setTotalPosts(result.total);
      setUsedFallbackSort(result.fallbackSort);
    } catch (error) {
      setErrorMessage(error.message || '게시글 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleFeedModeChange(nextMode) {
    setFeedMode(nextMode);
    setComposeKind(nextMode);
    setPage(1);
  }

  function handleSortChange(nextSort) {
    setSortMode(nextSort);
    setPage(1);
  }

  async function openPost(post) {
    setErrorMessage('');
    try {
      const detail = await getPost(post.id);
      setActivePost(detail);
    } catch (error) {
      setErrorMessage(error.message || '게시글을 불러오지 못했습니다.');
    }
  }

  async function handleCreatePost(event) {
    event.preventDefault();
    if (!draft.content.trim()) return;
    if (composeKind === 'post' && !draft.title.trim()) return;

    try {
      await createPost({
        user: sessionUser,
        kind: composeKind,
        title: draft.title,
        content: draft.content,
      });
      setDraft({ title: '', content: '' });
      setComposerOpen(false);
      setFeedMode(composeKind);
      setPage(1);
      await loadPosts({ nextFeedMode: composeKind, nextPage: 1 });
    } catch (error) {
      setErrorMessage(error.message || '글을 저장하지 못했습니다.');
    }
  }

  async function handleLike(postId) {
    try {
      await togglePostLike({ user: sessionUser, postId });
      await refreshAfterMutation(postId);
    } catch (error) {
      setErrorMessage(error.message || '좋아요를 반영하지 못했습니다.');
    }
  }

  async function handleCommentLike(postId, commentId) {
    try {
      await toggleCommentLike({ user: sessionUser, commentId });
      await refreshAfterMutation(postId);
    } catch (error) {
      setErrorMessage(error.message || '댓글 좋아요를 반영하지 못했습니다.');
    }
  }

  async function handleReport(postId) {
    try {
      await reportPost({ user: sessionUser, postId });
      await refreshAfterMutation(postId);
    } catch (error) {
      setErrorMessage(error.message || '신고를 저장하지 못했습니다.');
    }
  }

  async function handleCreateComment(event, postId) {
    event.preventDefault();
    const content = commentDrafts[postId]?.trim();
    if (!content) return;

    try {
      await createComment({ user: sessionUser, postId, content });
      setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [postId]: '' }));
      await refreshAfterMutation(postId);
    } catch (error) {
      setErrorMessage(error.message || '댓글을 저장하지 못했습니다.');
    }
  }

  async function refreshAfterMutation(postId) {
    await loadPosts();
    if (activePost?.id === postId) {
      setActivePost(await getPost(postId));
    }
  }

  return (
    <>
      <FeedSection
        errorMessage={errorMessage}
        fallbackSort={usedFallbackSort}
        feedMode={feedMode}
        isLoading={isLoading}
        page={page}
        pageSize={PAGE_SIZE}
        posts={posts}
        sortMode={sortMode}
        totalPages={totalPages}
        totalPosts={totalPosts}
        onFeedModeChange={handleFeedModeChange}
        onLike={handleLike}
        onOpenPost={openPost}
        onPageChange={setPage}
        onReport={handleReport}
        onSortChange={handleSortChange}
      />

      <button
        type="button"
        className="fab-compose"
        onClick={() => {
          setComposeKind(feedMode);
          setComposerOpen(true);
        }}
        aria-label="작성"
      >
        ✎
      </button>

      {isComposerOpen && (
        <ComposerModal
          draft={draft}
          kind={composeKind}
          onClose={() => setComposerOpen(false)}
          onDraftChange={setDraft}
          onKindChange={setComposeKind}
          onSubmit={handleCreatePost}
        />
      )}

      {activePost && (
        <PostDetailModal
          commentDrafts={commentDrafts}
          post={activePost}
          onClose={() => setActivePost(null)}
          onCommentDraftChange={setCommentDrafts}
          onCommentLike={handleCommentLike}
          onCreateComment={handleCreateComment}
          onLike={handleLike}
          onReport={handleReport}
        />
      )}
    </>
  );
}

export default BoardPage;
