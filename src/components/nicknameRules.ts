/**
 * 교사 관리 파일: 닉네임 규칙(금지어·길이·중복)과 명단 붙여넣기 해석.
 * 저장은 src/data/store.ts가 하고, 여기는 화면 없이도 확인할 수 있는 순수 함수만 둡니다.
 */

/** 운영진 명단 한 줄 (학번·이름). 실제 명단은 코드나 GitHub에 넣지 않고 운영진 화면에서만 입력합니다. */
export type RosterEntry = { studentId: string; name: string }

/** 등록을 마친 학생. 이름은 운영진 화면에서만 보여 줍니다. */
export type Account = { studentId: string; name: string; nickname: string }

/** 기본 금지어. 비교할 때 띄어쓰기·특수문자·숫자를 지우고 소문자로 바꾼 뒤 "포함" 여부로 검사합니다. */
export const BASE_BANNED_WORDS = [
  // 욕설
  '씨발', '시발', '씨팔', '시팔', '쓰발', '씨바', 'ㅅㅂ', 'ㅆㅂ', 'ㅅㅃ', '좆', 'ㅈ같', '존나', '졸라', 'ㅈㄴ',
  '병신', '븅신', '빙신', 'ㅂㅅ', '개새끼', '개새기', '개색', '개색기', '개색끼', '개세끼', 'ㄱㅅㄲ', '새끼야', '지랄', 'ㅈㄹ',
  '미친놈', '미친년', '미친새', 'ㅁㅊ', '닥쳐', '꺼져', '엿먹', '염병', '썅', '쌍년', '쌍놈', '개년', '개놈',
  '느금', '니애미', '니엄마', '니어미', '애미', '애비', '느그', '호로새', '후레', '등신', '찐따', '또라이', '똘추',
  // 비하·혐오 표현
  '애자', '장애새', '한남', '한녀', '김치녀', '된장녀', '틀딱', '급식충', '맘충', '노인충', '짱깨', '쪽바리',
  '깜둥이', '흑형', '똥남아', '게이새', '홍어', '전라디언',
  // 성적 표현
  '섹스', '쎅스', '야동', '보지', '자지', '꼬추', '딸딸이', '자위',
  // 영어
  'fuck', 'shit', 'bitch', 'damn', 'sex', 'porn', 'nigger', 'nigga', 'dick', 'pussy',
  // 운영진 사칭 방지
  '운영진', '관리자', '선생님', 'admin',
]

/** 비교용으로 바꿉니다: 소문자 + 한글(자모 포함)·영문만 남김 → "바 보", "바.보", "바1보"도 같은 글자로 봅니다. */
export function normalizeForCheck(text: string): string {
  return text.toLowerCase().replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-z]/g, '')
}

/** 금지어 그 자체인지(허용 단어로 넣으면 금지어가 통째로 풀리므로 막습니다). */
export function isBannedWordItself(word: string, extraWords: string[] = []): boolean {
  const target = normalizeForCheck(word)
  return [...BASE_BANNED_WORDS, ...extraWords].some((item) => normalizeForCheck(item) === target)
}

/** text 안에서 word가 나오는 모든 시작 위치 */
function positionsOf(text: string, word: string): number[] {
  const found: number[] = []
  for (let at = text.indexOf(word); at >= 0; at = text.indexOf(word, at + 1)) found.push(at)
  return found
}

/**
 * 금지어 찾기. 금지어가 나온 자리가 허용 단어(예: 무지개색) 안에 "통째로" 들어 있을 때만 봐줍니다.
 * 허용 단어 밖으로 한 글자라도 삐져나오면 막습니다 → "무지개색기"는 "개색기"가 무지개색 밖으로 나가서 막힘.
 */
export function findBannedWord(nickname: string, extraWords: string[] = [], allowWords: string[] = []): string | undefined {
  const target = normalizeForCheck(nickname)
  const spans = allowWords
    .map(normalizeForCheck)
    .filter((word) => word.length > 0)
    .flatMap((word) => positionsOf(target, word).map((start) => [start, start + word.length] as const))
  const covered = (start: number, end: number) => spans.some(([from, to]) => from <= start && end <= to)
  return [...BASE_BANNED_WORDS, ...extraWords]
    .map(normalizeForCheck)
    .find((word) => word.length > 0 && positionsOf(target, word).some((start) => !covered(start, start + word.length)))
}

/** 닉네임 검사. 문제가 있으면 학생에게 보여 줄 문구를, 괜찮으면 null을 돌려줍니다. selfId는 닉네임을 바꾸는 본인 학번. */
export function checkNickname(nickname: string, accounts: Account[], extraWords: string[], selfId?: string, allowWords: string[] = []): string | null {
  const value = nickname.trim()
  if (value.length < 2 || value.length > 12) return '닉네임은 2~12글자로 써 주세요.'
  if (normalizeForCheck(value).length === 0) return '닉네임에는 한글이나 영어가 들어가야 해요.'
  // 어떤 낱말 때문인지는 알려 주지 않습니다(금지어 목록을 알아내는 걸 막기 위해).
  if (findBannedWord(value, extraWords, allowWords)) return '쓸 수 없는 낱말이 들어 있어요. 다른 닉네임으로 바꾸거나, 멀쩡한 낱말인데 막혔다면 운영진에게 말해 주세요.'
  const same = normalizeForCheck(value)
  if (accounts.some((account) => account.studentId !== selfId && normalizeForCheck(account.nickname) === same)) {
    return '이미 다른 학생이 쓰는 닉네임이에요. 다른 닉네임을 정해 주세요.'
  }
  return null
}

