import type { RankingEntry, Voucher } from './types'
import type { CoinExchangeRequest } from './tasks/taskTypes'

export const CLUBS = ['보드게임동아리', '리틀엔지니어랩', '국제이해문화탐구반']

export const INITIAL_COIN_EXCHANGE_REQUESTS: CoinExchangeRequest[] = [
  { id: 'REQ-DEMO-001', studentId: 'F-1001', physicalCoinCount: 3, status: 'approved', submittedAt: '10:05', reviewedCoinCount: 3, reviewedAt: '10:08' },
  { id: 'REQ-DEMO-002', studentId: 'F-1002', physicalCoinCount: 2, status: 'pending', submittedAt: '10:12' },
  { id: 'REQ-DEMO-003', studentId: 'F-1003', physicalCoinCount: 1, status: 'rejected', submittedAt: '10:16', reviewedCoinCount: 0, reviewedAt: '10:18' },
]

export const INITIAL_VOUCHERS: Voucher[] = [
  // TODO(학생 4·5): 간식 종류와 필요 코인이 확정되면 이 가상 데이터를 수정하세요.
  { id: 1, name: '솜사탕 교환권', booth: '달콤 구름 부스', price: 1, icon: '☁️', color: 'pink', status: 'issued' },
  { id: 2, name: '즉석 사진 1회권', booth: '찰칵 포토존', price: 2, icon: '📸', color: 'yellow', status: 'available' },
  { id: 3, name: '미니 간식 꾸러미', booth: '세계 간식 여행', price: 3, icon: '🍪', color: 'mint', status: 'available' },
]

export const RANKINGS: RankingEntry[] = [
  // TODO(학생 7): 종목마다 higher/lower 규칙을 선택할 수 있는 구조로 확장하세요.
  { rank: 1, name: '푸른별 팀', club: '리틀엔지니어랩', game: '로봇 미로', score: 42, unit: '초' },
  { rank: 2, name: '체크메이트', club: '보드게임동아리', game: '스피드 퍼즐', score: 51, unit: '초' },
  { rank: 3, name: '글로벌 탐험대', club: '국제이해문화탐구반', game: '세계 퀴즈', score: 860, unit: '점' },
  { rank: 4, name: '기어즈', club: '리틀엔지니어랩', game: '로봇 미로', score: 58, unit: '초' },
  { rank: 5, name: '주사위 원정대', club: '보드게임동아리', game: '스피드 퍼즐', score: 64, unit: '초' },
  { rank: 6, name: '문화수집가', club: '국제이해문화탐구반', game: '세계 퀴즈', score: 720, unit: '점' },
]


