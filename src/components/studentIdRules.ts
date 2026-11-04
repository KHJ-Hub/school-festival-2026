/**
 * 교사 관리 파일: 등록할 수 있는 학번 범위.
 * 학번 = 학년 1자리 + 반 2자리 + 번호 2자리 (예: 1학년 3반 5번 → 10305).
 * 9로 시작하는 학번(90001 등)은 연습·리허설용으로 늘 쓸 수 있습니다.
 * 운영진 화면에서 바꾸면 settings/idRules에 저장되고, 보안 규칙도 같은 pattern으로 확인합니다.
 */
export type IdRange = { grades: number; classes: number; numbers: number }

export const DEFAULT_ID_RANGE: IdRange = { grades: 3, classes: 12, numbers: 35 }

/** 01, 02, … max 를 "(01|02|…)" 꼴의 정규식 조각으로 만듭니다. */
function twoDigits(max: number): string {
  return `(${Array.from({ length: max }, (_, index) => String(index + 1).padStart(2, '0')).join('|')})`
}

export function clampRange(range: IdRange): IdRange {
  const clamp = (value: number, max: number) => Math.min(max, Math.max(1, Math.floor(Number(value) || 1)))
  return { grades: clamp(range.grades, 8), classes: clamp(range.classes, 99), numbers: clamp(range.numbers, 99) }
}

/** 보안 규칙과 화면이 함께 쓰는 학번 정규식 */
export function idPattern(range: IdRange): string {
  const { grades, classes, numbers } = clampRange(range)
  return `^(9[0-9]{4}|[1-${grades}]${twoDigits(classes)}${twoDigits(numbers)})$`
}

export function isAllowedStudentId(studentId: string, range: IdRange): boolean {
  return new RegExp(idPattern(range)).test(studentId)
}

/** 운영진 화면 안내용: "10101 ~ 31235" */
export function rangeExample(range: IdRange): string {
  const { grades, classes, numbers } = clampRange(range)
  return `10101 ~ ${grades}${String(classes).padStart(2, '0')}${String(numbers).padStart(2, '0')}`
}
