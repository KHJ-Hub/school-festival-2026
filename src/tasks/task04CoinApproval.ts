import type { CoinDecision, CoinGrant, CoinRequest } from './taskTypes'

export type CoinResolveResult = {
  ok: boolean
  message: string
  requests: CoinRequest[]
  grants: CoinGrant[]
}

function createGrantId(grants: CoinGrant[]): string {
  let number = 1
  let id = `grant-${number}`

  while (grants.some((grant) => grant.id === id)) {
    number += 1
    id = `grant-${number}`
  }

  return id
}

export function resolveCoinRequest(
  requests: CoinRequest[],
  grants: CoinGrant[],
  _requestId: string,
  _decision: CoinDecision,
  _approvedAmount?: number,
): CoinResolveResult {
  const request = requests.find((item) => item.id === _requestId)

  if (!request) {
    return {
      ok: false,
      message: '신청을 찾을 수 없습니다.',
      requests,
      grants,
    }
  }

  if (request.status !== 'pending') {
    return {
      ok: false,
      message: '이미 처리된 신청입니다.',
      requests,
      grants,
    }
  }

  if (_decision === 'reject') {
    const updatedRequests: CoinRequest[] = requests.map((item) => {
      if (item.id !== _requestId) {
        return item
      }

      return {
        ...item,
        status: 'rejected' as const,
      }
    })

    return {
      ok: true,
      message: '신청을 거절했습니다.',
      requests: updatedRequests,
      grants,
    }
  }

  if (grants.some((grant) => grant.requestId === _requestId)) {
    return {
      ok: false,
      message: '이미 지급 내역이 있는 신청입니다.',
      requests,
      grants,
    }
  }

  const approvedAmount = _approvedAmount ?? request.claimedAmount

  if (
    !Number.isInteger(approvedAmount) ||
    approvedAmount < 1 ||
    approvedAmount > request.claimedAmount
  ) {
    return {
      ok: false,
      message: '승인 수량은 신청 수량 이하인 1 이상의 정수여야 합니다.',
      requests,
      grants,
    }
  }

  const updatedRequests: CoinRequest[] = requests.map((item) => {
    if (item.id !== _requestId) {
      return item
    }

    return {
      ...item,
      status: 'approved' as const,
      approvedAmount,
    }
  })

  const newGrant: CoinGrant = {
    id: createGrantId(grants),
    studentId: request.studentId,
    requestId: request.id,
    amount: approvedAmount,
  }

  return {
    ok: true,
    message: '신청을 승인했습니다.',
    requests: updatedRequests,
    grants: [...grants, newGrant],
  }
}
