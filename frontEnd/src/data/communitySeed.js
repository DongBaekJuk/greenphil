// 앱을 백엔드에 연결하기 전까지 화면과 상호작용을 유지하는 초기 데이터입니다.
export const animalFilters = ['다람쥐', '고래', '올빼미', '수달', '고양이', '판다'];
export const blockedWords = ['멍청이', '비속어', '욕설', '바보'];

export const initialPosts = [
  {
    id: 1,
    type: 'oneLine',
    author: '나린',
    level: 8,
    title: '',
    content: '물이 천천히 끓듯이 마음도 천천히 괜찮아진다.',
    likes: 128,
    comments: [
      { id: 101, author: '서윤', content: '오늘 꼭 필요한 말이었어요.', likes: 14 },
      { id: 102, author: '초록', content: '진짜 한 줄에 힘이 있네요.', likes: 9 },
    ],
    reports: 1,
    views: 2040,
    createdAt: '방금 전',
  },
  {
    id: 2,
    type: 'post',
    author: '서하',
    level: 15,
    title: '새벽 2시의 문장',
    content:
      '잠들지 못한 시간은 가끔 나를 심문하지만, 그 안에서도 내일로 넘어가는 작은 문은 있다. 오늘은 그 문 앞에 오래 앉아 있었다.',
    likes: 342,
    comments: [{ id: 201, author: '태경', content: '문장이 깊고 오래 남아요.', likes: 31 }],
    reports: 6,
    views: 1800,
    createdAt: '12분 전',
  },
  {
    id: 3,
    type: 'oneLine',
    author: '로아',
    level: 4,
    title: '',
    content: '오늘도 버텼다면 이미 충분히 잘한 사람.',
    likes: 87,
    comments: [],
    reports: 0,
    views: 920,
    createdAt: '31분 전',
  },
];
