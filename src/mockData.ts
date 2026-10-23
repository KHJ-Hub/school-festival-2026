import type { Activity, RankingEntry, Voucher } from './types'

export const CLUBS = ['보드게임동아리', '리틀엔지니어랩', '국제이해문화탐구반']

export const BOOTHS = [
  '전략 보드게임 존',
  '미니 로봇 챌린지',
  '세계 문화 퀴즈',
]

export const INITIAL_ACTIVITIES: Activity[] = [
  { id: 1, booth: '미니 로봇 챌린지', amount: 30, time: '10:24' },
  { id: 2, booth: '세계 문화 퀴즈', amount: 20, time: '10:06' },
  { id: 3, booth: '전략 보드게임 존', amount: 10, time: '09:48' },
]

export const INITIAL_VOUCHERS: Voucher[] = [
  // TODO(과제 2): 간식 종류와 필요 코인이 확정되면 이 가상 데이터를 수정하세요.
  { id: 1, name: '솜사탕 교환권', booth: '달콤 구름 부스', price: 40, icon: '☁️', color: 'pink', status: 'issued' },
  { id: 2, name: '즉석 사진 1회권', booth: '찰칵 포토존', price: 60, icon: '📸', color: 'yellow', status: 'available' },
  { id: 3, name: '미니 간식 꾸러미', booth: '세계 간식 여행', price: 80, icon: '🍪', color: 'mint', status: 'available' },
]

export const RANKINGS: RankingEntry[] = [
  // TODO(과제 4): 종목마다 higher/lower 규칙을 선택할 수 있는 구조로 확장하세요.
  { rank: 1, name: '푸른별 팀', club: '리틀엔지니어랩', game: '로봇 미로', score: 42, unit: '초' },
  { rank: 2, name: '체크메이트', club: '보드게임동아리', game: '스피드 퍼즐', score: 51, unit: '초' },
  { rank: 3, name: '글로벌 탐험대', club: '국제이해문화탐구반', game: '세계 퀴즈', score: 860, unit: '점' },
  { rank: 4, name: '기어즈', club: '리틀엔지니어랩', game: '로봇 미로', score: 58, unit: '초' },
  { rank: 5, name: '주사위 원정대', club: '보드게임동아리', game: '스피드 퍼즐', score: 64, unit: '초' },
  { rank: 6, name: '문화수집가', club: '국제이해문화탐구반', game: '세계 퀴즈', score: 720, unit: '점' },
]


