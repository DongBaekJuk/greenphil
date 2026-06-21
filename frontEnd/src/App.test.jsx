import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, test, vi } from 'vitest';
import App from './App';

// 기능 단위: 테스트에서는 Supabase 네트워크 대신 인증/게시글 서비스를 고정 응답으로 대체합니다.
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('./services/communityRepository', () => ({
  createComment: vi.fn(),
  createPost: vi.fn(),
  ensureProfile: vi.fn(async () => null),
  getPost: vi.fn(),
  listPosts: vi.fn(async () => ({ posts: [], total: 0, fallbackSort: false })),
  reportPost: vi.fn(),
  toggleCommentLike: vi.fn(),
  togglePostLike: vi.fn(),
  listLikedPosts: vi.fn(async () => []),
  listMyComments: vi.fn(async () => []),
  listMyPosts: vi.fn(async () => []),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test('renders routed community board shell', async () => {
  render(
    <MemoryRouter initialEntries={['/posts']}>
      <App />
    </MemoryRouter>,
  );

  expect(await screen.findByText(/게시글 목록/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '게시판' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '토론장' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Google' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Naver' })).toBeInTheDocument();
});
