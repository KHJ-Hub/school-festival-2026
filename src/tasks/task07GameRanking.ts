import type { CoinGrant, CoinRankRow } from './taskTypes'

export function rankByTotalEarned(_grants: CoinGrant[], _limit: 5 | 10): CoinRankRow[] {
  // 학생별 합계를 저장할 Map (key: studentId, value: totalAmount)
  const totalByStudent = new Map<string, number>()

  // 1. 지급 내역을 돌면서 학생별 코인 합계 계산
  for (const grant of _grants) {
    const prev = totalByStudent.get(grant.studentId) ?? 0
    totalByStudent.set(grant.studentId, prev + grant.amount)
  }

  // 2. Map을 배열로 바꾸고, total(합계) 기준으로 내림차순 정렬
  const sorted = [...totalByStudent.entries()]
    .map(([studentId, total]) => ({ studentId, total }))
    .sort((a, b) => b.total - a.total)

  // 3. 필요한 limit 명까지만 자르고, rank를 1부터 붙여서 반환
  return sorted.slice(0, _limit).map((row, index) => ({
    rank: index + 1,
    studentId: row.studentId,
    total: row.total,
  }))
}
