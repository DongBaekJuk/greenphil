import { render, screen } from '@testing-library/react';
import App from './App';

test('renders community feed without moderation panel', () => {
  render(<App />);
  expect(screen.getByText(/게시글 목록/i)).toBeInTheDocument();
  expect(screen.queryByText(/신고\/필터링/i)).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: '게시글' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '토론장' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Google' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Naver' })).toBeInTheDocument();
});
