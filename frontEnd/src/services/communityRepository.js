import { animalFilters, blockedWords } from '../data/communitySeed';
import { supabase } from '../supabase';

const POST_SELECT = `
  id,
  author_id,
  kind,
  title,
  content,
  filtered_content,
  like_count,
  comment_count,
  report_count,
  view_count,
  status,
  created_at,
  profiles:author_id (
    id,
    display_name,
    avatar_url,
    activity_level
  )
`;

const COMMENT_SELECT = `
  id,
  post_id,
  author_id,
  content,
  filtered_content,
  like_count,
  report_count,
  status,
  created_at,
  profiles:author_id (
    id,
    display_name,
    avatar_url,
    activity_level
  )
`;

// 기능 단위: Supabase 사용자 정보를 화면용 profiles row와 동기화합니다.
export async function ensureProfile(user) {
  if (!user) return null;

  const metadata = user.user_metadata || {};
  const appMetadata = user.app_metadata || {};
  const displayName =
    metadata.name || metadata.full_name || metadata.nickname || user.email?.split('@')[0] || 'GreenPhil user';

  const payload = {
    id: user.id,
    display_name: displayName,
    avatar_url: metadata.avatar_url || metadata.picture || null,
    provider: appMetadata.provider || null,
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return mapProfile(data);
}

// 기능 단위: 게시글 목록을 포맷, 정렬, 페이지 기준으로 조회합니다.
export async function listPosts({ kind = 'one_line', sort = 'latest', page = 1, pageSize = 20 } = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (sort === 'popular') {
    const since = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const popular = await runPostListQuery({ kind, from, to, since, sort });

    if (popular.total > 0) {
      return { ...popular, fallbackSort: false };
    }
  }

  const latest = await runPostListQuery({ kind, from, to, sort: 'latest' });
  return { ...latest, fallbackSort: sort === 'popular' };
}

async function runPostListQuery({ kind, from, to, since, sort }) {
  let query = supabase
    .from('posts')
    .select(POST_SELECT, { count: 'exact' })
    .eq('kind', kind)
    .in('status', ['active', 'review']);

  if (since) {
    query = query.gte('created_at', since);
  }

  query =
    sort === 'popular'
      ? query.order('like_count', { ascending: false }).order('created_at', { ascending: false })
      : query.order('created_at', { ascending: false });

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return {
    posts: (data || []).map(mapPost),
    total: count || 0,
  };
}

// 기능 단위: 상세 팝업은 게시글 본문과 댓글을 함께 조회합니다.
export async function getPost(postId) {
  const { data: post, error } = await supabase.from('posts').select(POST_SELECT).eq('id', postId).single();
  if (error) throw error;

  const { data: comments, error: commentError } = await supabase
    .from('comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .in('status', ['active', 'review'])
    .order('created_at', { ascending: true });

  if (commentError) throw commentError;
  return { ...mapPost(post), comments: (comments || []).map(mapComment) };
}

// 기능 단위: 글 작성은 한마디와 게시글을 kind로 나눠 같은 저장 흐름을 사용합니다.
export async function createPost({ user, kind, title, content }) {
  const profile = await ensureProfile(user);
  if (!profile) throw new Error('로그인이 필요합니다.');

  const cleanedContent = content.trim();
  const cleanedTitle = kind === 'post' ? title.trim() : null;
  const payload = {
    author_id: profile.id,
    kind,
    title: cleanedTitle,
    content: cleanedContent,
    filtered_content: filterText(cleanedContent),
  };

  const { data, error } = await supabase.from('posts').insert(payload).select(POST_SELECT).single();
  if (error) throw error;
  return mapPost(data);
}

// 기능 단위: 댓글 작성은 상세 팝업에서 호출되고 DB count 트리거가 목록 숫자를 갱신합니다.
export async function createComment({ user, postId, content }) {
  const profile = await ensureProfile(user);
  if (!profile) throw new Error('로그인이 필요합니다.');

  const cleanedContent = content.trim();
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: profile.id,
      content: cleanedContent,
      filtered_content: filterText(cleanedContent),
    })
    .select(COMMENT_SELECT)
    .single();

  if (error) throw error;
  return mapComment(data);
}

