/**
 * 교사 관리 파일: 닉네임 규칙(금지어·중복)과 학생 등록/다시 들어오기 판단.
 * 학생 과제 파일과 분리해 두었고, 화면 없이도 확인할 수 있게 순수 함수로만 만듭니다.
 */

/** 운영진 명단 한 줄 (학번·이름). 실제 명단은 코드나 GitHub에 넣지 않고 운영진 화면에서만 입력합니다. */
export type RosterEntry = { studentId: string; name: string }

/** 등록을 마친 학생. 이름은 운영진 화면에서만 보여 줍니다. */
export type Account = { studentId: string; name: string; nickname: string }

/** 기본 금지어. 비교할 때 띄어쓰기·특수문자·숫자를 지우고 소문자로 바꾼 뒤 "포함" 여부로 검사합니다. */
export const BASE_BANNED_WORDS = [
  // 욕설
  '씨발', '시발', '씨팔', '시팔', '쓰발', '씨바', 'ㅅㅂ', 'ㅆㅂ', 'ㅅㅃ', '좆', 'ㅈ같', '존나', '졸라', 'ㅈㄴ',
  '병신', '븅신', '빙신', 'ㅂㅅ', '개새끼', '개새기', '개색', '개세끼', 'ㄱㅅㄲ', '새끼야', '지랄', 'ㅈㄹ',
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

export function findBannedWord(nickname: string, extraWords: string[] = []): string | undefined {
  const target = normalizeForCheck(nickname)
  return [...BASE_BANNED_WORDS, ...extraWords]
    .map(normalizeForCheck)
    .find((word) => word.length > 0 && target.includes(word))
}

/** 닉네임 검사. 문제가 있으면 학생에게 보여 줄 문구를, 괜찮으면 null을 돌려줍니다. selfId는 닉네임을 바꾸는 본인 학번. */
export function checkNickname(nickname: string, accounts: Account[], extraWords: string[], selfId?: string): string | null {
  const value = nickname.trim()
  if (value.length < 2 || value.length > 12) return '닉네임은 2~12글자로 써 주세요.'
  if (normalizeForCheck(value).length === 0) return '닉네임에는 한글이나 영어가 들어가야 해요.'
  if (findBannedWord(value, extraWords)) return '쓸 수 없는 닉네임이에요. 다른 닉네임을 정해 주세요.'
  const same = normalizeForCheck(value)
  if (accounts.some((account) => account.studentId !== selfId && normalizeForCheck(account.nickname) === same)) {
    return '이미 다른 학생이 쓰는 닉네임이에요. 다른 닉네임을 정해 주세요.'
  }
  return null
}

export type EntryResult =
  | { ok: true; kind: 'new' | 'reenter'; account: Account }
  | { ok: false; message: string }

/** 등록 또는 다시 들어오기. 학번·이름이 명단과 맞아야 하고, 이미 등록된 학번이면 새로 만들지 않고 다시 들어오기로 처리합니다. */
export function enterStudent(roster: RosterEntry[], accounts: Account[], extraWords: string[], input: { studentId: string; name: string; nickname: string }): EntryResult {
  const studentId = input.studentId.trim()
  const name = input.name.trim()
  if (!/^\d{5}$/.test(studentId)) return { ok: false, message: '학번은 숫자 5자리로 써 주세요.' }
  if (!name) return { ok: false, message: '이름을 써 주세요.' }
  const listed = roster.find((entry) => entry.studentId === studentId)
  if (!listed || listed.name !== name) return { ok: false, message: '명단에 없는 학번이거나 이름이 달라요. 운영진에게 물어보세요.' }

  const existing = accounts.find((account) => account.studentId === studentId)
  if (existing) return { ok: true, kind: 'reenter', account: existing }

  const problem = checkNickname(input.nickname, accounts, extraWords)
  if (problem) return { ok: false, message: problem }
  return { ok: true, kind: 'new', account: { studentId, name, nickname: input.nickname.trim() } }
}

/** 운영진 붙여넣기: 한 줄에 "학번 이름" 또는 "학번,이름". 형식이 틀린 줄은 따로 돌려줍니다. */
export function parseRosterText(text: string): { entries: RosterEntry[]; skipped: string[] } {
  const entries: RosterEntry[] = []
  const skipped: string[] = []
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const match = trimmed.match(/^(\d{5})[\s,\t]+(.+)$/)
    if (match) entries.push({ studentId: match[1]!, name: match[2]!.trim() })
    else skipped.push(trimmed)
  }
  return { entries, skipped }
}
