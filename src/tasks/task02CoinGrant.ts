import type { CoinRequest } from './taskTypes'

export type CoinRequestResult = { ok: boolean; message: string; requests: CoinRequest[] }

export function createCoinRequest(requests: CoinRequest[], _studentId: string, _claimedAmount: number): CoinRequestResult {
  // TODO(학생 2): 학생이 "내가 가진 코인 수"를 신청하면 pending 상태의 신청을 새 배열로 추가하세요.
  // - 코인 수는 1 이상의 정수여야 합니다.
  // - 같은 학생의 pending 신청이 이미 있으면 거절하세요.
  // 실패하면 원래 requests 배열과 이해하기 쉬운 message를 반환하세요.
  // 힌트: Number.isInteger(), Array.some(), 새 배열 만들기 [...requests, 새신청]. 실패는 일찍 return 하면 편합니다.
  //       id 는 기존 신청과 겹치지만 않으면 됩니다(예: 개수 + 1 을 이용).
  return { ok: false, message: '아직 구현되지 않은 교육용 기능입니다.', requests }
}
