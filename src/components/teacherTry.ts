/**
 * 교사 관리 파일: 선생님 체험용 학번.
 * 99001~99999는 선생님 체험용입니다. 이름은 학번으로 정해집니다(99001 → 체험1). 실제 선생님 이름은 쓰지 않습니다.
 * 9로 시작하는 학번은 랭킹에 나오지 않습니다(FestivalLive의 AdminRankingSync).
 * 체험 링크(…#try=99001)를 열면 학생 화면에 학번·이름이 미리 채워져서 [등록]만 누르면 됩니다.
 */
export const TRY_FIRST = 99001
export const TRY_LAST = 99999

export function isTryId(studentId: string): boolean {
  const value = Number(studentId)
  return /^\d{5}$/.test(studentId) && value >= TRY_FIRST && value <= TRY_LAST
}

export function tryName(studentId: string): string {
  return `체험${Number(studentId) - TRY_FIRST + 1}`
}

export function tryLink(studentId: string): string {
  return `${window.location.origin}${window.location.pathname}#try=${studentId}`
}

/** 주소 끝이 #try=99001 이면 그 학번과 이름을 돌려줍니다. */
export function readTryHash(hash: string): { studentId: string; name: string } | null {
  const match = hash.match(/^#try=(\d{5})$/)
  return match && isTryId(match[1]!) ? { studentId: match[1]!, name: tryName(match[1]!) } : null
}

/** 아직 안 쓴 체험용 학번을 count개 고릅니다(이미 있는 것 다음 번호부터). */
export function nextTryIds(existing: string[], count: number): string[] {
  const used = new Set(existing.filter(isTryId))
  const ids: string[] = []
  for (let value = TRY_FIRST; value <= TRY_LAST && ids.length < count; value += 1) {
    if (!used.has(String(value))) ids.push(String(value))
  }
  return ids
}
