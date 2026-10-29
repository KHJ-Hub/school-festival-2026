import type { CoinGrant, CoinRequest, DemoStudent, SnackMenu, TaskVoucher } from './taskTypes'

/**
 * 교사가 준비한 공용 가상 데이터입니다. 개인 과제에서는 이 파일을 수정하지 않습니다.
 * 실제 학번은 1~3으로 시작하므로, 개발용 가상 학번은 반드시 9로 시작하는 5자리만 씁니다.
 * 실제 학생 학번은 코드·테스트·Issue·PR에 절대 올리지 않습니다.
 */
export const DEMO_STUDENTS: DemoStudent[] = [
  { studentId: '90001', nickname: '별빛여우' },
  { studentId: '90002', nickname: '파란고래' },
  { studentId: '90003', nickname: '민트토끼' },
]

/** 계획안 기준 교환 단위: 맛보기컵 1코인 / 정식 1봉지 3코인 / 대형 팩+음료 세트 4코인(현재 판매 중지로 테스트) */
export const DEMO_MENUS: SnackMenu[] = [
  { id: 'popcorn-cup', name: '팝콘 맛보기컵', cost: 1, enabled: true },
  { id: 'popcorn-bag', name: '팝콘 정식 1봉지', cost: 3, enabled: true },
  { id: 'popcorn-set', name: '대형 팩 + 음료 세트', cost: 4, enabled: false },
]

export const DEMO_REQUESTS: CoinRequest[] = [
  { id: 'r-1', studentId: '90001', claimedAmount: 3, status: 'approved', approvedAmount: 3 },
  { id: 'r-2', studentId: '90002', claimedAmount: 5, status: 'approved', approvedAmount: 4 },
  { id: 'r-3', studentId: '90003', claimedAmount: 2, status: 'pending' },
  { id: 'r-4', studentId: '90001', claimedAmount: 9, status: 'rejected' },
  { id: 'r-5', studentId: '90001', claimedAmount: 2, status: 'approved', approvedAmount: 2 },
]

/** 위 신청 중 승인된 r-1, r-2, r-5에서 생긴 지급 내역 (누적: 90001=5, 90002=4, 90003=0) */
export const DEMO_GRANTS: CoinGrant[] = [
  { id: 'g-1', studentId: '90001', requestId: 'r-1', amount: 3 },
  { id: 'g-2', studentId: '90002', requestId: 'r-2', amount: 4 },
  { id: 'g-3', studentId: '90001', requestId: 'r-5', amount: 2 },
]

export const DEMO_VOUCHERS: TaskVoucher[] = [
  { id: 'v-1', studentId: '90001', menuId: 'popcorn-cup', cost: 1, status: 'issued' },
  { id: 'v-2', studentId: '90002', menuId: 'popcorn-bag', cost: 3, status: 'used' },
  { id: 'v-3', studentId: '90003', menuId: 'popcorn-bag', cost: 3, status: 'cancelled' },
]
