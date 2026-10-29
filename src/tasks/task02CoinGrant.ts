import type { CoinDecision, CoinGrant, CoinRequest } from './taskTypes'

export type CoinRequestResult = { ok: boolean; message: string; requests: CoinRequest[] }
export type CoinResolveResult = { ok: boolean; message: string; requests: CoinRequest[]; grants: CoinGrant[] }

export function createCoinRequest(requests: CoinRequest[], _studentId: string, _claimedAmount: number): CoinRequestResult {
  // TODO(학생 2): 학생이 "내가 가진 코인 수"를 신청하면 pending 상태의 신청을 새 배열로 추가하세요.
  // - 코인 수는 1 이상의 정수여야 합니다.
  // - 같은 학생의 pending 신청이 이미 있으면 거절하세요.
  // 실패하면 원래 requests 배열과 이해하기 쉬운 message를 반환하세요.
  return { ok: false, message: '아직 구현되지 않은 교육용 기능입니다.', requests }
}

export function resolveCoinRequest(
  requests: CoinRequest[],
  grants: CoinGrant[],
  _requestId: string,
  _decision: CoinDecision,
  _approvedAmount?: number,
): CoinResolveResult {
  // TODO(학생 2): 운영진의 승인/거절을 처리하세요.
  // - pending 신청만 처리할 수 있습니다(이미 처리된 신청은 거절, 중복 지급 금지).
  // - approve: 신청을 approved로 바꾸고 approvedAmount를 기록한 뒤 지급 내역(grants) 한 건을 추가합니다.
  //   approvedAmount를 주지 않으면 신청한 수량 그대로, 주면 그 수량으로 승인합니다(1 이상 정수, 신청 수량 이하).
  // - reject: 신청을 rejected로 바꾸고 지급하지 않습니다.
  // 이 함수는 교육용 시뮬레이션이며 실제 승인 권한 검증은 서버에서 해야 합니다.
  return { ok: false, message: '아직 구현되지 않은 교육용 기능입니다.', requests, grants }
}
