import { describe, expect, it } from 'vitest'
import { DEMO_REQUESTS } from '../fixtures'
import { createCoinRequest } from '../task02CoinGrant'

describe('학생 2 — 코인 적립 신청 만들기', () => {
  it('pending 신청이 한 건 추가된다', () => {
    const result = createCoinRequest([], '90001', 3)
    expect(result.ok).toBe(true)
    expect(result.requests).toHaveLength(1)
    expect(result.requests[0]).toMatchObject({ studentId: '90001', claimedAmount: 3, status: 'pending' })
    expect(result.requests[0]?.id).toBeTruthy()
  })

  it('코인 수가 1 이상의 정수가 아니면 거절한다', () => {
    for (const bad of [0, -1, 1.5, Number.NaN]) {
      const result = createCoinRequest([], '90001', bad)
      expect(result.ok).toBe(false)
      expect(result.message.length).toBeGreaterThan(0)
      expect(result.requests).toHaveLength(0)
    }
  })

  it('같은 학생의 pending 신청이 있으면 거절한다', () => {
    const result = createCoinRequest(DEMO_REQUESTS, '90003', 1)
    expect(result.ok).toBe(false)
    expect(result.requests).toEqual(DEMO_REQUESTS)
  })

  it('이미 처리된 신청만 있거나 다른 학생이면 새로 신청할 수 있다', () => {
    expect(createCoinRequest(DEMO_REQUESTS, '90001', 1).ok).toBe(true)
    expect(createCoinRequest(DEMO_REQUESTS, '90002', 1).ok).toBe(true)
  })

  it('같은 학생이 연달아 두 번 신청하면 두 번째는 거절한다', () => {
    const first = createCoinRequest([], '90001', 2)
    const second = createCoinRequest(first.requests, '90001', 2)
    expect(second.ok).toBe(false)
    expect(second.requests).toHaveLength(1)
  })

  it('ID가 겹치지 않고 원본 배열을 바꾸지 않는다', () => {
    const before = JSON.stringify(DEMO_REQUESTS)
    const result = createCoinRequest(DEMO_REQUESTS, '90002', 1)
    expect(JSON.stringify(DEMO_REQUESTS)).toBe(before)
    const ids = result.requests.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
