import type { GameDirection, TaskGameScore } from './taskTypes'

export function rankGameScores(
  scores: TaskGameScore[],
  _gameId: string,
  _direction: GameDirection,
  _limit: 5 | 10,
): TaskGameScore[] {
  // TODO(학생 7): 종목을 필터링하고 higher/lower 규칙으로 정렬한 뒤 limit만큼 반환하세요.
  // 동점 처리 규칙은 아직 확정하지 말고 문서에 선택지를 기록하세요.
  return scores
}


