import { supabase } from './supabase';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const DEV_USER_ID = process.env.REACT_APP_DEV_USER_ID || '';

async function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  } else if (DEV_USER_ID) {
    headers['X-Dev-User-Id'] = DEV_USER_ID;
    headers['X-Dev-User-Name'] = process.env.REACT_APP_DEV_USER_NAME || '개발 사용자';
  }

  return headers;
}

async function request(path, options = {}) {
  const headers = await authHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || '요청을 처리하지 못했습니다.');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  listPosts({ type, q, scope = 'all' } = {}) {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (q) params.set('q', q);
    if (scope) params.set('scope', scope);
    return request(`/api/posts?${params.toString()}`, { method: 'GET' });
  },
  getPost(postId) {
    return request(`/api/posts/${postId}`, { method: 'GET' });
  },
  createPost(payload) {
    return request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  createComment(postId, content) {
    return request(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
  togglePostLike(postId) {
    return request(`/api/posts/${postId}/like`, { method: 'POST' });
  },
  toggleCommentLike(commentId) {
    return request(`/api/comments/${commentId}/like`, { method: 'POST' });
  },
  toggleScrap(postId) {
    return request(`/api/posts/${postId}/scrap`, { method: 'POST' });
  },
  reportPost(postId, reason = '부적절한 내용') {
    return request(`/api/posts/${postId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  me() {
    return request('/api/me', { method: 'GET' });
  },
  riskyUsers() {
    return request('/api/moderation/risky-users', { method: 'GET' });
  },
  reportQueue() {
    return request('/api/moderation/report-queue', { method: 'GET' });
  },
};
