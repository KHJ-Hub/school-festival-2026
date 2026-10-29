/** 교사가 준비한 공통 타입입니다. 개인 과제에서는 이 파일을 수정하지 않습니다. */
export type DemoStudent = { studentId: string; nickname: string }

/** 학생이 "내가 가진 코인"을 입력해 올리는 적립 신청 → 운영진이 승인/거절 */
export type CoinRequestStatus = 'pending' | 'approved' | 'rejected'
export type CoinRequest = {
  id: string
  studentId: string
  claimedAmount: number
  status: CoinRequestStatus
  /** 승인된 경우에만 있습니다. 운영진이 수량을 줄여 승인할 수 있습니다. */
  approvedAmount?: number
}
export type CoinDecision = 'approve' | 'reject'

/** 승인된 신청 한 건마다 만들어지는 지급 내역 */
export type CoinGrant = { id: string; studentId: string; requestId: string; amount: number }

export type SnackMenu = { id: string; name: string; cost: number; enabled: boolean }
export type TaskVoucher = { id: string; studentId: string; menuId: string; cost: number; status: 'issued' | 'used' | 'cancelled' }

/** 누적 적립 코인 랭킹 한 줄. 화면에 학번을 그대로 공개하지 않도록 UI에서 가려야 합니다. */
export type CoinRankRow = { rank: number; studentId: string; total: number }