// 기능 단위: 좋아요는 이미 누른 기록이 있으면 삭제하고, 없으면 생성합니다.
export async function togglePostLike({ user, postId }) {
  const profile = await ensureProfile(user);
  if (!profile) throw new Error('로그인이 필요합니다.');

  const { data: existing, error: readError } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', profile.id)
    .maybeSingle();

  if (readError) throw readError;

  if (existing) {
    const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', profile.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: profile.id });
  if (error) throw error;
  return true;
}

export async function toggleCommentLike({ user, commentId }) {
  const profile = await ensureProfile(user);
  if (!profile) throw new Error('로그인이 필요합니다.');

  const { data: existing, error: readError } = await supabase
    .from('comment_likes')
    .select('comment_id')
    .eq('comment_id', commentId)
    .eq('user_id', profile.id)
    .maybeSingle();

  if (readError) throw readError;

  if (existing) {
    const { error } = await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', profile.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: profile.id });
  if (error) throw error;
  return true;
}

// 기능 단위: 신고 데이터는 삭제하지 않고 누적해 추후 학습 데이터 후보로 남깁니다.
export async function reportPost({ user, postId, reason = 'Inappropriate content' }) {
  const profile = await ensureProfile(user);
  if (!profile) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('reports')
    .insert({ reporter_id: profile.id, target_type: 'post', target_id: postId, reason });

  if (error && error.code !== '23505') throw error;
}

// 기능 단위: 마이페이지의 내가 쓴 글, 내가 쓴 댓글, 좋아요 누른 글을 각각 조회합니다.
export async function listMyPosts({ user, pageSize = 20 } = {}) {
  const profile = await ensureProfile(user);
  if (!profile) return [];

  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(pageSize);

  if (error) throw error;
  return (data || []).map(mapPost);
}

export async function listMyComments({ user, pageSize = 20 } = {}) {
  const profile = await ensureProfile(user);
  if (!profile) return [];

  const { data, error } = await supabase
    .from('comments')
    .select(
      `
      ${COMMENT_SELECT},
      posts:post_id (
        id,
        kind,
        title,
        filtered_content
      )
    `,
    )
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(pageSize);

  if (error) throw error;
  return (data || []).map((comment) => ({
    ...mapComment(comment),
    post: {
      id: comment.posts?.id,
      kind: comment.posts?.kind,
      title: comment.posts?.title,
      content: comment.posts?.filtered_content,
    },
  }));
}

export async function listLikedPosts({ user, pageSize = 20 } = {}) {
  const profile = await ensureProfile(user);
  if (!profile) return [];

  const { data, error } = await supabase
    .from('post_likes')
    .select(`created_at, posts:post_id (${POST_SELECT})`)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(pageSize);

  if (error) throw error;
  return (data || []).map((row) => mapPost(row.posts)).filter(Boolean);
}

function filterText(text) {
  return blockedWords.reduce((filteredText, word) => {
    const pattern = new RegExp(word, 'gi');
    return filteredText.replace(pattern, () => animalFilters[Math.floor(Math.random() * animalFilters.length)]);
  }, text);
}

function mapProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    provider: profile.provider,
    activityLevel: profile.activity_level,
    reportCount: profile.report_count,
  };
}

function mapPost(post) {
  if (!post) return null;
  return {
    id: post.id,
    kind: post.kind,
    type: post.kind === 'one_line' ? 'oneLine' : 'post',
    author: post.profiles?.display_name || 'GreenPhil user',
    authorId: post.author_id,
    level: post.profiles?.activity_level || 1,
    title: post.title || '',
    content: post.filtered_content || post.content,
    likes: post.like_count || 0,
    commentCount: post.comment_count || 0,
    comments: [],
    reports: post.report_count || 0,
    views: post.view_count || 0,
    status: post.status,
    createdAt: formatRelativeTime(post.created_at),
    createdAtRaw: post.created_at,
  };
}

function mapComment(comment) {
  return {
    id: comment.id,
    postId: comment.post_id,
    author: comment.profiles?.display_name || 'GreenPhil user',
    authorId: comment.author_id,
    content: comment.filtered_content || comment.content,
    likes: comment.like_count || 0,
    reports: comment.report_count || 0,
    createdAt: formatRelativeTime(comment.created_at),
  };
}

function formatRelativeTime(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}
