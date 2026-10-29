import { describe, expect, it } from 'vitest'
import { DEMO_VOUCHERS } from '../fixtures'
import { markVoucherUsed } from '../task06VoucherUse'

describe('학생 6 — 교환권 사용 처리', () => {
  it('issued → used 로 바뀐다 (나머지는 그대로)', () => {
    const result = markVoucherUsed(DEMO_VOUCHERS, 'v-1')
    expect(result.ok).toBe(true)
    expect(result.vouchers.find((v) => v.id === 'v-1')?.status).toBe('used')
    expect(result.vouchers.find((v) => v.id === 'v-2')).toEqual(DEMO_VOUCHERS[1])
  })

  it('같은 교환권을 다시 사용할 수 없다', () => {
    const first = markVoucherUsed(DEMO_VOUCHERS, 'v-1')
    const second = markVoucherUsed(first.vouchers, 'v-1')
    expect(second.ok).toBe(false)
    expect(second.message.length).toBeGreaterThan(0)
  })

  it('이미 used 인 교환권은 거절한다', () => {
    expect(markVoucherUsed(DEMO_VOUCHERS, 'v-2').ok).toBe(false)
  })

  it('취소된 교환권은 거절한다', () => {
    const result = markVoucherUsed(DEMO_VOUCHERS, 'v-3')
    expect(result.ok).toBe(false)
    expect(result.vouchers.find((v) => v.id === 'v-3')?.status).toBe('cancelled')
  })

  it('없는 ID는 거절하고 목록은 그대로다', () => {
    const result = markVoucherUsed(DEMO_VOUCHERS, 'nope')
    expect(result.ok).toBe(false)
    expect(result.vouchers).toEqual(DEMO_VOUCHERS)
  })

  it('원본 배열을 직접 수정하지 않는다', () => {
    const before = JSON.stringify(DEMO_VOUCHERS)
    markVoucherUsed(DEMO_VOUCHERS, 'v-1')
    expect(JSON.stringify(DEMO_VOUCHERS)).toBe(before)
  })
})
