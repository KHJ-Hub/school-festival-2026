import type { CoinRequest } from './taskTypes'

export type CoinRequestResult = { ok: boolean; message: string; requests: CoinRequest[] }

export function createCoinRequest(
  requests: CoinRequest[],
  _studentId: string,
  _claimedAmount: number
): CoinRequestResult {
  // 1. 코인 수 유효성 검사: 1 이상이어야 하고, 정수여야 함
  if (!Number.isInteger(_claimedAmount) || _claimedAmount < 1) {
    return {
      ok: false,
      message: '코인 수는 1 이상의 정수만 신청할 수 있습니다.',
      requests: []
    }
  }

  // 2. 같은 학생의 pending 신청이 이미 있는지 검사
  const hasPending = requests.some(
    (r) => r.studentId === _studentId && r.status === 'pending'
  )
  if (hasPending) {
    return {
      ok: false,
      message: '이미 진행 중(pending)인 코인 신청이 있습니다.',
      requests: requests
    }
  }

  // 3. 새 신청 ID 만들기: 기존 신청들과 겹치지 않게 생성
  const existingIds = new Set(requests.map((r) => r.id))
  let newIdNum = requests.length + 1
  let newId = String(newIdNum)

  // 겹치면 다른 번호를 찾아서 사용
  while (existingIds.has(newId)) {
    newIdNum += 1
    newId = String(newIdNum)
  }

  const newRequest: CoinRequest = {
    id: newId,
    studentId: _studentId,
    claimedAmount: _claimedAmount,
    status: 'pending'
  }

  // 4. 원본 배열은 건드리지 않고, 새 배열을 만들어서 반환
  return {
    ok: true,
    message: '',
    requests: [...requests, newRequest]
  }
}
