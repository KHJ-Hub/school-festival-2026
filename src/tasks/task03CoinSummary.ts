import type { CoinGrant, TaskVoucher } from './taskTypes'

export function calculateCoinBalance(_studentId: string, _grants: CoinGrant[], _vouchers: TaskVoucher[]): number {
  // TODO(학생 3): 학생의 지급 코인 합계에서 취소되지 않은 교환권 비용을 빼세요.
  // 힌트: filter() 로 내 학번 것만 고르고 reduce() 로 합칩니다. 아래 calculateTotalEarned 를 먼저 만들면 다시 쓸 수 있습니다.
  return 0
}

export function calculateTotalEarned(_studentId: string, _grants: CoinGrant[]): number {
  // TODO(학생 3): 학생이 지금까지 적립한 코인의 누적 합계를 계산하세요. (교환권 사용과 무관합니다)
  // 힌트: filter() → reduce((합계, 항목) => 합계 + 항목.amount, 0)
  return 0
}
