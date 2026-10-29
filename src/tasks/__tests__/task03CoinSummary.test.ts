import { describe, expect, it } from 'vitest'
import { DEMO_GRANTS, DEMO_VOUCHERS } from '../fixtures'
import type { TaskVoucher } from '../taskTypes'
import { calculateCoinBalance, calculateTotalEarned } from '../task03CoinSummary'

describe('학생 3 — 코인 잔액과 누적 적립', () => {
  it('지급이 없으면 잔액 0', () => {
    expect(calculateCoinBalance('99999', DEMO_GRANTS, DEMO_VOUCHERS)).toBe(0)
  })

  it('지급 합계에서 교환권 비용을 뺀다 (90001: 5 - 1)', () => {
    expect(calculateCoinBalance('90001', DEMO_GRANTS, DEMO_VOUCHERS)).toBe(4)
  })

  it('사용 완료된 교환권도 비용을 차감한다 (90002: 4 - 3)', () => {
    expect(calculateCoinBalance('90002', DEMO_GRANTS, DEMO_VOUCHERS)).toBe(1)
  })

  it('교환권이 없으면 지급 합계 그대로', () => {
    expect(calculateCoinBalance('90001', DEMO_GRANTS, [])).toBe(5)
  })

  it('취소된 교환권 비용은 차감하지 않는다', () => {
    const cancelled: TaskVoucher[] = [{ id: 'v-x', studentId: '90001', menuId: 'popcorn-bag', cost: 3, status: 'cancelled' }]
    expect(calculateCoinBalance('90001', DEMO_GRANTS, cancelled)).toBe(5)
    expect(calculateCoinBalance('90003', DEMO_GRANTS, DEMO_VOUCHERS)).toBe(0)
  })

  it('누적 적립은 교환권을 써도 줄지 않는다', () => {
    expect(calculateTotalEarned('90001', DEMO_GRANTS)).toBe(5)
    expect(calculateTotalEarned('90002', DEMO_GRANTS)).toBe(4)
  })

  it('적립이 없거나 다른 학번이면 0이고 다른 학생 데이터가 섞이지 않는다', () => {
    expect(calculateTotalEarned('90003', DEMO_GRANTS)).toBe(0)
    expect(calculateTotalEarned('99999', DEMO_GRANTS)).toBe(0)
  })
})
