import type { CoinGrant, CoinRankRow } from './taskTypes'

export function rankByTotalEarned(_grants: CoinGrant[], _limit: 5 | 10): CoinRankRow[] {
  // TODO(학생 7): 학생별 누적 적립 코인을 합산해 많은 순으로 정렬하고 limit명까지만 반환하세요.
  // rank는 1부터 시작하는 순서입니다. 동점 처리 규칙은 아직 확정하지 말고 문서에 선택지를 기록하세요.
  // 주의: 학번은 개인정보입니다. 화면에 공개할 때는 가려야 하므로 가리는 방법도 문서에 제안해 보세요.
  // 힌트: Map 으로 학번별 합계 만들기 → [...map.entries()] → sort((a, b) => b.total - a.total) → slice(0, limit)
  //       sort 는 원본을 바꾸니 복사본에서 하세요.
  return []
}
