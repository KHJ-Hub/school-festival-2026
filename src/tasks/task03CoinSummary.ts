import type { CoinExchangeRequest, TaskVoucher } from './taskTypes'

export type ReviewDecision = 'approved' | 'rejected'

export function reviewCoinExchangeRequest(
  requests: CoinExchangeRequest[],
  _requestId: string,
  _collectedCoinCount: number,
  _decision: ReviewDecision,
): CoinExchangeRequest[] {
  // TODO(학생 3 / Issue #6): pending 신청만 승인 또는 반려하세요.
  // 승인 전 운영진이 실물 코인을 실제로 회수·대조했다고 가정합니다.
  return requests
}

export function calculateApprovedCoinBalance(
  _studentId: string,
  _requests: CoinExchangeRequest[],
  _vouchers: TaskVoucher[],
): number {
  // TODO(학생 3 / Issue #6): approved 수량만 더하고 취소되지 않은 교환권 비용을 빼세요.
  // pending과 rejected 수량은 절대 잔액에 포함하지 않습니다.
  return 0
}


