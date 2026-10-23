import type { CoinGrant, TaskVoucher } from './taskTypes'

export function calculateCoinBalance(_studentId: string, _grants: CoinGrant[], _vouchers: TaskVoucher[]): number {
  // TODO(학생 3): 지급 코인 합계에서 취소되지 않은 교환권 비용을 빼세요.
  return 0
}

export function countGrantedReasons(_studentId: string, _grants: CoinGrant[]): number {
  // TODO(학생 3): 학생에게 지급된 서로 다른 사유의 개수를 계산하세요.
  return 0
}


