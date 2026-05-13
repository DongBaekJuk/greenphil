import { render, screen } from '@testing-library/react';
import App from './App';

test('renders community feed', () => {
  render(<App />);
  expect(screen.getByText(/게시글 목록/i)).toBeInTheDocument();
  expect(screen.getByText(/신고\/필터링/i)).toBeInTheDocument();
});
