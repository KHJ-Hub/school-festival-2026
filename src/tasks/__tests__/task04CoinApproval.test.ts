import { describe, expect, it } from 'vitest'
import { DEMO_GRANTS, DEMO_REQUESTS } from '../fixtures'
import { resolveCoinRequest } from '../task04CoinApproval'

const pendingId = 'r-3' // 90003, 신청 2코인, pending

describe('학생 4 — 운영진 승인·거절 처리', () => {
  it('승인하면 신청 수량만큼 지급 내역이 한 건 생긴다', () => {
    const result = resolveCoinRequest(DEMO_REQUESTS, DEMO_GRANTS, pendingId, 'approve')
    expect(result.ok).toBe(true)
    expect(result.requests.find((r) => r.id === pendingId)).toMatchObject({ status: 'approved', approvedAmount: 2 })
    expect(result.grants).toHaveLength(DEMO_GRANTS.length + 1)
    const added = result.grants.find((g) => g.requestId === pendingId)
    expect(added).toMatchObject({ studentId: '90003', amount: 2 })
    expect(added?.id).toBeTruthy()
  })

  it('수량을 줄여서 승인할 수 있다', () => {
    const result = resolveCoinRequest(DEMO_REQUESTS, DEMO_GRANTS, pendingId, 'approve', 1)
    expect(result.ok).toBe(true)
    expect(result.requests.find((r) => r.id === pendingId)?.approvedAmount).toBe(1)
    expect(result.grants.find((g) => g.requestId === pendingId)?.amount).toBe(1)
  })

  it('신청보다 많거나 1 미만·정수가 아닌 수량으로는 승인할 수 없다', () => {
    for (const bad of [3, 0, -1, 1.5]) {
      const result = resolveCoinRequest(DEMO_REQUESTS, DEMO_GRANTS, pendingId, 'approve', bad)
      expect(result.ok).toBe(false)
      expect(result.grants).toEqual(DEMO_GRANTS)
      expect(result.requests).toEqual(DEMO_REQUESTS)
    }
  })

  it('거절하면 rejected가 되고 지급하지 않는다', () => {
    const result = resolveCoinRequest(DEMO_REQUESTS, DEMO_GRANTS, pendingId, 'reject')
    expect(result.ok).toBe(true)
    expect(result.requests.find((r) => r.id === pendingId)?.status).toBe('rejected')
    expect(result.grants).toEqual(DEMO_GRANTS)
  })

  it('이미 처리된 신청은 다시 처리할 수 없다 (중복 지급 방지)', () => {
    for (const id of ['r-1', 'r-4']) {
      for (const decision of ['approve', 'reject'] as const) {
        const result = resolveCoinRequest(DEMO_REQUESTS, DEMO_GRANTS, id, decision)
        expect(result.ok).toBe(false)
        expect(result.message.length).toBeGreaterThan(0)
        expect(result.grants).toEqual(DEMO_GRANTS)
      }
    }
  })

  it('같은 신청을 연달아 두 번 승인해도 지급은 한 번뿐이다', () => {
    const first = resolveCoinRequest(DEMO_REQUESTS, DEMO_GRANTS, pendingId, 'approve')
    const second = resolveCoinRequest(first.requests, first.grants, pendingId, 'approve')
    expect(second.ok).toBe(false)
    expect(second.grants).toHaveLength(DEMO_GRANTS.length + 1)
  })

  it('없는 신청 ID는 거절한다', () => {
    const result = resolveCoinRequest(DEMO_REQUESTS, DEMO_GRANTS, 'nope', 'approve')
    expect(result.ok).toBe(false)
    expect(result.requests).toEqual(DEMO_REQUESTS)
  })

  it('원본 배열을 직접 수정하지 않는다', () => {
    const reqBefore = JSON.stringify(DEMO_REQUESTS)
    const grantBefore = JSON.stringify(DEMO_GRANTS)
    resolveCoinRequest(DEMO_REQUESTS, DEMO_GRANTS, pendingId, 'approve')
    expect(JSON.stringify(DEMO_REQUESTS)).toBe(reqBefore)
    expect(JSON.stringify(DEMO_GRANTS)).toBe(grantBefore)
  })
})
