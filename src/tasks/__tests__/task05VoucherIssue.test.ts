import { describe, expect, it } from 'vitest'
import { DEMO_MENUS, DEMO_VOUCHERS } from '../fixtures'
import { issueVoucher } from '../task05VoucherIssue'

const bag = DEMO_MENUS[1]! // 정식 1봉지, 3코인
const stopped = DEMO_MENUS[2]! // 판매 중지

describe('학생 5 — 모바일 교환권 발급', () => {
  it('정상 발급: issued 교환권이 한 건만 추가된다', () => {
    const result = issueVoucher(DEMO_VOUCHERS, '90001', bag, 5)
    expect(result.ok).toBe(true)
    expect(result.vouchers).toHaveLength(DEMO_VOUCHERS.length + 1)
    const added = result.vouchers.find((v) => !DEMO_VOUCHERS.some((old) => old.id === v.id))
    expect(added).toMatchObject({ studentId: '90001', menuId: bag.id, cost: bag.cost, status: 'issued' })
  })

  it('잔액이 정확히 같아도 발급된다', () => {
    expect(issueVoucher([], '90001', bag, bag.cost).ok).toBe(true)
  })

  it('잔액 부족이면 실패하고 원본 내용이 유지된다', () => {
    const result = issueVoucher(DEMO_VOUCHERS, '90001', bag, 2)
    expect(result.ok).toBe(false)
    expect(result.message.length).toBeGreaterThan(0)
    expect(result.vouchers).toEqual(DEMO_VOUCHERS)
  })

  it('판매 중지 메뉴는 발급되지 않는다', () => {
    const result = issueVoucher(DEMO_VOUCHERS, '90001', stopped, 100)
    expect(result.ok).toBe(false)
    expect(result.vouchers).toEqual(DEMO_VOUCHERS)
  })

  it('기존 교환권은 보존되고 배열을 직접 바꾸지 않는다', () => {
    const before = JSON.stringify(DEMO_VOUCHERS)
    const result = issueVoucher(DEMO_VOUCHERS, '90001', bag, 5)
    expect(JSON.stringify(DEMO_VOUCHERS)).toBe(before)
    for (const old of DEMO_VOUCHERS) expect(result.vouchers).toContainEqual(old)
  })

  it('두 번 발급해도 ID가 겹치지 않는다', () => {
    const first = issueVoucher([], '90001', bag, 10)
    const second = issueVoucher(first.vouchers, '90001', bag, 10)
    const ids = second.vouchers.map((v) => v.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
