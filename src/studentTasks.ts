/**
 * 학생 개발 과제를 위한 시작 파일입니다.
 * docs/STUDENT_TASKS.md를 읽고 한 과제씩 구현하세요.
 * 실제 학생 정보 대신 F-1001 같은 가상 학번만 사용합니다.
 */
export type StudentCoin = { studentId: string; balance: number; rewardedReasons: string[] }
export type StudentTaskVoucher = { id: string; studentId: string; menuId: string; status: 'issued' | 'used' | 'cancelled' }
export type GameRule = { gameId: string; direction: 'higher' | 'lower' }
export type GameScore = { participantCode: string; gameId: string; score: number }

export function grantCoinByStudentId(students: StudentCoin[], _studentId: string, _reason: string): StudentCoin[] {
  // TODO(과제 1): 가상 학번을 찾아 1코인을 지급하세요.
  // TODO(과제 1): 같은 학생에게 같은 사유로 두 번 지급되지 않게 하세요.
  return students
}

export function issueVoucherForStudent(vouchers: StudentTaskVoucher[], _studentId: string, _menuId: string): StudentTaskVoucher[] {
  // TODO(과제 2): 학생의 잔액을 확인하고 교환권을 발급하세요.
  // 코인 차감은 별도의 순수 함수로 만들어도 좋습니다.
  return vouchers
}

export function markVoucherUsed(vouchers: StudentTaskVoucher[], _voucherId: string): StudentTaskVoucher[] {
  // TODO(과제 3): issued 상태의 교환권만 used로 변경하세요.
  // TODO(과제 3): 이미 used 또는 cancelled인 교환권은 바꾸지 마세요.
  return vouchers
}

export function calculateGameRanking(scores: GameScore[], _rule: GameRule): GameScore[] {
  // TODO(과제 4): higher는 큰 점수부터, lower는 작은 기록부터 정렬하세요.
  // 동점 처리 규칙은 팀에서 토의한 뒤 별도 옵션으로 확장해 보세요.
  return scores
}


