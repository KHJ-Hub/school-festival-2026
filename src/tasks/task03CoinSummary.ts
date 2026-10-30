
import type { CoinGrant, TaskVoucher } from './taskTypes'

export function calculateCoinBalance(
  _studentId: string,
  _grants: CoinGrant[],
  _vouchers: TaskVoucher[]
): number {
  // 학생의 누적 적립 코인
  const totalEarned = calculateTotalEarned(_studentId, _grants)

  // 취소되지 않은 교환권의 비용 합계
  const totalSpent = _vouchers
    .filter(voucher => voucher.studentId === _studentId && voucher.status !== 'cancelled')
    .reduce((sum, voucher) => sum + voucher.cost, 0)

  // 잔액 = 적립 코인 - 교환권 사용 비용
  return totalEarned - totalSpent
}

export function calculateTotalEarned(
  _studentId: string,
  _grants: CoinGrant[]
): number {
  return _grants
    .filter(grant => grant.studentId === _studentId)
    .reduce((sum, grant) => sum + grant.amount, 0)
}
