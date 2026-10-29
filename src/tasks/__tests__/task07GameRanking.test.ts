import { describe, expect, it } from 'vitest'
import { DEMO_GRANTS } from '../fixtures'
import type { CoinGrant } from '../taskTypes'
import { rankByTotalEarned } from '../task07GameRanking'

const grant = (id: string, studentId: string, amount: number): CoinGrant => ({ id, studentId, requestId: `r-${id}`, amount })

// 동점이 없는 데이터: 90001=9(4+5), 90002=8, 90003=7, 90004=6, 90005=5, 90006=3(1+2), 90007=2
const MANY: CoinGrant[] = [
  grant('1', '90001', 4),
  grant('2', '90002', 8),
  grant('3', '90003', 7),
  grant('4', '90004', 6),
  grant('5', '90005', 5),
  grant('6', '90006', 1),
  grant('7', '90001', 5),
  grant('8', '90006', 2),
  grant('9', '90007', 2),
]

describe('학생 7 — 누적 적립 코인 랭킹', () => {
  it('학생별로 합산해 많은 순으로 정렬한다', () => {
    const rows = rankByTotalEarned(DEMO_GRANTS, 5)
    expect(rows.map((r) => [r.studentId, r.total])).toEqual([['90001', 5], ['90002', 4]])
  })

  it('rank는 1부터 순서대로 붙는다', () => {
    expect(rankByTotalEarned(MANY, 5).map((r) => r.rank)).toEqual([1, 2, 3, 4, 5])
  })

  it('같은 학생의 여러 지급을 합산한다', () => {
    const top = rankByTotalEarned(MANY, 10)
    expect(top.find((r) => r.studentId === '90001')?.total).toBe(9)
    expect(top[0]?.studentId).toBe('90001')
  })

  it('limit 명까지만 반환한다 (학생 7명)', () => {
    expect(rankByTotalEarned(MANY, 5)).toHaveLength(5)
    expect(rankByTotalEarned(MANY, 10)).toHaveLength(7)
  })

  it('지급이 없으면 빈 배열', () => {
    expect(rankByTotalEarned([], 5)).toEqual([])
  })

  it('원본 배열의 순서를 바꾸지 않는다', () => {
    const before = MANY.map((g) => g.id)
    rankByTotalEarned(MANY, 5)
    expect(MANY.map((g) => g.id)).toEqual(before)
  })
})
