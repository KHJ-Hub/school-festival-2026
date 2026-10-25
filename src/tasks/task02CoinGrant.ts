import type { CoinExchangeRequest } from './taskTypes'

export type SubmitCoinExchangeResult = {
  ok: boolean
  message: string
  requests: CoinExchangeRequest[]
}

export function isValidPhysicalCoinCount(_physicalCoinCount: number): boolean {
  // TODO(학생 2 / Issue #5): 양의 정수인 실물 코인 수량만 허용하세요.
  return false
}

export function submitCoinExchangeRequest(
  requests: CoinExchangeRequest[],
  _studentId: string,
  _physicalCoinCount: number,
): SubmitCoinExchangeResult {
  // TODO(학생 2 / Issue #5): pending 신청을 추가하세요.
  // 중요: 신청만으로 사용 가능 잔액을 늘리면 안 됩니다.
  return { ok: false, message: '아직 구현되지 않은 교육용 기능입니다.', requests }
}