const ID_TOKEN = /^\d{5}$/
const NAME_TOKEN = /^[가-힣A-Za-z]{2,10}$/

/**
 * 글자 덩어리에서 "학번(5자리) 바로 다음 낱말 = 이름"인 짝을 모두 찾습니다.
 * 명렬표처럼 "연번 학번 이름"이어도, 한 줄에 여러 명이어도, PDF에서 칸마다 줄이 바뀌어도 읽힙니다.
 */
export function findRosterPairs(text: string): RosterEntry[] {
  // 숫자와 한글이 붙어 있으면("20301홍길동") 떼어서 봅니다.
  const tokens = text.replace(/(\d)(?=[가-힣])/g, '$1 ').replace(/([가-힣])(?=\d)/g, '$1 ').split(/[\s,]+/).filter(Boolean)
  const entries: RosterEntry[] = []
  for (let index = 0; index < tokens.length - 1; index += 1) {
    if (!ID_TOKEN.test(tokens[index]!)) continue
    if (NAME_TOKEN.test(tokens[index + 1]!)) {
      entries.push({ studentId: tokens[index]!, name: tokens[index + 1]! })
      index += 1
      continue
    }
    // 이름이 한 글자씩 떨어져 있으면("홍 길 동") 이어 붙입니다(2~5글자).
    let end = index + 1
    while (end < tokens.length && end - index <= 5 && /^[가-힣]$/.test(tokens[end]!)) end += 1
    if (end - index - 1 >= 2) {
      entries.push({ studentId: tokens[index]!, name: tokens.slice(index + 1, end).join('') })
      index = end - 1
    }
  }
  return entries
}

/**
 * 운영진 붙여넣기: "학번 이름", "학번,이름", 명렬표의 "연번 학번 이름" 모두 됩니다.
 * 제목 줄(예: "2학년 3반", "연번 학번 이름")처럼 학번이 없는 줄은 조용히 넘기고,
 * 학번은 있는데 이름을 못 찾은 줄만 따로 돌려줍니다.
 */
export function parseRosterText(text: string): { entries: RosterEntry[]; skipped: string[] } {
  const entries = findRosterPairs(text)
  const found = new Set(entries.map((entry) => entry.studentId))
  const skipped = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => {
    const ids = line.match(/\b\d{5}\b/g)
    return ids !== null && ids.some((id) => !found.has(id))
  })
  // 같은 학번이 여러 번 나오면 마지막 것을 씁니다.
  const unique = [...new Map(entries.map((entry) => [entry.studentId, entry])).values()]
  return { entries: unique, skipped }
}

/**
 * 엑셀·CSV 표를 명단으로 바꿉니다. 위쪽 10줄 안에 "학번"·"이름" 제목 칸이 있으면 그 열을 쓰고,
 * 없으면 첫째 열 = 학번, 둘째 열 = 이름으로 봅니다. 학번이 숫자 5자리가 아닌 줄은 건너뜁니다.
 */
export function rowsToRoster(rows: unknown[][]): { entries: RosterEntry[]; skipped: number } {
  const text = (cell: unknown) => (cell === null || cell === undefined ? '' : String(cell).trim())
  let idCol = 0
  let nameCol = 1
  let start = 0
  for (let index = 0; index < Math.min(rows.length, 10); index += 1) {
    const cells = (rows[index] ?? []).map(text)
    const id = cells.findIndex((cell) => cell.replace(/\s/g, '').includes('학번'))
    const name = cells.findIndex((cell) => cell.replace(/\s/g, '').includes('이름') || cell.replace(/\s/g, '') === '성명')
    if (id >= 0 && name >= 0) {
      idCol = id
      nameCol = name
      start = index + 1
      break
    }
  }
  const entries: RosterEntry[] = []
  let skipped = 0
  for (const row of rows.slice(start)) {
    const studentId = text(row?.[idCol]).replace(/\.0+$/, '')
    const name = text(row?.[nameCol])
    if (!studentId && !name) continue
    if (/^\d{5}$/.test(studentId) && name) entries.push({ studentId, name })
    else skipped += 1
  }
  return { entries, skipped }
}

/** CSV 글자를 표로 나눕니다(쉼표 또는 탭). 엑셀에서 "CSV UTF-8"로 저장한 파일을 기준으로 합니다. */
export function csvToRows(textContent: string): string[][] {
  return textContent.replace(/^\uFEFF/, '').split(/\r?\n/).map((line) => line.split(/[,\t]/).map((cell) => cell.replace(/^"|"$/g, '').trim()))
}
