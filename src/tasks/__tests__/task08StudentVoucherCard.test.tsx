import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { TaskVoucher } from '../taskTypes'
import { StudentVoucherCard } from '../task08StudentVoucherCard'

const STATUSES = ['issued', 'used', 'cancelled'] as const
const make = (status: TaskVoucher['status']): TaskVoucher => ({ id: 'v', studentId: '90001', menuId: 'm', cost: 2, status })
const html = (status: TaskVoucher['status']) => renderToStaticMarkup(<StudentVoucherCard voucher={make(status)} menuName="솜사탕" />)
const text = (status: TaskVoucher['status']) => html(status).replace(/<[^>]*>/g, '')

describe('학생 8 — 학생용 읽기 전용 교환권 카드', () => {
  it('메뉴 이름이 보인다', () => {
    expect(text('issued')).toContain('솜사탕')
  })

  it('세 상태가 서로 다른 한국어 문구로 보인다', () => {
    expect(new Set(STATUSES.map(text)).size).toBe(3)
    expect(text('issued')).toMatch(/발급/)
    expect(text('used')).toMatch(/사용/)
    expect(text('cancelled')).toMatch(/취소/)
  })

  it('영어 상태값을 화면 글자로 그대로 보여주지 않는다', () => {
    for (const s of STATUSES) expect(text(s)).not.toMatch(/issued|used|cancelled/)
  })

  it('조작 버튼이 없다 (조회 전용)', () => {
    for (const s of STATUSES) expect(html(s)).not.toMatch(/<button|<input|<a /)
  })
})
